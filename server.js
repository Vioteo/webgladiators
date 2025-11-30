const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Статические файлы
app.use(express.static(__dirname));

// Игровые комнаты
const rooms = new Map();

// Все стили
const ALL_STYLES = ['critical', 'frost', 'poison', 'fury', 'tank', 'evasion', 'shield', 'ultimate'];

// Генерация уникального ID комнаты
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Генерация случайных стилей (блокируется только 1 стиль)
function generateRandomStyles() {
    const shuffled = [...ALL_STYLES].sort(() => Math.random() - 0.5);
    const blocked = [shuffled[0]]; // Только один заблокированный стиль
    const available = shuffled.slice(1); // Все остальные доступны
    return { available, blocked };
}

// Обработка подключений
io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    socket.on('create-room', (playerName) => {
        const roomId = generateRoomId();
        const styles = generateRandomStyles();
        
        const room = {
            id: roomId,
            players: [{
                id: socket.id,
                name: playerName,
                socket: socket,
                hero: null,
                gladiator: null,
                ready: false,
                lives: 100,
                gold: 10,
                cards: [],
                styleProgress: {} // Прогресс по стилям для расчета шансов
            }],
            gameState: 'waiting', // waiting, selecting, playing
            availableStyles: styles.available,
            blockedStyles: styles.blocked,
            round: 1
        };

        rooms.set(roomId, room);
        socket.join(roomId);
        socket.emit('room-created', roomId);
        socket.emit('game-state', 'waiting');
        console.log(`Комната ${roomId} создана игроком ${playerName}`);
    });

    socket.on('join-room', (data) => {
        const { roomId, playerName } = data;
        const room = rooms.get(roomId);

        if (!room) {
            socket.emit('error', 'Комната не найдена');
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('error', 'Комната заполнена');
            return;
        }

        room.players.push({
            id: socket.id,
            name: playerName,
            socket: socket,
            hero: null,
            gladiator: null,
            ready: false,
            lives: 100,
            gold: 10,
            cards: [],
            styleProgress: {} // Прогресс по стилям для расчета шансов
        });

        socket.join(roomId);
        socket.emit('joined-room', roomId);
        
        // Когда оба игрока подключены, отправляем стили
        io.to(roomId).emit('styles-selected', {
            styles: room.availableStyles,
            blockedStyles: room.blockedStyles
        });
        
        console.log(`Игрок ${playerName} присоединился к комнате ${roomId}`);
    });

    socket.on('select-hero', (data) => {
        const { roomId, hero } = data;
        const room = rooms.get(roomId);
        
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.hero = hero;
            player.ready = false;
            console.log(`Игрок ${player.name} выбрал героя: ${hero.name}`);
            
            // Отправляем обновление противнику
            room.players.forEach(p => {
                if (p.id !== socket.id) {
                    p.socket.emit('hero-selected', {
                        playerId: socket.id,
                        hero: hero
                    });
                }
            });

            // Проверяем, все ли выбрали героев
            if (room.players.every(p => p.hero !== null)) {
                io.to(roomId).emit('all-heroes-selected');
            }
        }
    });

    socket.on('player-ready', (data) => {
        const { roomId, gladiator, cards } = data;
        const room = rooms.get(roomId);
        
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            // Обновляем гладиатора, сохраняя базового героя
            if (player.hero && !gladiator.id) {
                gladiator.id = player.hero.id;
                gladiator.name = player.hero.name;
                gladiator.style = player.hero.style;
                gladiator.passive = player.hero.passive;
                gladiator.active = player.hero.active;
            }
            player.gladiator = gladiator;
            player.cards = cards || [];
            player.ready = true;
            
            // Обновляем прогресс по стилям для расчета шансов
            updateStyleProgress(player);
            console.log(`Игрок ${player.name} готов к бою`);
            
            io.to(roomId).emit('player-ready-status', {
                playerId: socket.id,
                ready: true
            });

            // Если оба игрока готовы, начинаем бой
            if (room.players.length === 2 && room.players.every(p => p.ready)) {
                startBattle(room);
            }
        }
    });

    socket.on('player-not-ready', (data) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
        
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.ready = false;
            
            io.to(roomId).emit('player-ready-status', {
                playerId: socket.id,
                ready: false
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Отключение:', socket.id);
        
        // Удаляем игрока из всех комнат
        for (const [roomId, room] of rooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                
                // Уведомляем другого игрока
                io.to(roomId).emit('player-disconnected');
                
                // Если комната пуста, удаляем её
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                }
                
                break;
            }
        }
    });
});

