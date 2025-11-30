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

// Генерация случайных стилей (3-4 доступных, остальные заблокированы)
function generateRandomStyles() {
    const shuffled = [...ALL_STYLES].sort(() => Math.random() - 0.5);
    const availableCount = 3 + Math.floor(Math.random() * 2); // 3 или 4
    const available = shuffled.slice(0, availableCount);
    const blocked = shuffled.slice(availableCount);
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
                lives: 100
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
            lives: 100
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
            player.gladiator = gladiator;
            player.cards = cards || [];
            player.ready = true;
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

    io.to(room.id).emit('battle-started');

    // Симуляция боя
    simulateBattle(gladiator1, gladiator2, (winner) => {
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

        const result = {
            winner: winnerPlayer.id,
            winnerName: winnerPlayer.name,
            loserLives: loserPlayer.lives,
            winnerLives: winnerPlayer.lives,
            gameOver: loserPlayer.lives <= 0,
            player1Id: player1.id,
            player2Id: player2.id,
            gladiator1Health: gladiator1.currentHealth,
            gladiator2Health: gladiator2.currentHealth
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
            // Сброс готовности для следующего раунда
            room.round++;
            setTimeout(() => {
                room.players.forEach(p => {
                    p.hero = null;
                    p.gladiator = null;
                    p.ready = false;
                });
                const styles = generateRandomStyles();
                room.availableStyles = styles.available;
                room.blockedStyles = styles.blocked;
                room.gameState = 'selecting';
                room.battleResult = null;
                io.to(room.id).emit('round-end');
                io.to(room.id).emit('styles-selected', {
                    styles: room.availableStyles,
                    blockedStyles: room.blockedStyles
                });
            }, 3000);
        }
    });
}

// Симуляция боя 1 на 1
function simulateBattle(glad1, glad2, callback) {
    let turn = 0;
    const maxTurns = 500;
    const tickRate = 100; // 100ms между тиками

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
            attack(glad1, glad2);
        }
        
        if (turn % Math.floor(attackInterval2 / tickRate) === 0 && glad2.currentHealth > 0) {
            attack(glad2, glad1);
        }
        
        // Пассивные эффекты
        applyPassiveEffects(glad1, glad2);
        applyPassiveEffects(glad2, glad1);
        
        // Проверка активных способностей
        checkAndUseActiveAbility(glad1, glad2);
        checkAndUseActiveAbility(glad2, glad1);

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
            
            callback(winner);
        }
    }, tickRate);
}

// Атака
function attack(attacker, defender) {
    const damage = calculateDamage(attacker, defender);
    defender.currentHealth -= damage;
    
    // Восстановление маны при атаке
    attacker.mana = Math.min(attacker.maxMana || 200, (attacker.mana || 0) + 5);
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
    // Обновление эффектов замедления
    if (gladiator.slowed && gladiator.slowed > 0) {
        gladiator.slowed--;
        if (gladiator.slowed <= 0) {
            delete gladiator.slowed;
        }
    }
}

// Проверка и использование активной способности
function checkAndUseActiveAbility(gladiator, target) {
    if (!gladiator.active || gladiator.activeCooldown > 0) return;
    if (gladiator.mana < gladiator.active.manaCost) return;
    
    // Используем способность
    gladiator.mana -= gladiator.active.manaCost;
    gladiator.activeCooldown = gladiator.active.cooldown;
    
    const ability = gladiator.active.name;
    
    // Берсеркер Крик (Axe)
    if (ability === 'Берсеркер Крик') {
        gladiator.armor = (gladiator.armor || 0) + 5;
        setTimeout(() => {
            gladiator.armor = Math.max(gladiator.armor - 5, 2);
        }, 3000);
    }
    
    // Божественная Сила (Sven)
    if (ability === 'Божественная Сила') {
        gladiator.damage = (gladiator.damage || 50) * 2;
        gladiator.attackSpeed = (gladiator.attackSpeed || 1) * 1.5;
        setTimeout(() => {
            gladiator.damage = Math.floor(gladiator.damage / 2);
            gladiator.attackSpeed = gladiator.attackSpeed / 1.5;
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
        target.currentHealth -= 300; // Чистый урон
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});
