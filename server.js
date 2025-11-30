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

// Нейтральные монстры для раундов 2, 4, 6
const NEUTRAL_MONSTERS = [
    { // Раунд 2
        name: 'Гоблин-Вождь',
        health: 15000,
        damage: 80,
        armor: 3,
        attackSpeed: 1.5,
        tier: 1
    },
    { // Раунд 4
        name: 'Тролль-Берсерк',
        health: 25000,
        damage: 120,
        armor: 5,
        attackSpeed: 1.3,
        tier: 2
    },
    { // Раунд 6
        name: 'Дракон-Разрушитель',
        health: 40000,
        damage: 180,
        armor: 8,
        attackSpeed: 1.2,
        tier: 3
    }
];

// Награды (шмотки) по тирам
const NEUTRAL_REWARDS = {
    1: [ // Тир 1 (раунд 2)
        { type: 'health', value: 1500, name: 'Бустер здоровья +1500' },
        { type: 'damage', value: 75, name: 'Усиление урона +75' },
        { type: 'armor', value: 3, name: 'Броня +3' },
        { type: 'attackSpeed', value: 15, name: 'Скорость атаки +15%' },
        { type: 'gold', value: 50, name: 'Золото +50' }
    ],
    2: [ // Тир 2 (раунд 4)
        { type: 'health', value: 2500, name: 'Бустер здоровья +2500' },
        { type: 'damage', value: 125, name: 'Усиление урона +125' },
        { type: 'armor', value: 5, name: 'Броня +5' },
        { type: 'attackSpeed', value: 25, name: 'Скорость атаки +25%' },
        { type: 'gold', value: 100, name: 'Золото +100' }
    ],
    3: [ // Тир 3 (раунд 6)
        { type: 'health', value: 4000, name: 'Бустер здоровья +4000' },
        { type: 'damage', value: 200, name: 'Усиление урона +200' },
        { type: 'armor', value: 8, name: 'Броня +8' },
        { type: 'attackSpeed', value: 40, name: 'Скорость атаки +40%' },
        { type: 'gold', value: 200, name: 'Золото +200' }
    ]
};

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

// Обновление прогресса по стилям
function updateStyleProgress(player) {
    player.styleProgress = {};
    
    // Подсчитываем купленные карты по стилям
    player.cards.forEach(card => {
        if (!player.styleProgress[card.style]) {
            player.styleProgress[card.style] = {
                total: 0,
                byRarity: {
                    common: 0,
                    uncommon: 0,
                    rare: 0,
                    epic: 0,
                    legendary: 0
                }
            };
        }
        player.styleProgress[card.style].total++;
        player.styleProgress[card.style].byRarity[card.rarity]++;
    });
}

