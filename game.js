// Константы
const ARENA_COLS = 4;
const ARENA_ROWS = 3;
const HEROES_TO_SELECT = 3;

// Герои
const HEROES = [
    {
        id: 'axe',
        name: 'Axe',
        health: 650,
        damage: 55,
        armor: 2,
        type: 'warrior',
        description: 'Танк с высокой защитой'
    },
    {
        id: 'sven',
        name: 'Sven',
        health: 680,
        damage: 68,
        armor: 3,
        type: 'warrior',
        description: 'Воин с критическим уроном'
    },
    {
        id: 'drow',
        name: 'Drow Ranger',
        health: 440,
        damage: 50,
        armor: 0,
        type: 'ranger',
        description: 'Дальнобойный стрелок'
    },
    {
        id: 'wind',
        name: 'Windranger',
        health: 480,
        damage: 60,
        armor: 1,
        type: 'ranger',
        description: 'Быстрый лучник'
    },
    {
        id: 'crystal',
        name: 'Crystal Maiden',
        health: 420,
        damage: 45,
        armor: 0,
        type: 'mage',
        description: 'Маг с замораживанием'
    },
    {
        id: 'lina',
        name: 'Lina',
        health: 480,
        damage: 55,
        armor: 1,
        type: 'mage',
        description: 'Мощный магический урон'
    },
    {
        id: 'pudge',
        name: 'Pudge',
        health: 750,
        damage: 52,
        armor: 2,
        type: 'tank',
        description: 'Очень прочный танк'
    },
    {
        id: 'tide',
        name: 'Tidehunter',
        health: 800,
        damage: 58,
        armor: 3,
        type: 'tank',
        description: 'Максимальная защита'
    },
    {
        id: 'riki',
        name: 'Riki',
        health: 460,
        damage: 62,
        armor: 1,
        type: 'assassin',
        description: 'Ассассин с критом'
    },
    {
        id: 'phantom',
        name: 'Phantom Assassin',
        health: 550,
        damage: 70,
        armor: 2,
        type: 'assassin',
        description: 'Сильнейший ассассин'
    },
    {
        id: 'juggernaut',
        name: 'Juggernaut',
        health: 600,
        damage: 65,
        armor: 2,
        type: 'warrior',
        description: 'Сбалансированный боец'
    },
    {
        id: 'lion',
        name: 'Lion',
        health: 450,
        damage: 48,
        armor: 0,
        type: 'mage',
        description: 'Маг-контроллер'
    }
];

// Игровое состояние
let gameState = {
    socket: null,
    playerName: '',
    roomId: null,
    selectedHeroes: [],
    playerHeroes: [],
    enemyHeroes: [],
    lives: 100,
    round: 1,
    isReady: false,
    currentScreen: 'connection' // connection, selection, game
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupConnectionScreen();
});

// Настройка экрана подключения
function setupConnectionScreen() {
    document.getElementById('connect-btn').addEventListener('click', connectToRoom);
    document.getElementById('create-room-btn').addEventListener('click', createRoom);
    document.getElementById('confirm-selection-btn').addEventListener('click', confirmHeroSelection);
    document.getElementById('ready-btn').addEventListener('click', setReady);
    document.getElementById('not-ready-btn').addEventListener('click', setNotReady);
    
    // Enter для подключения
    document.getElementById('server-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') connectToRoom();
    });
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') connectToRoom();
    });
}

// Создание комнаты
function createRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    const serverUrl = document.getElementById('server-url').value.trim() || 'http://localhost:3000';
    
    if (!playerName) {
        showStatus('Введите имя игрока!', 'error');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.socket = io(serverUrl);
    
    setupSocketListeners();
    
    gameState.socket.on('connect', () => {
        showStatus('Подключение...', 'info');
        gameState.socket.emit('create-room', playerName);
    });
    
    gameState.socket.on('room-created', (roomId) => {
        gameState.roomId = roomId;
        showStatus(`Комната создана! ID: ${roomId}. Поделитесь этим ID с другом.`, 'success');
        document.getElementById('connection-status').innerHTML += `<br><strong>ID комнаты: ${roomId}</strong>`;
    });
}