// Функция симуляции боя (1 на 1)
function startBattle(room) {
    console.log(`Начинается бой в комнате ${room.id}`);
    room.gameState = 'playing';
    
    const [player1, player2] = room.players;
    
    // Копируем гладиаторов для боя
    const gladiator1 = JSON.parse(JSON.stringify(player1.gladiator));
    const gladiator2 = JSON.parse(JSON.stringify(player2.gladiator));
    
    // Инициализация для боя
    gladiator1.currentHealth = gladiator1.maxHealth || gladiator1.health;
    gladiator1.mana = 0;
    gladiator1.activeCooldown = 0;
    
    gladiator2.currentHealth = gladiator2.maxHealth || gladiator2.health;
    gladiator2.mana = 0;
    gladiator2.activeCooldown = 0;

    io.to(room.id).emit('battle-started', {
        gladiator1: { 
            name: gladiator1.name, 
            health: gladiator1.currentHealth, 
            maxHealth: gladiator1.maxHealth, 
            mana: 0,
            maxMana: gladiator1.maxMana || 200,
            effects: getEffectsDisplay(gladiator1)
        },
        gladiator2: { 
            name: gladiator2.name, 
            health: gladiator2.currentHealth, 
            maxHealth: gladiator2.maxHealth, 
            mana: 0,
            maxMana: gladiator2.maxMana || 200,
            effects: getEffectsDisplay(gladiator2)
        }
    });

    const battleLog = [];
    const battleUpdates = [];
    let battleUpdateInterval = null;
    
    // Отправляем обновления боя в реальном времени
    battleUpdateInterval = setInterval(() => {
        if (room.gameState !== 'playing') {
            if (battleUpdateInterval) clearInterval(battleUpdateInterval);
            return;
        }
        
        io.to(room.id).emit('battle-update', {
            gladiator1: {
                name: gladiator1.name,
                health: gladiator1.currentHealth,
                maxHealth: gladiator1.maxHealth,
                mana: gladiator1.mana,
                maxMana: gladiator1.maxMana || 200,
                effects: getEffectsDisplay(gladiator1)
            },
            gladiator2: {
                name: gladiator2.name,
                health: gladiator2.currentHealth,
                maxHealth: gladiator2.maxHealth,
                mana: gladiator2.mana,
                maxMana: gladiator2.maxMana || 200,
                effects: getEffectsDisplay(gladiator2)
            }
        });
    }, 200); // Обновление каждые 200ms
    
    // Симуляция боя
    simulateBattle(gladiator1, gladiator2, (winner, log, updates) => {
        if (battleUpdateInterval) clearInterval(battleUpdateInterval);
        
        let winnerPlayer, loserPlayer;
        
        if (winner === 1) {
            winnerPlayer = player1;
            loserPlayer = player2;
        } else {
            winnerPlayer = player2;
            loserPlayer = player1;
        }

        // Проигравший теряет жизни
        const damageToLives = Math.max(10, Math.floor((loserPlayer.gladiator.maxHealth - (winner === 1 ? gladiator1.currentHealth : gladiator2.currentHealth)) / 50));
        loserPlayer.lives -= damageToLives;
        
        // Восстанавливаем здоровье гладиаторов после боя для следующего раунда
        player1.gladiator.currentHealth = Math.min(gladiator1.currentHealth, player1.gladiator.maxHealth);
        player2.gladiator.currentHealth = Math.min(gladiator2.currentHealth, player2.gladiator.maxHealth);
        
        // Расчет золота с бонусом за не потраченное
        const bonusGold1 = Math.floor((player1.gold || 0) / 5);
        const bonusGold2 = Math.floor((player2.gold || 0) / 5);
        
        player1.gold = (player1.gold || 10) + (winner === 1 ? 5 : 3) + bonusGold1;
        player2.gold = (player2.gold || 10) + (winner === 2 ? 5 : 3) + bonusGold2;

        const result = {
            winner: winnerPlayer.id,
            winnerName: winnerPlayer.name,
            loserLives: loserPlayer.lives,
            winnerLives: winnerPlayer.lives,
            gameOver: loserPlayer.lives <= 0,
            player1Id: player1.id,
            player2Id: player2.id,
            gladiator1Health: gladiator1.currentHealth,
            gladiator2Health: gladiator2.currentHealth,
            player1Gold: player1.gold,
            player2Gold: player2.gold,
            battleLog: log || [],
            battleUpdates: updates || []
        };

        room.battleResult = result;
        io.to(room.id).emit('battle-result', result);

        if (result.gameOver) {
            io.to(room.id).emit('game-over', {
                winner: winnerPlayer.name,
                loser: loserPlayer.name
            });
            
            // Сброс комнаты через 5 секунд
            setTimeout(() => {
                room.players.forEach(p => {
                    p.hero = null;
                    p.gladiator = null;
                    p.ready = false;
                    p.lives = 100;
                });
                room.round = 1;
                const styles = generateRandomStyles();
                room.availableStyles = styles.available;
                room.blockedStyles = styles.blocked;
                room.gameState = 'waiting';
                room.battleResult = null;
                io.to(room.id).emit('restart-game');
            }, 5000);
        } else {
            // Сброс готовности для следующего раунда (герой сохраняется)
            room.round++;
            setTimeout(() => {
                room.players.forEach(p => {
                    p.ready = false;
                });
                // Генерируем новые стили для магазина
                const styles = generateRandomStyles();
                room.availableStyles = styles.available;
                room.blockedStyles = styles.blocked;
                room.gameState = 'preparing';
                room.battleResult = null;
                io.to(room.id).emit('round-end', {
                    player1Gold: player1.gold,
                    player2Gold: player2.gold,
                    availableStyles: styles.available,
                    blockedStyles: styles.blocked
                });
            }, 5000); // Увеличено время для просмотра результата
        }
    });
}