// Функция для отправки списка комнат всем
function broadcastRoomList() {
    const roomList = Array.from(rooms.values())
        .filter(room => {
            // Показываем только комнаты, где есть активные игроки
            return room.players.some(p => p.socket) && room.players.length < 2;
        })
        .map(room => ({
            id: room.id,
            players: room.players.filter(p => p.socket).length,
            maxPlayers: 2,
            gameState: room.gameState,
            round: room.round,
            playerNames: room.players.filter(p => p.socket).map(p => p.name),
            createdAt: room.createdAt || 0
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    io.emit('room-list', roomList);
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
                gold: 100,
                cards: [],
                styleProgress: {} // Прогресс по стилям для расчета шансов
            }],
            gameState: 'waiting', // waiting, selecting, playing
            availableStyles: styles.available,
            blockedStyles: styles.blocked,
            round: 1,
            createdAt: Date.now()
        };

        rooms.set(roomId, room);
        socket.join(roomId);
        socket.emit('room-created', roomId);
        socket.emit('game-state', 'waiting');
        
        // Отправляем обновленный список комнат всем
        broadcastRoomList();
        
        console.log(`Комната ${roomId} создана игроком ${playerName}`);
    });
    
    // Запрос списка комнат
    socket.on('get-rooms', () => {
        const roomList = Array.from(rooms.values())
            .filter(room => room.players.length < 2)
            .map(room => ({
                id: room.id,
                players: room.players.length,
                maxPlayers: 2,
                gameState: room.gameState,
                round: room.round
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
        
        socket.emit('room-list', roomList);
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

        // Проверяем переподключение (игрок с таким именем уже в комнате)
        const existingPlayer = room.players.find(p => p.name === playerName);
        
        if (existingPlayer) {
            if (existingPlayer.id === socket.id) {
                // Это тот же сокет - просто подтверждаем
                socket.emit('joined-room', roomId);
                return;
            } else if (!existingPlayer.socket || !existingPlayer.socket.connected) {
                // Переподключение - восстанавливаем состояние
                existingPlayer.id = socket.id;
                existingPlayer.socket = socket;
                socket.emit('reconnected', {
                    gameState: room.gameState,
                    hero: existingPlayer.hero,
                    gladiator: existingPlayer.gladiator,
                    cards: existingPlayer.cards,
                    gold: existingPlayer.gold,
                    lives: existingPlayer.lives,
                    round: room.round,
                    availableStyles: room.availableStyles,
                    blockedStyles: room.blockedStyles
                });
                socket.emit('joined-room', roomId);
                console.log(`Игрок ${playerName} переподключился`);
                broadcastRoomList();
                return;
            } else {
                // Игрок с таким именем уже подключен - ошибка
                socket.emit('error', 'Игрок с таким именем уже в комнате');
                return;
            }
        }
        
        // Новый игрок - добавляем в комнату
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
            gold: 100,
            cards: [],
            styleProgress: {},
            playerId: socket.id
        });

        socket.join(roomId);
        socket.emit('joined-room', roomId);
        
        // Отправляем обновленный список комнат
        broadcastRoomList();
        
        // Когда оба игрока подключены, отправляем стили
        if (room.players.length === 2) {
            io.to(roomId).emit('styles-selected', {
                styles: room.availableStyles,
                blockedStyles: room.blockedStyles,
                playerNames: room.players.map(p => ({ id: p.id, name: p.name }))
            });
        }
        
        console.log(`Игрок ${playerName} присоединился к комнате ${roomId}. Игроков в комнате: ${room.players.length}`);
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
            
            // Обновляем прогресс по стилям для расчета шансов (если карты есть)
            if (player.cards.length > 0) {
                updateStyleProgress(player);
            }
            console.log(`Игрок ${player.name} готов к бою`);
            
            io.to(roomId).emit('player-ready-status', {
                playerId: socket.id,
                ready: true
            });

            // Если оба игрока готовы, начинаем бой (или бой с нейтралом)
            if (room.players.length === 2 && room.players.every(p => p.ready)) {
                // Проверяем, нужно ли бить с нейтральным монстром (раунды 2, 4, 6)
                if (room.round === 2 || room.round === 4 || room.round === 6) {
                    startNeutralBattle(room);
                } else {
                    startBattle(room);
                }
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

    // Симуляция боя (обновления отправляются внутри функции)
    simulateBattle(gladiator1, gladiator2, room.id, (winner, log, updates) => {
        
        let winnerPlayer, loserPlayer;
        
        if (winner === 1) {
            winnerPlayer = player1;
            loserPlayer = player2;
        } else {
            winnerPlayer = player2;
            loserPlayer = player1;
        }

        // Проигравший теряет жизни: фиксированно 10 + количество раундов
        const damageToLives = 10 + room.round;
        loserPlayer.lives -= damageToLives;
        
        // Восстанавливаем здоровье гладиаторов после боя для следующего раунда
        player1.gladiator.currentHealth = Math.min(gladiator1.currentHealth, player1.gladiator.maxHealth);
        player2.gladiator.currentHealth = Math.min(gladiator2.currentHealth, player2.gladiator.maxHealth);
        
        // Расчет золота с бонусом за не потраченное (за каждые 5 золота +1)
        const bonusGold1 = Math.floor((player1.gold || 0) / 5);
        const bonusGold2 = Math.floor((player2.gold || 0) / 5);
        
        player1.gold = (player1.gold || 100) + (winner === 1 ? 5 : 3) + bonusGold1;
        player2.gold = (player2.gold || 100) + (winner === 2 ? 5 : 3) + bonusGold2;

        const result = {
            winner: winnerPlayer.id,
            winnerName: winnerPlayer.name,
            loserLives: loserPlayer.lives,
            winnerLives: winnerPlayer.lives,
            gameOver: loserPlayer.lives <= 0,
            player1Id: player1.id,
            player2Id: player2.id,
            player1Name: player1.name,
            player2Name: player2.name,
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
                    p.gold = 100;
                    p.cards = [];
                    p.styleProgress = {};
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
                    player1Id: player1.id,
                    player2Id: player2.id,
                    availableStyles: styles.available,
                    blockedStyles: styles.blocked
                });
            }, 5000); // Увеличено время для просмотра результата
        }
    });
}