// Подключение к комнате
function connectToRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    const serverUrl = document.getElementById('server-url').value.trim() || 'http://localhost:3000';
    const roomId = prompt('Введите ID комнаты:');
    
    if (!playerName) {
        showStatus('Введите имя игрока!', 'error');
        return;
    }
    
    if (!roomId) {
        showStatus('Введите ID комнаты!', 'error');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.roomId = roomId;
    gameState.socket = io(serverUrl);
    
    setupSocketListeners();
    
    gameState.socket.on('connect', () => {
        showStatus('Подключение к комнате...', 'info');
        gameState.socket.emit('join-room', { roomId, playerName });
    });
    
    gameState.socket.on('joined-room', (roomId) => {
        showStatus('Подключено к комнате!', 'success');
    });
    
    gameState.socket.on('error', (error) => {
        showStatus(`Ошибка: ${error}`, 'error');
    });
}

// Настройка обработчиков Socket.IO
function setupSocketListeners() {
    gameState.socket.on('start-hero-selection', () => {
        gameState.selectedHeroes = [];
        gameState.playerHeroes = [];
        gameState.enemyHeroes = [];
        showScreen('selection');
        renderHeroSelection();
        document.getElementById('log').innerHTML = '';
    });
    
    gameState.socket.on('all-heroes-selected', () => {
        document.getElementById('waiting-message').classList.add('hidden');
        addLog('Все игроки выбрали героев. Разместите героев на арене и нажмите "Готов к бою"', 'info');
    });
    
    gameState.socket.on('heroes-selected', (data) => {
        // Обновление информации о выборе противника
        if (data.playerId !== gameState.socket.id) {
            gameState.enemyHeroes = data.heroes.map(hero => ({
                ...hero,
                maxHealth: hero.maxHealth || hero.health,
                currentHealth: hero.maxHealth || hero.health
            }));
            addLog('Противник выбрал героев', 'info');
            if (gameState.currentScreen === 'game') {
                renderGame();
            }
        }
    });
    
    gameState.socket.on('player-ready-status', (data) => {
        if (data.playerId !== gameState.socket.id) {
            addLog(data.ready ? 'Противник готов к бою!' : 'Противник отменил готовность', 'info');
        }
    });
    
    gameState.socket.on('battle-started', () => {
        addLog('=== БОЙ НАЧАЛСЯ ===', 'info');
        document.getElementById('battle-status').querySelector('.status-text').textContent = 'Бой идет...';
    });
    
    gameState.socket.on('battle-result', (result) => {
        const isWinner = result.winner === gameState.socket.id;
        gameState.lives = isWinner ? result.winnerLives : result.loserLives;
        
        // Обновляем героев после боя
        if (result.player1Id === gameState.socket.id) {
            gameState.playerHeroes = result.player1Heroes || [];
            gameState.enemyHeroes = result.player2Heroes || [];
        } else {
            gameState.playerHeroes = result.player2Heroes || [];
            gameState.enemyHeroes = result.player1Heroes || [];
        }
        
        showBattleResult(isWinner, result);
        
        if (result.gameOver) {
            addLog(isWinner ? '🎉 ПОБЕДА! ИГРА ОКОНЧЕНА!' : '💀 ПОРАЖЕНИЕ! ИГРА ОКОНЧЕНА!', 'info');
        } else {
            addLog(isWinner ? `🎉 Победа в раунде! Жизней: ${gameState.lives}` : `💀 Поражение в раунде. Жизней: ${gameState.lives}`, 'info');
        }
        
        updateUI();
    });
    
    gameState.socket.on('round-end', () => {
        gameState.round++;
        gameState.isReady = false;
        gameState.selectedHeroes = [];
        gameState.playerHeroes = [];
        gameState.enemyHeroes = [];
        document.getElementById('battle-status').querySelector('.status-text').textContent = 'Подготовка к следующему раунду';
        document.getElementById('ready-btn').classList.remove('hidden');
        document.getElementById('not-ready-btn').classList.add('hidden');
        addLog('Раунд окончен. Выберите новых героев.', 'info');
        showScreen('selection');
        renderHeroSelection();
    });
    
    gameState.socket.on('game-over', (data) => {
        setTimeout(() => {
            if (confirm(`Игра окончена! Победитель: ${data.winner}\nНачать заново?`)) {
                resetGame();
            }
        }, 3000);
    });
    
    gameState.socket.on('restart-game', () => {
        gameState.selectedHeroes = [];
        gameState.playerHeroes = [];
        gameState.enemyHeroes = [];
        gameState.lives = 100;
        gameState.round = 1;
        gameState.isReady = false;
        showScreen('selection');
        renderHeroSelection();
        document.getElementById('log').innerHTML = '';
        addLog('Игра перезапущена! Выберите новых героев.', 'info');
    });
    
    gameState.socket.on('player-disconnected', () => {
        showStatus('Противник отключился', 'error');
        addLog('Противник отключился. Ожидание...', 'info');
    });
}

