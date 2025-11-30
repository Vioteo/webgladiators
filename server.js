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

// Генерация уникального ID комнаты
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Обработка подключений
io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    socket.on('create-room', (playerName) => {
        const roomId = generateRoomId();
        const room = {
            id: roomId,
            players: [{
                id: socket.id,
                name: playerName,
                socket: socket,
                heroes: [],
                ready: false,
                lives: 100
            }],
            gameState: 'waiting', // waiting, selecting, playing
            battleResult: null
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
            heroes: [],
            ready: false,
            lives: 100
        });

        socket.join(roomId);
        socket.emit('joined-room', roomId);
        socket.emit('game-state', 'selecting');
        
        // Уведомляем всех игроков о начале выбора героев
        io.to(roomId).emit('start-hero-selection');
        console.log(`Игрок ${playerName} присоединился к комнате ${roomId}`);
    });

    socket.on('select-heroes', (data) => {
        const { roomId, heroes } = data;
        const room = rooms.get(roomId);
        
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.heroes = heroes;
            player.ready = false; // Сбрасываем готовность при выборе героев
            console.log(`Игрок ${player.name} выбрал героев:`, heroes.map(h => h.name));
            
            // Отправляем обновление всем игрокам в комнате
            room.players.forEach(p => {
                if (p.id !== socket.id) {
                    p.socket.emit('heroes-selected', {
                        playerId: socket.id,
                        heroes: heroes
                    });
                }
            });

            // Проверяем, все ли выбрали героев
            if (room.players.every(p => p.heroes.length > 0)) {
                io.to(roomId).emit('all-heroes-selected');
            }
        }
    });

    socket.on('player-ready', (data) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
        
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
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

// Функция симуляции боя
function startBattle(room) {
    console.log(`Начинается бой в комнате ${room.id}`);
    room.gameState = 'playing';
    
    const [player1, player2] = room.players;
    
    // Копируем героев для боя
    const team1 = player1.heroes.map(hero => ({
        ...hero,
        currentHealth: hero.maxHealth || hero.health,
        maxHealth: hero.maxHealth || hero.health
    }));
    
    const team2 = player2.heroes.map(hero => ({
        ...hero,
        currentHealth: hero.maxHealth || hero.health,
        maxHealth: hero.maxHealth || hero.health
    }));

    io.to(room.id).emit('battle-started');

    // Симуляция боя
    simulateBattle(team1, team2, (winner, survivors1, survivors2) => {
        let winnerPlayer, loserPlayer, winnerTeam, loserTeam;
        
        if (winner === 1) {
            winnerPlayer = player1;
            loserPlayer = player2;
            winnerTeam = survivors1;
            loserTeam = survivors2;
        } else {
            winnerPlayer = player2;
            loserPlayer = player1;
            winnerTeam = survivors2;
            loserTeam = survivors1;
        }

        const damageToLives = Math.max(10, (loserPlayer.heroes.length - loserTeam.length) * 5);
        loserPlayer.lives -= damageToLives;
        
        // Обновляем героев игроков выжившими
        player1.heroes = survivors1;
        player2.heroes = survivors2;

        const result = {
            winner: winnerPlayer.id,
            winnerName: winnerPlayer.name,
            loserLives: loserPlayer.lives,
            winnerLives: winnerPlayer.lives,
            gameOver: loserPlayer.lives <= 0,
            player1Heroes: player1.heroes,
            player2Heroes: player2.heroes,
            player1Id: player1.id,
            player2Id: player2.id
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
                    p.heroes = [];
                    p.ready = false;
                    p.lives = 100;
                });
                room.gameState = 'selecting';
                room.battleResult = null;
                io.to(room.id).emit('restart-game');
            }, 5000);
        } else {
            // Сброс готовности для следующего раунда
            setTimeout(() => {
                room.players.forEach(p => p.ready = false);
                room.gameState = 'selecting';
                room.battleResult = null;
                io.to(room.id).emit('round-end');
            }, 3000);
        }
    });
}

// Симуляция боя
function simulateBattle(team1, team2, callback) {
    let turn = 0;
    const maxTurns = 200;

    const battleInterval = setInterval(() => {
        turn++;
        
        // Команда 1 атакует
        if (team1.length > 0 && team2.length > 0) {
            const attacker = team1[Math.floor(Math.random() * team1.length)];
            const target = team2[Math.floor(Math.random() * team2.length)];
            
            const damage = calculateDamage(attacker, target);
            target.currentHealth -= damage;
            
            if (target.currentHealth <= 0) {
                const index = team2.indexOf(target);
                team2.splice(index, 1);
            }
        }

        // Команда 2 атакует
        if (team1.length > 0 && team2.length > 0) {
            const attacker = team2[Math.floor(Math.random() * team2.length)];
            const target = team1[Math.floor(Math.random() * team1.length)];
            
            const damage = calculateDamage(attacker, target);
            target.currentHealth -= damage;
            
            if (target.currentHealth <= 0) {
                const index = team1.indexOf(target);
                team1.splice(index, 1);
            }
        }

        // Проверка окончания боя
        if (team1.length === 0 || team2.length === 0 || turn >= maxTurns) {
            clearInterval(battleInterval);
            
            let winner;
            if (team1.length > 0 && team2.length === 0) {
                winner = 1; // Команда 1 выиграла
            } else if (team2.length > 0 && team1.length === 0) {
                winner = 2; // Команда 2 выиграла
            } else {
                winner = Math.random() < 0.5 ? 1 : 2; // Случайный победитель при ничьей
            }
            
            callback(winner, team1, team2);
        }
    }, 100); // 100ms на ход для быстроты
}

// Расчет урона
function calculateDamage(attacker, defender) {
    let damage = attacker.damage || 50;
    
    // Учет брони
    const armor = defender.armor || 0;
    const armorReduction = armor * 0.06 / (1 + armor * 0.06);
    damage = damage * (1 - armorReduction);
    
    // Критический урон
    if (attacker.id === 'sven' || attacker.id === 'riki' || attacker.id === 'phantom') {
        if (Math.random() < 0.25) {
            damage *= 2;
        }
    }
    
    if (attacker.id === 'phantom' && Math.random() < 0.3) {
        damage *= 2.5;
    }
    
    return Math.max(1, Math.floor(damage));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});