// Функция боя с нейтральным монстром
function startNeutralBattle(room) {
    console.log(`Начинается бой с нейтральным монстром в комнате ${room.id}, раунд ${room.round}`);
    room.gameState = 'playing';
    
    const [player1, player2] = room.players;
    const monsterIndex = (room.round / 2) - 1; // 0 для раунда 2, 1 для 4, 2 для 6
    const monster = JSON.parse(JSON.stringify(NEUTRAL_MONSTERS[monsterIndex]));
    const tier = monster.tier;
    
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
    
    monster.currentHealth = monster.health;
    monster.mana = 0;
    monster.maxHealth = monster.health;
    
    // Бой происходит по очереди: сначала первый игрок, потом второй
    const fightPlayer = (playerGlad, player, isPlayer1, callback) => {
        const playerMonster = JSON.parse(JSON.stringify(monster));
        
        io.to(player.id).emit('neutral-battle-started', {
            gladiator: { 
                name: playerGlad.name, 
                health: playerGlad.currentHealth, 
                maxHealth: playerGlad.maxHealth, 
                mana: 0,
                maxMana: playerGlad.maxMana || 200,
                effects: getEffectsDisplay(playerGlad)
            },
            monster: {
                name: playerMonster.name,
                health: playerMonster.currentHealth,
                maxHealth: playerMonster.maxHealth
            },
            tier: tier
        });
        
        simulateBattle(playerGlad, playerMonster, room.id, (winner, log, updates) => {
            callback(winner === 1, playerGlad, tier);
        }, true); // true = нейтральный бой (игрок против монстра)
    };
    
    // Оба игрока сражаются одновременно (отдельные бои)
    let player1Won = false;
    let player2Won = false;
    let completed = 0;
    
    const onComplete = (isPlayer1, won, gladiator) => {
        if (isPlayer1) {
            player1Won = won;
            if (won) {
                player1.gladiator = gladiator; // Обновляем гладиатора после боя
            }
        } else {
            player2Won = won;
            if (won) {
                player2.gladiator = gladiator; // Обновляем гладиатора после боя
            }
        }
        
        completed++;
        if (completed === 2) {
            // Оба боя завершены, раздаем награды
            handleNeutralBattleRewards(room, player1, player2, player1Won, player2Won, tier);
        }
    };
    
    fightPlayer(gladiator1, player1, true, (won, glad) => onComplete(true, won, glad));
    fightPlayer(gladiator2, player2, false, (won, glad) => onComplete(false, won, glad));
}