// Показать экран
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    document.getElementById(`${screenName}-screen`).classList.remove('hidden');
    gameState.currentScreen = screenName;
}

// Показать статус
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
}

// Рендеринг выбора героев
function renderHeroSelection() {
    const grid = document.getElementById('hero-selection-grid');
    grid.innerHTML = '';
    
    HEROES.forEach(hero => {
        const heroCard = document.createElement('div');
        heroCard.className = 'hero-selection-card';
        if (gameState.selectedHeroes.find(h => h.id === hero.id)) {
            heroCard.classList.add('selected');
        }
        
        heroCard.innerHTML = `
            <div class="hero-name">${hero.name}</div>
            <div class="hero-type">${hero.type}</div>
            <div class="hero-stats">
                <div>HP: ${hero.health}</div>
                <div>Урон: ${hero.damage}</div>
                <div>Броня: ${hero.armor}</div>
            </div>
            <div class="hero-description">${hero.description}</div>
        `;
        
        heroCard.addEventListener('click', () => toggleHeroSelection(hero, heroCard));
        grid.appendChild(heroCard);
    });
    
    updateSelectionUI();
}

// Переключение выбора героя
function toggleHeroSelection(hero, cardElement) {
    const index = gameState.selectedHeroes.findIndex(h => h.id === hero.id);
    
    if (index !== -1) {
        // Удаление
        gameState.selectedHeroes.splice(index, 1);
        cardElement.classList.remove('selected');
    } else {
        // Добавление
        if (gameState.selectedHeroes.length >= HEROES_TO_SELECT) {
            addLog('Можно выбрать только ' + HEROES_TO_SELECT + ' героев!', 'info');
            return;
        }
        
        const heroCopy = {
            ...hero,
            maxHealth: hero.health,
            currentHealth: hero.health
        };
        
        gameState.selectedHeroes.push(heroCopy);
        cardElement.classList.add('selected');
    }
    
    updateSelectionUI();
}

// Обновление UI выбора
function updateSelectionUI() {
    const count = gameState.selectedHeroes.length;
    document.getElementById('selected-count').textContent = `Выбрано: ${count}/${HEROES_TO_SELECT}`;
    document.getElementById('confirm-selection-btn').disabled = count !== HEROES_TO_SELECT;
}

// Подтверждение выбора героев
function confirmHeroSelection() {
    if (gameState.selectedHeroes.length !== HEROES_TO_SELECT) {
        return;
    }
    
    gameState.playerHeroes = [...gameState.selectedHeroes];
    gameState.socket.emit('select-heroes', {
        roomId: gameState.roomId,
        heroes: gameState.selectedHeroes
    });
    
    document.getElementById('waiting-message').classList.remove('hidden');
    addLog('Выбор подтвержден. Ожидание противника...', 'info');
    
    // Переходим к игровому экрану после небольшой задержки
    setTimeout(() => {
        showScreen('game');
        renderGame();
    }, 1000);
}