// Симуляция боя 1 на 1
function simulateBattle(glad1, glad2, callback) {
    let turn = 0;
    const maxTurns = 500;
    const tickRate = 100; // 100ms между тиками
    const battleLog = [];
    const battleUpdates = [];
    let lastUpdateTime = 0;

    const battleInterval = setInterval(() => {
        turn++;
        
        // Восстановление маны
        glad1.mana = Math.min(glad1.maxMana || 200, (glad1.mana || 0) + (glad1.style === 'ultimate' ? 3 : 2));
        glad2.mana = Math.min(glad2.maxMana || 200, (glad2.mana || 0) + (glad2.style === 'ultimate' ? 3 : 2));
        
        // Обновление кулдауна
        if (glad1.activeCooldown > 0) glad1.activeCooldown -= tickRate;
        if (glad2.activeCooldown > 0) glad2.activeCooldown -= tickRate;
        
        // Атаки происходят по скорости атаки
        const attackInterval1 = Math.floor(1000 / (glad1.attackSpeed || 1));
        const attackInterval2 = Math.floor(1000 / (glad2.attackSpeed || 1));
        
        if (turn % Math.floor(attackInterval1 / tickRate) === 0 && glad1.currentHealth > 0) {
            const attackResult = attack(glad1, glad2);
            if (attackResult) {
                battleLog.push(`${glad1.name} атакует ${glad2.name} и наносит ${attackResult.damage} урона`);
            }
        }
        
        if (turn % Math.floor(attackInterval2 / tickRate) === 0 && glad2.currentHealth > 0) {
            const attackResult = attack(glad2, glad1);
            if (attackResult) {
                battleLog.push(`${glad2.name} атакует ${glad1.name} и наносит ${attackResult.damage} урона`);
            }
        }
        
        // Пассивные эффекты
        const passive1 = applyPassiveEffects(glad1, glad2);
        const passive2 = applyPassiveEffects(glad2, glad1);
        if (passive1) battleLog.push(passive1);
        if (passive2) battleLog.push(passive2);
        
        // Проверка активных способностей
        const ability1 = checkAndUseActiveAbility(glad1, glad2);
        const ability2 = checkAndUseActiveAbility(glad2, glad1);
        if (ability1) battleLog.push(ability1);
        if (ability2) battleLog.push(ability2);
        
        // Отправляем обновления состояния каждые 500ms для визуализации
        if (turn % 5 === 0) {
            battleUpdates.push({
                time: turn * tickRate / 1000,
                gladiator1: {
                    health: glad1.currentHealth,
                    maxHealth: glad1.maxHealth,
                    mana: glad1.mana,
                    maxMana: glad1.maxMana || 200,
                    effects: getEffectsDisplay(glad1)
                },
                gladiator2: {
                    health: glad2.currentHealth,
                    maxHealth: glad2.maxHealth,
                    mana: glad2.mana,
                    maxMana: glad2.maxMana || 200,
                    effects: getEffectsDisplay(glad2)
                }
            });
        }

        // Проверка окончания боя
        if (glad1.currentHealth <= 0 || glad2.currentHealth <= 0 || turn >= maxTurns) {
            clearInterval(battleInterval);
            
            let winner;
            if (glad1.currentHealth > 0 && glad2.currentHealth <= 0) {
                winner = 1;
            } else if (glad2.currentHealth > 0 && glad1.currentHealth <= 0) {
                winner = 2;
            } else {
                // Ничья - побеждает тот, у кого больше здоровья
                winner = glad1.currentHealth > glad2.currentHealth ? 1 : 2;
            }
            
            callback(winner, battleLog.slice(-50), battleUpdates); // Отправляем последние 50 записей лога
        }
    }, tickRate);
}