// Обработка наград за бой с нейтралом
function handleNeutralBattleRewards(room, player1, player2, player1Won, player2Won, tier) {
    const rewards = NEUTRAL_REWARDS[tier];
    
    // Генерируем 3 случайные награды для выбора
    const generateRewardOptions = () => {
        const options = [];
        const shuffled = [...rewards].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    };
    
    // Обработка награды для игрока
    const giveReward = (player, won, reward) => {
        if (!reward) return;
        
        switch(reward.type) {
            case 'health':
                player.gladiator.maxHealth += reward.value;
                player.gladiator.currentHealth += reward.value;
                break;
            case 'damage':
                player.gladiator.damage += reward.value;
                break;
            case 'armor':
                player.gladiator.armor += reward.value;
                break;
            case 'attackSpeed':
                player.gladiator.attackSpeed += reward.value / 100;
                break;
            case 'gold':
                player.gold += reward.value;
                break;
        }
    };
    
    if (player1Won) {
        const options = generateRewardOptions();
        player1.socket.emit('choose-neutral-reward', { options, tier });
        player1.pendingReward = { options, won: true, tier };
    } else {
        // Случайная награда при поражении
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        giveReward(player1, false, randomReward);
        player1.socket.emit('neutral-battle-result', { 
            won: false, 
            reward: randomReward,
            tier 
        });
        room.neutralRewardChoices.player1 = true;
    }
    
    if (player2Won) {
        const options = generateRewardOptions();
        player2.socket.emit('choose-neutral-reward', { options, tier });
        player2.pendingReward = { options, won: true, tier };
    } else {
        // Случайная награда при поражении
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        giveReward(player2, false, randomReward);
        player2.socket.emit('neutral-battle-result', { 
            won: false, 
            reward: randomReward,
            tier 
        });
        room.neutralRewardChoices.player2 = true;
    }
    
    // Инициализация ожидания выбора наград
    room.neutralRewardWaiting = true;
    if (!room.neutralRewardChoices) {
        room.neutralRewardChoices = {};
    }
    
    // Если оба уже получили награды (поражения), продолжаем игру сразу
    if (room.neutralRewardChoices.player1 && room.neutralRewardChoices.player2 && !player1Won && !player2Won) {
        continueAfterNeutralBattle(room, player1, player2);
    }
    
    // Таймер на случай, если выбор затянется
    setTimeout(() => {
        if (room.neutralRewardWaiting) {
            continueAfterNeutralBattle(room, player1, player2);
        }
    }, 15000);
}

// Продолжение игры после нейтрального боя
function continueAfterNeutralBattle(room, player1, player2) {
    if (!room.neutralRewardWaiting) return;
    room.neutralRewardWaiting = false;
    
    room.round++; // Увеличиваем раунд после нейтрального боя
    
    setTimeout(() => {
        room.players.forEach(p => {
            p.ready = false;
        });
        room.gameState = 'preparing';
        const styles = generateRandomStyles();
        room.availableStyles = styles.available;
        room.blockedStyles = styles.blocked;
        io.to(room.id).emit('round-end', {
            player1Gold: player1.gold,
            player2Gold: player2.gold,
            player1Id: player1.id,
            player2Id: player2.id,
            availableStyles: styles.available,
            blockedStyles: styles.blocked,
            round: room.round
        });
    }, 2000);
}