// Установка готовности
function setReady() {
    if (gameState.playerHeroes.length === 0) {
        addLog('Сначала выберите и разместите героев!', 'info');
        return;
    }
    
    gameState.isReady = true;
    gameState.socket.emit('player-ready', { roomId: gameState.roomId });
    
    document.getElementById('ready-btn').classList.add('hidden');
    document.getElementById('not-ready-btn').classList.remove('hidden');
    addLog('Вы готовы к бою!', 'info');
}

function setNotReady() {
    gameState.isReady = false;
    gameState.socket.emit('player-not-ready', { roomId: gameState.roomId });
    
    document.getElementById('ready-btn').classList.remove('hidden');
    document.getElementById('not-ready-btn').classList.add('hidden');
    addLog('Готовность отменена', 'info');
}

// Рендеринг игры
function renderGame() {
    renderArena('player-arena', gameState.playerHeroes, true);
    renderArena('enemy-arena', gameState.enemyHeroes, false);
    renderHeroesList('player-heroes-list', gameState.playerHeroes);
    renderHeroesList('enemy-heroes-list', gameState.enemyHeroes);
    updateUI();
}

// Рендеринг арены
function renderArena(arenaId, heroes, isPlayer) {
    const arenaContainer = document.getElementById(arenaId);
    arenaContainer.innerHTML = '';
    
    for (let row = 0; row < ARENA_ROWS; row++) {
        for (let col = 0; col < ARENA_COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'arena-cell-small';
            
            const heroIndex = row * ARENA_COLS + col;
            const hero = heroes[heroIndex];
            
            if (hero) {
                cell.classList.add('occupied');
                const healthPercent = ((hero.currentHealth || hero.maxHealth) / hero.maxHealth) * 100;
                
                cell.innerHTML = `
                    <div class="hero-on-arena-small">
                        <div class="hero-mini-name">${hero.name}</div>
                        <div class="hero-health-bar-small">
                            <div class="hero-health-fill-small" style="width: ${healthPercent}%"></div>
                        </div>
                    </div>
                `;
            }
            
            arenaContainer.appendChild(cell);
        }
    }
}

// Рендеринг списка героев
function renderHeroesList(listId, heroes) {
    const listContainer = document.getElementById(listId);
    listContainer.innerHTML = '';
    
    heroes.forEach((hero, index) => {
        const heroItem = document.createElement('div');
        heroItem.className = 'hero-list-item';
        heroItem.innerHTML = `
            <span class="hero-list-name">${hero.name}</span>
            <span class="hero-list-stats">HP: ${hero.maxHealth} | DMG: ${hero.damage} | ARM: ${hero.armor}</span>
        `;
        listContainer.appendChild(heroItem);
    });
}

// Обновление UI
function updateUI() {
    document.getElementById('player-display-name').textContent = gameState.playerName;
    document.getElementById('current-round').textContent = gameState.round;
    document.getElementById('lives').textContent = gameState.lives;
    
    if (gameState.currentScreen === 'game') {
        renderGame();
    }
}

// Показать результат боя
function showBattleResult(isWinner, result) {
    const resultDiv = document.getElementById('battle-result');
    resultDiv.className = `battle-result ${isWinner ? 'victory' : 'defeat'}`;
    resultDiv.textContent = isWinner ? '🎉 ПОБЕДА! 🎉' : '💀 ПОРАЖЕНИЕ 💀';
    resultDiv.classList.remove('hidden');
    
    setTimeout(() => {
        resultDiv.classList.add('hidden');
    }, 3000);
}

// Добавить запись в лог
function addLog(message, type = 'info') {
    const logContainer = document.getElementById('log');
    if (!logContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Сброс игры
function resetGame() {
    gameState.selectedHeroes = [];
    gameState.playerHeroes = [];
    gameState.enemyHeroes = [];
    gameState.lives = 100;
    gameState.round = 1;
    gameState.isReady = false;
    
    if (gameState.socket) {
        gameState.socket.disconnect();
    }
    
    showScreen('connection');
    document.getElementById('log').innerHTML = '';
    document.getElementById('connection-status').textContent = '';
}