// Атака
function attack(attacker, defender) {
    const damage = calculateDamage(attacker, defender);
    defender.currentHealth = Math.max(0, defender.currentHealth - damage);
    
    // Восстановление маны при атаке
    const oldMana = attacker.mana || 0;
    attacker.mana = Math.min(attacker.maxMana || 200, oldMana + 5);
    
    return { damage, manaGained: attacker.mana - oldMana };
}

// Расчет урона
function calculateDamage(attacker, defender) {
    let damage = attacker.damage || 50;
    
    // Пассивные способности
    if (attacker.passive) {
        damage = applyPassiveAbility(attacker, defender, damage);
    }
    
    // Эффекты карточек
    if (attacker.effects) {
        if (attacker.effects.critChance && Math.random() < (attacker.effects.critChance / 100)) {
            const critMultiplier = 2 + ((attacker.effects.critDamage || 0) / 100);
            damage *= critMultiplier;
        }
    }
    
    // Учет брони
    const armor = defender.armor || 0;
    const armorReduction = armor * 0.06 / (1 + armor * 0.06);
    damage = damage * (1 - armorReduction);
    
    return Math.max(1, Math.floor(damage));
}

// Применение пассивной способности
function applyPassiveAbility(gladiator, target, damage) {
    if (!gladiator.passive) return damage;
    
    const passive = gladiator.passive.name;
    
    // Берсерк (Axe) - увеличение брони при потере здоровья
    if (passive === 'Берсерк') {
        const healthLost = 1 - (gladiator.currentHealth / gladiator.maxHealth);
        gladiator.armor = (gladiator.armor || 2) + Math.floor(healthLost * 5);
    }
    
    // Божественная Сила (Sven) - шанс крита
    if (passive === 'Божественная Сила' && Math.random() < 0.2) {
        damage *= 2;
    }
    
    // Морозные Стрелы (Drow) - замедление
    if (passive === 'Морозные Стрелы') {
        if (!target.slowed) target.slowed = 0;
        target.slowed = Math.max(target.slowed, 2); // 2 секунды
    }
    
    // Гниение (Pudge) - периодический урон
    if (passive === 'Гниение') {
        target.currentHealth -= 10;
    }
    
    // Удар в спину (Riki) - крит сзади (упрощенно - просто шанс крита)
    if (passive === 'Удар в спину' && Math.random() < 0.3) {
        damage *= 2.5;
    }
    
    // Восстановление маны (Crystal Maiden) - уже учтено в симуляции
    if (passive === 'Восстановление маны') {
        gladiator.mana = Math.min(gladiator.maxMana || 200, (gladiator.mana || 0) + 2);
    }
    
    // Танец клинка (Juggernaut) - уклонение и контратака
    if (passive === 'Танец клинка' && Math.random() < 0.25) {
        // Уклонение обрабатывается при атаке
        return 0; // Уклонение
    }
    
    // Жар (Lina) - увеличение скорости атаки
    if (passive === 'Жар') {
        if (!gladiator.heatStacks) gladiator.heatStacks = 0;
        gladiator.heatStacks = Math.min(gladiator.heatStacks + 1, 10);
        gladiator.attackSpeed = (gladiator.attackSpeed || 1) * (1 + gladiator.heatStacks * 0.05);
    }
    
    return damage;
}