// Симуляция боя 1 на 1
function simulateBattle(glad1, glad2, roomId, callback) {
    let turn = 0;
    const maxTurns = 500;
    const tickRate = 300; // 300ms между тиками (было 100ms - теперь бои медленнее)
    const battleLog = [];
    const battleUpdates = [];
    let battleEnded = false;

    const battleInterval = setInterval(() => {
        if (battleEnded) {
            clearInterval(battleInterval);
            return;
        }
        
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
                const critText = attackResult.isCrit ? ' КРИТИЧЕСКИЙ УДАР!' : '';
                const blockText = attackResult.blockedDamage > 0 ? ` (Заблокировано ${attackResult.blockedDamage})` : '';
                battleLog.push(`${glad1.name} атакует ${glad2.name} и наносит ${attackResult.damage} урона${critText}${blockText}`);
                // Отправляем информацию об уроне для анимации
                io.to(roomId).emit('battle-damage', {
                    target: 2,
                    damage: attackResult.damage,
                    isCrit: attackResult.isCrit || false,
                    isEvaded: false,
                    blockedDamage: attackResult.blockedDamage || 0
                });
                
                // Лечение при атаке
                if (attackResult.healOnHit > 0) {
                    io.to(roomId).emit('battle-heal', {
                        target: 1,
                        amount: attackResult.healOnHit
                    });
                }
            }
        }
        
        if (turn % Math.floor(attackInterval2 / tickRate) === 0 && glad2.currentHealth > 0) {
            const attackResult = attack(glad2, glad1);
            if (attackResult) {
                const critText = attackResult.isCrit ? ' КРИТИЧЕСКИЙ УДАР!' : '';
                const blockText = attackResult.blockedDamage > 0 ? ` (Заблокировано ${attackResult.blockedDamage})` : '';
                battleLog.push(`${glad2.name} атакует ${glad1.name} и наносит ${attackResult.damage} урона${critText}${blockText}`);
                // Отправляем информацию об уроне для анимации
                io.to(roomId).emit('battle-damage', {
                    target: 1,
                    damage: attackResult.damage,
                    isCrit: attackResult.isCrit || false,
                    isEvaded: false,
                    blockedDamage: attackResult.blockedDamage || 0
                });
                
                // Лечение при атаке
                if (attackResult.healOnHit > 0) {
                    io.to(roomId).emit('battle-heal', {
                        target: 2,
                        amount: attackResult.healOnHit
                    });
                }
            }
        }
        
        // Пассивные эффекты
        const passive1 = applyPassiveEffects(glad1, glad2);
        const passive2 = applyPassiveEffects(glad2, glad1);
        if (passive1) {
            battleLog.push(passive1.message || passive1);
            if (passive1.heal) {
                io.to(roomId).emit('battle-heal', {
                    target: 1,
                    amount: passive1.heal
                });
            }
        }
        if (passive2) {
            battleLog.push(passive2.message || passive2);
            if (passive2.heal) {
                io.to(roomId).emit('battle-heal', {
                    target: 2,
                    amount: passive2.heal
                });
            }
        }
        
        // Проверка активных способностей
        const ability1 = checkAndUseActiveAbility(glad1, glad2);
        const ability2 = checkAndUseActiveAbility(glad2, glad1);
        if (ability1) battleLog.push(ability1);
        if (ability2) battleLog.push(ability2);
        
        // Отправляем обновления состояния каждые 600ms для визуализации
        if (turn % 2 === 0) { // Every 2 ticks (600ms при tickRate 300ms)
            const update = {
                time: turn * tickRate / 1000, // Время боя в секундах
                gladiator1: {
                    name: glad1.name,
                    id: glad1.id,
                    health: Math.max(0, glad1.currentHealth),
                    maxHealth: glad1.maxHealth,
                    mana: glad1.mana,
                    maxMana: glad1.maxMana || 200,
                    effects: getEffectsDisplay(glad1)
                },
                gladiator2: {
                    name: glad2.name,
                    id: glad2.id,
                    health: Math.max(0, glad2.currentHealth),
                    maxHealth: glad2.maxHealth,
                    mana: glad2.mana,
                    maxMana: glad2.maxMana || 200,
                    effects: getEffectsDisplay(glad2)
                }
            };
            
            battleUpdates.push(update);
            
            // Отправляем обновление на клиент в реальном времени
            io.to(roomId).emit('battle-update', update);
        }

        // Проверка окончания боя - только когда HP действительно доходит до 0
        if (glad1.currentHealth <= 0 || glad2.currentHealth <= 0 || turn >= maxTurns) {
            battleEnded = true;
            clearInterval(battleInterval);
            
            // Отправляем финальное обновление с HP = 0
            const finalUpdate = {
                time: turn * tickRate / 1000,
                gladiator1: {
                    name: glad1.name,
                    id: glad1.id,
                    health: Math.max(0, glad1.currentHealth),
                    maxHealth: glad1.maxHealth,
                    mana: glad1.mana,
                    maxMana: glad1.maxMana || 200,
                    effects: getEffectsDisplay(glad1)
                },
                gladiator2: {
                    name: glad2.name,
                    id: glad2.id,
                    health: Math.max(0, glad2.currentHealth),
                    maxHealth: glad2.maxHealth,
                    mana: glad2.mana,
                    maxMana: glad2.maxMana || 200,
                    effects: getEffectsDisplay(glad2)
                }
            };
            
            io.to(roomId).emit('battle-update', finalUpdate);
            
            // Ждем 1.5 секунды для завершения визуализации, затем отправляем результат
            setTimeout(() => {
                let winner;
                if (glad1.currentHealth > 0 && glad2.currentHealth <= 0) {
                    winner = 1;
                } else if (glad2.currentHealth > 0 && glad1.currentHealth <= 0) {
                    winner = 2;
                } else {
                    // Ничья - побеждает тот, у кого больше здоровья
                    winner = glad1.currentHealth > glad2.currentHealth ? 1 : 2;
                }
                
                callback(winner, battleLog.slice(-50), battleUpdates);
            }, 1500); // Ждем 1.5 секунды для завершения визуализации
        }
    }, tickRate);
}

// Атака
function attack(attacker, defender) {
    // Проверка уклонения
    if (defender.effects && defender.effects.evasionChance) {
        const evasionRoll = Math.random() * 100;
        if (evasionRoll < defender.effects.evasionChance) {
            return { 
                damage: 0, 
                manaGained: 0, 
                isEvaded: true,
                isCrit: false,
                healOnHit: 0
            };
        }
    }
    
    // Проверяем множитель от невидимости (Riki)
    let damageMultiplier = 1;
    if (attacker.nextAttackMultiplier && attacker.nextAttackMultiplier > 1) {
        damageMultiplier = attacker.nextAttackMultiplier;
        attacker.nextAttackMultiplier = 1; // Сбрасываем после использования
    }
    
    const damageResult = calculateDamage(attacker, defender);
    let damage = damageResult.damage;
    let isCrit = damageResult.isCrit || false;
    const blockedDamage = damageResult.blockedDamage || 0;
    
    // Применяем множитель от невидимости
    if (damageMultiplier > 1) {
        damage = Math.floor(damage * damageMultiplier);
        isCrit = true; // Невидимый удар всегда крит
    }
    
    // Проверяем крит от пассивной способности
    if (attacker.passiveCrit) {
        isCrit = true;
        attacker.passiveCrit = false; // Сбрасываем флаг
    }
    
    defender.currentHealth = Math.max(0, defender.currentHealth - damage);
    
    // Лечение при атаке (эффект карточек)
    let healOnHit = 0;
    if (attacker.effects && attacker.effects.healOnHit) {
        healOnHit = attacker.effects.healOnHit;
        attacker.currentHealth = Math.min(attacker.maxHealth, attacker.currentHealth + healOnHit);
    }
    
    // Восстановление маны при атаке
    const oldMana = attacker.mana || 0;
    attacker.mana = Math.min(attacker.maxMana || 200, oldMana + 5);
    
    return { 
        damage: Math.floor(damage), 
        manaGained: attacker.mana - oldMana,
        isCrit: isCrit,
        isEvaded: false,
        healOnHit: healOnHit,
        blockedDamage: blockedDamage
    };
}