// Применение пассивных эффектов
function applyPassiveEffects(gladiator, target) {
    let logMessage = null;
    
    // Обновление эффектов замедления
    if (gladiator.slowed && gladiator.slowed > 0) {
        gladiator.slowed--;
        if (gladiator.slowed <= 0) {
            delete gladiator.slowed;
        }
    }
    
    // Гниение (Pudge) - периодический урон
    if (gladiator.passive && gladiator.passive.name === 'Гниение') {
        target.currentHealth = Math.max(0, target.currentHealth - 10);
        logMessage = `${gladiator.name}: Гниение наносит 10 урона ${target.name}`;
    }
    
    return logMessage;
}

// Проверка и использование активной способности
function checkAndUseActiveAbility(gladiator, target) {
    if (!gladiator.active || gladiator.activeCooldown > 0) return null;
    if (gladiator.mana < gladiator.active.manaCost) return null;
    
    // Используем способность
    gladiator.mana -= gladiator.active.manaCost;
    gladiator.activeCooldown = gladiator.active.cooldown;
    
    const ability = gladiator.active.name;
    let logMessage = `${gladiator.name} использует ${ability}!`;
    
    // Берсеркер Крик (Axe)
    if (ability === 'Берсеркер Крик') {
        const oldArmor = gladiator.armor || 0;
        gladiator.armor = oldArmor + 5;
        gladiator.armorBoost = (gladiator.armorBoost || 0) + 5;
        logMessage += ` Броня +5!`;
        setTimeout(() => {
            gladiator.armor = Math.max(gladiator.armor - 5, 2);
            gladiator.armorBoost = Math.max((gladiator.armorBoost || 0) - 5, 0);
        }, 3000);
    }
    
    // Божественная Сила (Sven)
    if (ability === 'Божественная Сила') {
        const baseDamage = gladiator.damage || 50;
        const baseSpeed = gladiator.attackSpeed || 1;
        gladiator.damage = baseDamage * 2;
        gladiator.attackSpeed = baseSpeed * 1.5;
        gladiator.damageBoost = baseDamage;
        gladiator.attackSpeedBoost = baseSpeed * 0.5;
        logMessage += ` Урон x2, Скорость x1.5!`;
        setTimeout(() => {
            gladiator.damage = baseDamage;
            gladiator.attackSpeed = baseSpeed;
            gladiator.damageBoost = 0;
            gladiator.attackSpeedBoost = 0;
        }, 5000);
    }
    
    // Молчание (Drow)
    if (ability === 'Молчание') {
        target.currentHealth -= 150;
        target.slowed = (target.slowed || 0) + 2;
    }
    
    // Крюк (Pudge)
    if (ability === 'Крюк') {
        target.currentHealth -= 200;
    }
    
    // Невидимость (Riki)
    if (ability === 'Невидимость') {
        gladiator.invisible = true;
        gladiator.nextAttackMultiplier = 3;
        setTimeout(() => {
            gladiator.invisible = false;
        }, 3000);
    }
    
    // Ледяной Взрыв (Crystal Maiden)
    if (ability === 'Ледяной Взрыв') {
        target.currentHealth -= 180;
        target.slowed = (target.slowed || 0) + 4;
    }
    
    // Вихрь (Juggernaut)
    if (ability === 'Вихрь') {
        gladiator.invulnerable = true;
        const vortexInterval = setInterval(() => {
            target.currentHealth -= 50;
            if (!gladiator.invulnerable) {
                clearInterval(vortexInterval);
            }
        }, 1000);
        setTimeout(() => {
            gladiator.invulnerable = false;
            clearInterval(vortexInterval);
        }, 5000);
    }
    
    // Лагуна Блейд (Lina)
    if (ability === 'Лагуна Блейд') {
        target.currentHealth = Math.max(0, target.currentHealth - 300); // Чистый урон
        logMessage += ` Наносит 300 урона ${target.name}!`;
    }
    
    return logMessage;
}