// Расчет урона
function calculateDamage(attacker, defender) {
    let damage = attacker.damage || 50;
    let isCrit = false;
    
    // Пассивные способности
    if (attacker.passive) {
        damage = applyPassiveAbility(attacker, defender, damage);
    }
    
    // Эффекты карточек
    if (attacker.effects) {
        // Критический урон
        if (attacker.effects.critChance && Math.random() < (attacker.effects.critChance / 100)) {
            const critMultiplier = 2 + ((attacker.effects.critDamage || 0) / 100);
            damage *= critMultiplier;
            isCrit = true;
        }
        
        // Урон мороза
        if (attacker.effects.frostDamage) {
            damage += attacker.effects.frostDamage;
        }
        
        // Урон при ярости
        if (attacker.effects.furyDamage && attacker.furyStacks && attacker.furyStacks > 0) {
            damage += attacker.effects.furyDamage;
        }
        
        // Урон ульты (если используется активная способность)
        if (attacker.effects.ultDamage && attacker.active && attacker.active.name.includes('Лагуна') || attacker.active.name.includes('Finger')) {
            damage += attacker.effects.ultDamage;
        }
    }
    
    // Учет брони
    const armor = defender.armor || 0;
    const armorReduction = armor * 0.06 / (1 + armor * 0.06);
    damage = damage * (1 - armorReduction);
    
    // Отражение урона от щита
    if (defender.effects && defender.effects.reflect) {
        const reflectedDamage = damage * (defender.effects.reflect / 100);
        attacker.currentHealth = Math.max(0, attacker.currentHealth - reflectedDamage);
    }
    
    // Блок от щита
    let blockedDamage = 0;
    if (defender.effects && defender.effects.shieldBlock) {
        const originalDamage = damage;
        damage = Math.max(0, damage - defender.effects.shieldBlock);
        blockedDamage = originalDamage - damage;
    }
    
    return { damage: Math.max(1, Math.floor(damage)), isCrit, blockedDamage: Math.floor(blockedDamage) };
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
    
    // Гниение (Pudge) - периодический урон (увеличено для нового масштаба HP)
    if (passive === 'Гниение') {
        target.currentHealth -= 100; // Увеличено с 10 до 100
    }
    
    // Удар в спину (Riki) - крит сзади (упрощенно - просто шанс крита)
    if (passive === 'Удар в спину' && Math.random() < 0.3) {
        damage *= 2.5;
        // Отмечаем что это крит для визуализации
        if (!gladiator.passiveCrit) gladiator.passiveCrit = true;
    }
    
    // Восстановление маны (Crystal Maiden) - уже учтено в симуляции
    if (passive === 'Восстановление маны') {
        gladiator.mana = Math.min(gladiator.maxMana || 200, (gladiator.mana || 0) + 2);
    }
    
    // Танец клинка (Juggernaut) - уклонение обрабатывается в функции attack через evasionChance
    // Здесь не нужно ничего делать, уклонение уже обработано
    
    // Жар (Lina) - увеличение скорости атаки
    if (passive === 'Жар') {
        if (!gladiator.heatStacks) gladiator.heatStacks = 0;
        gladiator.heatStacks = Math.min(gladiator.heatStacks + 1, 10);
        gladiator.attackSpeed = (gladiator.attackSpeed || 1) * (1 + gladiator.heatStacks * 0.05);
    }
    
    return damage;
}

// Применение пассивных эффектов
function applyPassiveEffects(gladiator, target, roomId = null, glad1 = null, glad2 = null) {
    let logMessage = null;
    
    // Обновление эффектов замедления
    if (gladiator.slowed && gladiator.slowed > 0) {
        gladiator.slowed--;
        if (gladiator.slowed <= 0) {
            delete gladiator.slowed;
        }
    }
    
    // Гниение (Pudge) - периодический урон (увеличено для нового масштаба HP)
    if (gladiator.passive && gladiator.passive.name === 'Гниение') {
        const rotDamage = 100 + ((gladiator.effects && gladiator.effects.poisonDamage) || 0);
        target.currentHealth = Math.max(0, target.currentHealth - rotDamage);
        logMessage = `${gladiator.name}: Гниение наносит ${rotDamage} урона ${target.name}`;
        
        // Отправляем урон для визуализации
        const isPlayer1 = gladiator === glad1;
        io.to(roomId).emit('battle-damage', {
            target: isPlayer1 ? 2 : 1,
            damage: rotDamage,
            isCrit: false,
            isEvaded: false,
            blockedDamage: 0
        });
    }
    
    // Яд (эффект карточек)
    if (target.effects && target.effects.poisonStacks && target.poisonStacks > 0) {
        const poisonDamage = (target.effects.poisonDamage || 0) * target.poisonStacks;
        target.currentHealth = Math.max(0, target.currentHealth - poisonDamage);
        if (poisonDamage > 0) {
            logMessage = `${target.name}: Яд наносит ${poisonDamage} урона`;
        }
    }
    
    // Регенерация здоровья (эффект карточек)
    if (gladiator.effects && gladiator.effects.regen && gladiator.currentHealth < gladiator.maxHealth) {
        const regenAmount = gladiator.effects.regen;
        gladiator.currentHealth = Math.min(gladiator.maxHealth, gladiator.currentHealth + regenAmount);
        logMessage = `${gladiator.name}: Регенерация +${regenAmount} HP`;
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

// Обработка корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).send('Внутренняя ошибка сервера');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});

// Обработка ошибок при запуске
server.on('error', (err) => {
    console.error('Ошибка при запуске сервера:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Необработанное исключение:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанный rejection:', reason);
});