// Получение эффектов для отображения
function getEffectsDisplay(gladiator) {
    const effects = {
        positive: [],
        negative: []
    };
    
    // Ярость (положительный)
    if (gladiator.furyStacks && gladiator.furyStacks > 0) {
        effects.positive.push({ name: 'Ярость', stacks: gladiator.furyStacks, icon: '⚡' });
    }
    
    // Замедление (негативный)
    if (gladiator.slowed && gladiator.slowed > 0) {
        effects.negative.push({ name: 'Замедление', stacks: gladiator.slowed, icon: '❄️' });
    }
    
    // Мороз стаки (негативный)
    if (gladiator.frostStacks && gladiator.frostStacks > 0) {
        effects.negative.push({ name: 'Мороз', stacks: gladiator.frostStacks, icon: '🧊' });
    }
    
    // Яд стаки (негативный)
    if (gladiator.poisonStacks && gladiator.poisonStacks > 0) {
        effects.negative.push({ name: 'Яд', stacks: gladiator.poisonStacks, icon: '☠️' });
    }
    
    // Усиление брони (положительный)
    if (gladiator.armorBoost && gladiator.armorBoost > 0) {
        effects.positive.push({ name: 'Броня +', stacks: gladiator.armorBoost, icon: '🛡️' });
    }
    
    // Усиление урона (положительный)
    if (gladiator.damageBoost && gladiator.damageBoost > 0) {
        effects.positive.push({ name: 'Урон +', stacks: Math.round(gladiator.damageBoost), icon: '⚔️' });
    }
    
    // Усиление скорости атаки (положительный)
    if (gladiator.attackSpeedBoost && gladiator.attackSpeedBoost > 0) {
        effects.positive.push({ name: 'Скорость +', stacks: Math.round(gladiator.attackSpeedBoost * 100), icon: '💨' });
    }
    
    // Жар стаки (положительный для Lina)
    if (gladiator.heatStacks && gladiator.heatStacks > 0) {
        effects.positive.push({ name: 'Жар', stacks: gladiator.heatStacks, icon: '🔥' });
    }
    
    // Невидимость (положительный)
    if (gladiator.invisible) {
        effects.positive.push({ name: 'Невидимость', stacks: 1, icon: '👻' });
    }
    
    // Неуязвимость (положительный)
    if (gladiator.invulnerable) {
        effects.positive.push({ name: 'Неуязвимость', stacks: 1, icon: '✨' });
    }
    
    return effects;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});
