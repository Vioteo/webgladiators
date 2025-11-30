// Константы
const STARTING_LIVES = 100;
const STARTING_GOLD = 100;
const SHOP_SIZE = 5;
const MAX_CARD_LEVEL = 5; // Максимальный уровень карточки

// Стили (секты)
const ALL_STYLES = [
    { id: 'critical', name: 'Критический удар', color: '#ff4444' },
    { id: 'frost', name: 'Мороз', color: '#4488ff' },
    { id: 'poison', name: 'Яд', color: '#44ff44' },
    { id: 'fury', name: 'Ярость', color: '#ff8844' },
    { id: 'tank', name: 'Танк', color: '#888888' },
    { id: 'evasion', name: 'Уклонение', color: '#ff44ff' },
    { id: 'shield', name: 'Щит', color: '#4444ff' },
    { id: 'ultimate', name: 'Ультимейт', color: '#ffff44' }
];

// URL изображений героев (Dota 2)
const HERO_IMAGES = {
    'axe': 'https://cdn.dota2.com/apps/dota2/images/heroes/axe_full.png',
    'sven': 'https://cdn.dota2.com/apps/dota2/images/heroes/sven_full.png',
    'drow': 'https://cdn.dota2.com/apps/dota2/images/heroes/drow_ranger_full.png',
    'pudge': 'https://cdn.dota2.com/apps/dota2/images/heroes/pudge_full.png',
    'riki': 'https://cdn.dota2.com/apps/dota2/images/heroes/riki_full.png',
    'crystal': 'https://cdn.dota2.com/apps/dota2/images/heroes/crystal_maiden_full.png',
    'juggernaut': 'https://cdn.dota2.com/apps/dota2/images/heroes/juggernaut_full.png',
    'lina': 'https://cdn.dota2.com/apps/dota2/images/heroes/lina_full.png'
};

// Герои с пассивными и активными способностями
const HEROES = [
    {
        id: 'axe',
        name: 'Axe',
        style: 'tank',
        health: 1200,
        damage: 55,
        armor: 4,
        attackSpeed: 1.2,
        passive: {
            name: 'Берсерк',
            description: 'При потере здоровья увеличивает броню на 0.5 за каждые 10% потерянного здоровья'
        },
        active: {
            name: 'Берсеркер Крик',
            description: 'Притягивает врага и увеличивает свою броню на 5 на 3 секунды',
            manaCost: 100,
            cooldown: 8000
        }
    },
    {
        id: 'sven',
        name: 'Sven',
        style: 'critical',
        health: 1000,
        damage: 75,
        armor: 2,
        attackSpeed: 1.5,
        passive: {
            name: 'Божественная Сила',
            description: 'Каждая атака имеет 20% шанс нанести критический урон x2'
        },
        active: {
            name: 'Божественная Сила',
            description: 'Увеличивает урон на 100% и скорость атаки на 50% на 5 секунд',
            manaCost: 120,
            cooldown: 12000
        }
    },
    {
        id: 'drow',
        name: 'Drow Ranger',
        style: 'frost',
        health: 800,
        damage: 70,
        armor: 1,
        attackSpeed: 1.8,
        passive: {
            name: 'Морозные Стрелы',
            description: 'Атаки замедляют врага на 20% на 2 секунды'
        },
        active: {
            name: 'Молчание',
            description: 'Останавливает врага на 2 секунды и наносит 150 урона',
            manaCost: 90,
            cooldown: 10000
        }
    },
    {
        id: 'pudge',
        name: 'Pudge',
        style: 'tank',
        health: 1300,
        damage: 50,
        armor: 3,
        attackSpeed: 1.1,
        passive: {
            name: 'Гниение',
            description: 'Наносит 10 урона в секунду всем врагам в радиусе'
        },
        active: {
            name: 'Крюк',
            description: 'Притягивает врага и наносит 200 урона',
            manaCost: 110,
            cooldown: 14000
        }
    },
    {
        id: 'riki',
        name: 'Riki',
        style: 'critical',
        health: 850,
        damage: 80,
        armor: 1,
        attackSpeed: 1.7,
        passive: {
            name: 'Удар в спину',
            description: 'Атаки сзади наносят критический урон x2.5'
        },
        active: {
            name: 'Невидимость',
            description: 'Становится невидимым на 3 секунды, следующий удар наносит x3 урона',
            manaCost: 80,
            cooldown: 15000
        }
    },
    {
        id: 'crystal',
        name: 'Crystal Maiden',
        style: 'frost',
        health: 750,
        damage: 55,
        armor: 0,
        attackSpeed: 1.6,
        passive: {
            name: 'Восстановление маны',
            description: 'Восстанавливает ману на 50% быстрее'
        },
        active: {
            name: 'Ледяной Взрыв',
            description: 'Наносит 180 урона и замедляет врага на 50% на 4 секунды',
            manaCost: 100,
            cooldown: 9000
        }
    },
    {
        id: 'juggernaut',
        name: 'Juggernaut',
        style: 'fury',
        health: 950,
        damage: 65,
        armor: 2,
        attackSpeed: 1.6,
        passive: {
            name: 'Танец клинка',
            description: 'Имеет 25% шанс уклониться от атаки и контратаковать'
        },
        active: {
            name: 'Вихрь',
            description: 'Становится неуязвимым и наносит 50 урона в секунду в течение 5 секунд',
            manaCost: 130,
            cooldown: 16000
        }
    },
    {
        id: 'lina',
        name: 'Lina',
        style: 'ultimate',
        health: 800,
        damage: 60,
        armor: 1,
        attackSpeed: 1.7,
        passive: {
            name: 'Жар',
            description: 'Каждая атака увеличивает скорость атаки на 5% (макс. 50%)'
        },
        active: {
            name: 'Лагуна Блейд',
            description: 'Наносит 300 чистого урона',
            manaCost: 200,
            cooldown: 20000
        }
    }
];

// Редкость карточек
const RARITY = {
    common: { name: 'Обычная', color: '#cccccc', cost: 2 },
    uncommon: { name: 'Необычная', color: '#44ff44', cost: 3 },
    rare: { name: 'Редкая', color: '#4488ff', cost: 4 },
    epic: { name: 'Эпическая', color: '#8844ff', cost: 5 },
    legendary: { name: 'Легендарная', color: '#ff8844', cost: 6 }
};

// Карточки улучшений для стилей
const CARDS = {
    critical: [
        { id: 'crit_chance_1', name: 'Шанс крита +10%', rarity: 'common', effect: { critChance: 10 } },
        { id: 'crit_damage_1', name: 'Урон крита +50%', rarity: 'uncommon', effect: { critDamage: 50 } },
        { id: 'crit_chance_2', name: 'Шанс крита +20%', rarity: 'rare', effect: { critChance: 20 } },
        { id: 'crit_on_kill', name: 'Крит при убийстве', rarity: 'epic', effect: { critOnKill: true } },
        { id: 'crit_master', name: 'Мастер крита', rarity: 'legendary', effect: { critChance: 30, critDamage: 100 } }
    ],
    frost: [
        { id: 'frost_slow_1', name: 'Замедление +15%', rarity: 'common', effect: { slow: 15 } },
        { id: 'frost_damage_1', name: 'Урон мороза +20', rarity: 'uncommon', effect: { frostDamage: 20 } },
        { id: 'frost_stack_1', name: 'Стаки мороза +1', rarity: 'rare', effect: { frostStack: 1 } },
        { id: 'frost_freeze', name: 'Замораживание', rarity: 'epic', effect: { freeze: true } },
        { id: 'frost_master', name: 'Мастер мороза', rarity: 'legendary', effect: { slow: 50, frostDamage: 50 } }
    ],
    poison: [
        { id: 'poison_damage_1', name: 'Урон яда +10', rarity: 'common', effect: { poisonDamage: 10 } },
        { id: 'poison_stack_1', name: 'Стаки яда +2', rarity: 'uncommon', effect: { poisonStack: 2 } },
        { id: 'poison_duration_1', name: 'Длительность +3с', rarity: 'rare', effect: { poisonDuration: 3 } },
        { id: 'poison_explode', name: 'Взрыв яда', rarity: 'epic', effect: { poisonExplode: true } },
        { id: 'poison_master', name: 'Мастер яда', rarity: 'legendary', effect: { poisonDamage: 30, poisonStack: 5 } }
    ],
    fury: [
        { id: 'fury_attack_1', name: 'Скорость атаки +10%', rarity: 'common', effect: { attackSpeed: 10 } },
        { id: 'fury_damage_1', name: 'Урон при ярости +15', rarity: 'uncommon', effect: { furyDamage: 15 } },
        { id: 'fury_stack_1', name: 'Стаки ярости +2', rarity: 'rare', effect: { furyStack: 2 } },
        { id: 'fury_berserk', name: 'Берсерк', rarity: 'epic', effect: { berserk: true } },
        { id: 'fury_master', name: 'Мастер ярости', rarity: 'legendary', effect: { attackSpeed: 30, furyDamage: 40 } }
    ],
    tank: [
        { id: 'tank_health_1', name: 'Здоровье +100', rarity: 'common', effect: { health: 100 } },
        { id: 'tank_armor_1', name: 'Броня +2', rarity: 'uncommon', effect: { armor: 2 } },
        { id: 'tank_regen_1', name: 'Реген +5/с', rarity: 'rare', effect: { regen: 5 } },
        { id: 'tank_thorns', name: 'Шипы', rarity: 'epic', effect: { thorns: true } },
        { id: 'tank_master', name: 'Мастер танка', rarity: 'legendary', effect: { health: 300, armor: 5 } }
    ],
    evasion: [
        { id: 'evasion_chance_1', name: 'Шанс уклонения +10%', rarity: 'common', effect: { evasionChance: 10 } },
        { id: 'evasion_counter_1', name: 'Контратака при уклонении', rarity: 'uncommon', effect: { counterAttack: true } },
        { id: 'evasion_dodge_1', name: 'Полное уклонение +5%', rarity: 'rare', effect: { fullEvasion: 5 } },
        { id: 'evasion_blink', name: 'Блинк при уклонении', rarity: 'epic', effect: { blink: true } },
        { id: 'evasion_master', name: 'Мастер уклонения', rarity: 'legendary', effect: { evasionChance: 30, counterAttack: true } }
    ],
    shield: [
        { id: 'shield_block_1', name: 'Блок +50', rarity: 'common', effect: { shieldBlock: 50 } },
        { id: 'shield_regen_1', name: 'Восстановление щита', rarity: 'uncommon', effect: { shieldRegen: true } },
        { id: 'shield_reflect_1', name: 'Отражение урона 20%', rarity: 'rare', effect: { reflect: 20 } },
        { id: 'shield_barrier', name: 'Барьер', rarity: 'epic', effect: { barrier: true } },
        { id: 'shield_master', name: 'Мастер щита', rarity: 'legendary', effect: { shieldBlock: 200, reflect: 40 } }
    ],
    ultimate: [
        { id: 'ult_cooldown_1', name: 'Перезарядка -20%', rarity: 'common', effect: { cooldown: -20 } },
        { id: 'ult_damage_1', name: 'Урон ульты +50', rarity: 'uncommon', effect: { ultDamage: 50 } },
        { id: 'ult_chain_1', name: 'Цепная ульта', rarity: 'rare', effect: { chain: true } },
        { id: 'ult_execute', name: 'Казнь', rarity: 'epic', effect: { execute: true } },
        { id: 'ult_master', name: 'Мастер ульты', rarity: 'legendary', effect: { ultDamage: 150, cooldown: -50 } }
    ]
};

// Игровое состояние
let gameState = {
    socket: null,
    playerName: '',
    roomId: null,
    availableStyles: [], // Доступные стили (случайные)
    blockedStyles: [], // Заблокированные стили
    selectedHero: null, // Выбранный герой
    gladiator: null, // Текущий гладиатор с улучшениями
    cards: [], // Купленные карточки
    shop: [], // Магазин карточек
    gold: STARTING_GOLD,
    lives: STARTING_LIVES,
    round: 1,
    isReady: false,
    currentScreen: 'connection'
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupConnectionScreen();
});

// Настройка экрана подключения
function setupConnectionScreen() {
    document.getElementById('create-room-btn').addEventListener('click', createRoom);
    document.getElementById('refresh-rooms-btn').addEventListener('click', refreshRoomsList);
    document.getElementById('ready-btn').addEventListener('click', setReady);
    document.getElementById('not-ready-btn').addEventListener('click', setNotReady);
    document.getElementById('refresh-shop-btn').addEventListener('click', refreshShop);
    
    // Enter для создания комнаты
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createRoom();
    });
}

// Инициализация подключения к серверу
function initSocketConnection() {
    if (!gameState.socket || !gameState.socket.connected) {
        const serverUrl = window.defaultServerUrl || window.location.origin;
        gameState.socket = io(serverUrl);
        setupSocketListeners();
    }
}

// Создание комнаты
function createRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    
    if (!playerName) {
        showStatus('Введите имя игрока!', 'error');
        return;
    }
    
    gameState.playerName = playerName;
    initSocketConnection();
    
    gameState.socket.once('connect', () => {
        showStatus('Создание комнаты...', 'info');
        gameState.socket.emit('create-room', playerName);
    });
    
    gameState.socket.once('room-created', (roomId) => {
        gameState.roomId = roomId;
        showStatus(`Комната создана! ID: ${roomId}. Ожидание второго игрока...`, 'success');
        document.getElementById('connection-status').innerHTML += `<br><strong>ID комнаты: ${roomId}</strong><br>Поделитесь этим ID с другом или дождитесь подключения через список комнат.`;
    });
}

// Подключение к комнате (сохраняем ссылку для глобального доступа)
function connectToRoom(roomId) {
    const playerName = document.getElementById('player-name').value.trim();
    
    if (!playerName) {
        showStatus('Введите имя игрока!', 'error');
        return;
    }
    
    if (!roomId) {
        showStatus('Выберите комнату из списка!', 'error');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.roomId = roomId;
    initSocketConnection();
    
    // Если сокет уже подключен, сразу отправляем запрос
    if (gameState.socket.connected) {
        showStatus('Подключение к комнате...', 'info');
        gameState.socket.emit('join-room', { roomId, playerName });
    } else {
        // Иначе ждем подключения
        gameState.socket.once('connect', () => {
            showStatus('Подключение к комнате...', 'info');
            gameState.socket.emit('join-room', { roomId, playerName });
        });
    }
    
    // Обработка успешного подключения
    gameState.socket.once('joined-room', (connectedRoomId) => {
        gameState.roomId = connectedRoomId;
        showStatus('Подключено к комнате!', 'success');
        refreshRoomsList(); // Обновляем список комнат
    });
    
    // Обработка ошибок
    gameState.socket.once('error', (error) => {
        showStatus(`Ошибка: ${error}`, 'error');
        setTimeout(() => refreshRoomsList(), 1000);
    });
}

// Сохраняем функцию для глобального доступа
window.gameState = window.gameState || {};
window.gameState.connectToRoomFunc = connectToRoom;

// Обновление списка комнат
function refreshRoomsList() {
    initSocketConnection();
    
    gameState.socket.emit('get-rooms');
}

// Рендеринг списка комнат
function renderRoomsList(rooms) {
    const roomsListContainer = document.getElementById('rooms-list');
    if (!roomsListContainer) return;
    
    if (rooms.length === 0) {
        roomsListContainer.innerHTML = '<div class="no-rooms">Нет доступных комнат. Создайте свою!</div>';
        return;
    }
    
    roomsListContainer.innerHTML = rooms.map(room => `
        <div class="room-item">
            <div class="room-info">
                <div class="room-id">ID: <strong>${room.id}</strong></div>
                <div class="room-players">Игроков: ${room.players}/${room.maxPlayers}</div>
                ${room.playerNames && room.playerNames.length > 0 ? 
                    `<div class="room-names">${room.playerNames.join(', ')}</div>` : ''}
                <div class="room-status">Статус: ${getRoomStatusText(room.gameState)}</div>
            </div>
            <button class="btn btn-primary btn-small" onclick="connectToRoom('${room.id}')" ${room.players >= room.maxPlayers ? 'disabled' : ''}>
                ${room.players >= room.maxPlayers ? 'Полная' : 'Подключиться'}
            </button>
        </div>
    `).join('');
}

function getRoomStatusText(gameState) {
    const states = {
        'waiting': 'Ожидание игроков',
        'selecting': 'Выбор героев',
        'preparing': 'Подготовка',
        'playing': 'Идет бой'
    };
    return states[gameState] || gameState;
}

// Настройка обработчиков Socket.IO
function setupSocketListeners() {
    // Получение списка комнат
    gameState.socket.on('room-list', (rooms) => {
        renderRoomsList(rooms);
    });
    
    // Автоматически запрашиваем список комнат при подключении
    gameState.socket.on('connect', () => {
        console.log('Socket подключен');
        refreshRoomsList();
    });
    
    // Обработка ошибок подключения
    gameState.socket.on('connect_error', (error) => {
        console.error('Ошибка подключения:', error);
        showStatus('Ошибка подключения к серверу', 'error');
    });
    
    gameState.socket.on('styles-selected', (data) => {
        gameState.availableStyles = data.styles;
        gameState.blockedStyles = data.blockedStyles || [];
        gameState.gold = STARTING_GOLD;
        gameState.selectedHero = null;
        gameState.gladiator = null;
        gameState.cards = [];
        
        showScreen('hero-selection');
        renderHeroSelection();
        addLog(`Доступные стили: ${data.styles.map(s => ALL_STYLES.find(st => st.id === s)?.name || s).join(', ')}`, 'info');
        addLog(`Заблокированные: ${data.blockedStyles.map(s => ALL_STYLES.find(st => st.id === s)?.name || s).join(', ')}`, 'info');
    });
    
    gameState.socket.on('hero-selected', (data) => {
        if (data.playerId !== gameState.socket.id) {
            addLog('Противник выбрал героя', 'info');
        }
    });
    
    gameState.socket.on('all-heroes-selected', () => {
        generateShop();
        showScreen('game');
        renderGame();
        addLog('Все игроки выбрали героев. Покупайте карточки и готовьтесь к бою!', 'info');
    });
    
    gameState.socket.on('all-ready', () => {
        addLog('Оба игрока готовы! Бой начнется скоро...', 'info');
    });
    
    gameState.socket.on('player-ready-status', (data) => {
        if (data.playerId !== gameState.socket.id) {
            addLog(data.ready ? 'Противник готов к бою!' : 'Противник отменил готовность', 'info');
        }
    });
    
    gameState.socket.on('battle-started', (data) => {
        addLog('=== БОЙ НАЧАЛСЯ ===', 'info');
        document.getElementById('battle-status').textContent = 'Бой идет...';
        
        // Показываем визуализацию боя
        showBattleVisualization(data);
        
        // Скрываем обычное отображение гладиаторов
        const normalDisplay = document.getElementById('gladiator').querySelector('.gladiator-display');
        const enemyNormal = document.getElementById('enemy-gladiator-normal');
        if (normalDisplay) normalDisplay.style.display = 'none';
        if (enemyNormal) enemyNormal.style.display = 'none';
    });
    
    // Обработка обновлений боя (эффекты, здоровье, мана)
    gameState.socket.on('battle-update', (update) => {
        updateBattleVisualization(update);
    });
    
    gameState.socket.on('battle-result', (result) => {
        const isWinner = result.winner === gameState.socket.id;
        gameState.lives = isWinner ? result.winnerLives : result.loserLives;
        
        showBattleResult(isWinner, result);
        
        if (result.gameOver) {
            addLog(isWinner ? '🎉 ПОБЕДА! ИГРА ОКОНЧЕНА!' : '💀 ПОРАЖЕНИЕ! ИГРА ОКОНЧЕНА!', 'info');
        } else {
            gameState.round++;
            gameState.gold += isWinner ? 5 : 3;
            addLog(isWinner ? 
                `🎉 Победа в раунде! Жизней: ${gameState.lives}, Золота: ${gameState.gold}` : 
                `💀 Поражение в раунде. Жизней: ${gameState.lives}, Золота: ${gameState.gold}`, 'info');
            
            // Генерация нового магазина
            generateShop();
        }
        
        updateUI();
    });
    
    gameState.socket.on('round-end', () => {
        gameState.isReady = false;
        gameState.selectedHero = null;
        gameState.gladiator = null;
        gameState.cards = [];
        gameState.gold = STARTING_GOLD;
        document.getElementById('ready-btn').classList.remove('hidden');
        document.getElementById('not-ready-btn').classList.add('hidden');
        document.getElementById('battle-status').textContent = 'Подготовка к следующему раунду';
        
        // Возвращаемся к выбору героя
        showScreen('hero-selection');
        renderHeroSelection();
        addLog('Раунд окончен. Выберите нового героя.', 'info');
    });
    
    gameState.socket.on('game-over', (data) => {
        setTimeout(() => {
            if (confirm(`Игра окончена! Победитель: ${data.winner}\nНачать заново?`)) {
                resetGame();
            }
        }, 3000);
    });
    
    gameState.socket.on('restart-game', () => {
        gameState.lives = STARTING_LIVES;
        gameState.round = 1;
        gameState.gold = STARTING_GOLD;
        gameState.selectedHero = null;
        gameState.gladiator = null;
        gameState.cards = [];
        gameState.isReady = false;
        showScreen('connection');
        document.getElementById('log').innerHTML = '';
        addLog('Игра перезапущена!', 'info');
    });
    
    gameState.socket.on('player-disconnected', () => {
        showStatus('Противник отключился', 'error');
        addLog('Противник отключился. Ожидание...', 'info');
    });
}

// Сохраняем функцию для глобального доступа (используется в onclick в HTML)
if (typeof window !== 'undefined') {
    window.connectToRoom = function(roomId) {
        connectToRoom(roomId);
    };
}

// Рендеринг выбора героя
function renderHeroSelection() {
    const selectionContainer = document.getElementById('hero-selection-container');
    const stylesInfoContainer = document.getElementById('available-styles-info');
    
    if (!selectionContainer) return;
    
    selectionContainer.innerHTML = '';
    
    // Показываем доступные стили
    if (stylesInfoContainer && gameState.availableStyles.length > 0) {
        const availableStylesText = gameState.availableStyles.map(s => {
            const styleInfo = ALL_STYLES.find(st => st.id === s);
            return `<span style="color: ${styleInfo?.color || '#fff'}">${styleInfo?.name || s}</span>`;
        }).join(', ');
        stylesInfoContainer.innerHTML = `<div class="styles-info-text"><strong>Доступные стили:</strong> ${availableStylesText}</div>`;
    }
    
    // Фильтруем героев по доступным стилям
    const availableHeroes = HEROES.filter(hero => 
        gameState.availableStyles.includes(hero.style)
    );
    
    if (availableHeroes.length === 0) {
        selectionContainer.innerHTML = '<p>Нет доступных героев для выбора</p>';
        return;
    }
    
    availableHeroes.forEach(hero => {
        const heroCard = document.createElement('div');
        heroCard.className = 'hero-selection-card';
        
        if (gameState.selectedHero && gameState.selectedHero.id === hero.id) {
            heroCard.classList.add('selected');
        }
        
        const heroImage = HERO_IMAGES[hero.id] || '';
        const styleInfo = ALL_STYLES.find(s => s.id === hero.style);
        
        heroCard.innerHTML = `
            ${heroImage ? `<div class="hero-card-image">
                <img src="${heroImage}" alt="${hero.name}" class="hero-preview-image" onerror="this.style.display='none'">
            </div>` : ''}
            <div class="hero-name">${hero.name}</div>
            <div class="hero-style" style="color: ${styleInfo?.color || '#fff'}">${styleInfo?.name || hero.style}</div>
            <div class="hero-stats">
                <div>HP: ${hero.health}</div>
                <div>Урон: ${hero.damage}</div>
                <div>Броня: ${hero.armor}</div>
                <div>Скорость: ${hero.attackSpeed}</div>
            </div>
            <div class="hero-abilities">
                <div class="ability passive">
                    <strong>Пассивная:</strong> ${hero.passive.name}
                    <div class="ability-desc">${hero.passive.description}</div>
                </div>
                <div class="ability active">
                    <strong>Активная:</strong> ${hero.active.name}
                    <div class="ability-desc">${hero.active.description}</div>
                    <div class="mana-cost">Мана: ${hero.active.manaCost} | КД: ${hero.active.cooldown/1000}с</div>
                </div>
            </div>
        `;
        
        heroCard.addEventListener('click', () => selectHero(hero));
        selectionContainer.appendChild(heroCard);
    });
}

// Выбор героя
function selectHero(hero) {
    gameState.selectedHero = hero;
    gameState.gladiator = {
        ...hero,
        currentHealth: hero.health,
        maxHealth: hero.health,
        mana: 0,
        maxMana: 200,
        effects: {},
        activeCooldown: 0
    };
    
    gameState.socket.emit('select-hero', {
        roomId: gameState.roomId,
        hero: hero
    });
    
    addLog(`Выбран герой: ${hero.name}`, 'info');
    
    // Автоматически переходим к магазину
    setTimeout(() => {
        if (gameState.socket) {
            gameState.socket.once('all-heroes-selected', () => {
                generateShop();
                showScreen('game');
                renderGame();
            });
        }
    }, 500);
}

// Расчет прогресса по стилям
function getStyleProgress() {
    const progress = {};
    
    gameState.cards.forEach(card => {
        if (!progress[card.style]) {
            progress[card.style] = {
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
        progress[card.style].total++;
        progress[card.style].byRarity[card.rarity]++;
    });
    
    return progress;
}

// Расчет шансов на карты по стилю
function calculateRarityChances(styleProgress, style) {
    const progress = styleProgress[style] || { total: 0, byRarity: {} };
    const cardsBought = progress.total;
    
    // Базовые шансы (только common доступен изначально)
    let chances = {
        common: 100,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0
    };
    
    // Каждая купленная карта стиля увеличивает шансы на более редкие
    if (cardsBought >= 1) {
        // Первая карта открывает uncommon с шансом 10% + 5% за каждую следующую
        chances.uncommon = Math.min(50, 10 + (cardsBought - 1) * 5);
        chances.common = 100 - chances.uncommon;
    }
    
    if (cardsBought >= 2) {
        // Вторая карта открывает rare с шансом 5% + 3% за каждую следующую
        const rareChance = Math.min(30, 5 + (cardsBought - 2) * 3);
        const remaining = 100 - chances.uncommon;
        chances.rare = Math.floor((remaining * rareChance) / 100);
        chances.common = 100 - chances.uncommon - chances.rare;
    }
    
    if (cardsBought >= 4) {
        // Четвертая карта открывает epic с шансом 3% + 2% за каждую следующую
        const epicChance = Math.min(20, 3 + (cardsBought - 4) * 2);
        const remaining = 100 - chances.uncommon - chances.rare;
        chances.epic = Math.floor((remaining * epicChance) / 100);
        chances.common = 100 - chances.uncommon - chances.rare - chances.epic;
    }
    
    if (cardsBought >= 6) {
        // Шестая карта открывает legendary с шансом 2% + 1% за каждую следующую
        const legendaryChance = Math.min(10, 2 + (cardsBought - 6) * 1);
        const remaining = 100 - chances.uncommon - chances.rare - chances.epic;
        chances.legendary = Math.floor((remaining * legendaryChance) / 100);
        chances.common = 100 - chances.uncommon - chances.rare - chances.epic - chances.legendary;
    }
    
    // Нормализуем чтобы сумма была 100
    const sum = chances.common + chances.uncommon + chances.rare + chances.epic + chances.legendary;
    if (sum !== 100) {
        chances.common += (100 - sum);
    }
    
    return chances;
}

// Генерация магазина
function generateShop() {
    gameState.shop = [];
    const styleProgress = getStyleProgress();
    
    for (let i = 0; i < SHOP_SIZE; i++) {
        // Выбираем случайный доступный стиль
        const style = gameState.availableStyles[Math.floor(Math.random() * gameState.availableStyles.length)];
        const styleCards = CARDS[style];
        
        // Получаем шансы для этого стиля на основе купленных карт
        const chances = calculateRarityChances(styleProgress, style);
        
        // Создаем взвешенный список редкостей
        const rarityPool = [];
        Object.keys(chances).forEach(rarity => {
            for (let j = 0; j < chances[rarity]; j++) {
                rarityPool.push(rarity);
            }
        });
        
        // Выбираем случайную редкость
        const selectedRarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
        
        // Получаем карты этого стиля с выбранной редкостью
        const cardsWithRarity = styleCards.filter(card => card.rarity === selectedRarity);
        
        if (cardsWithRarity.length > 0) {
            const randomCard = cardsWithRarity[Math.floor(Math.random() * cardsWithRarity.length)];
            gameState.shop.push({ ...randomCard, style });
        } else {
            // Fallback на common если нет карт нужной редкости
            const commonCards = styleCards.filter(card => card.rarity === 'common');
            if (commonCards.length > 0) {
                const randomCard = commonCards[Math.floor(Math.random() * commonCards.length)];
                gameState.shop.push({ ...randomCard, style });
            }
        }
    }
    
    renderShop();
    renderRarityChances(styleProgress);
}

// Отображение шансов на редкие карты
function renderRarityChances(styleProgress) {
    const stylesContainer = document.getElementById('available-styles');
    if (!stylesContainer) return;
    
    let infoHTML = '<div class="styles-info"><strong>Доступные стили:</strong> ';
    infoHTML += gameState.availableStyles.map(s => {
        const styleInfo = ALL_STYLES.find(st => st.id === s);
        return `<span style="color: ${styleInfo?.color || '#fff'}">${styleInfo?.name || s}</span>`;
    }).join(', ');
    infoHTML += '</div>';
    
    // Добавляем информацию о шансах на редкие карты
    infoHTML += '<div class="rarity-chances"><strong>Шансы на редкие карты:</strong><br>';
    gameState.availableStyles.forEach(style => {
        const progress = styleProgress[style] || { total: 0 };
        const chances = calculateRarityChances(styleProgress, style);
        const styleInfo = ALL_STYLES.find(st => st.id === style);
        
        if (progress.total > 0 || chances.uncommon > 0 || chances.rare > 0 || chances.epic > 0 || chances.legendary > 0) {
            infoHTML += `<div class="style-chance"><span style="color: ${styleInfo?.color || '#fff'}">${styleInfo?.name || style}</span> (куплено: ${progress.total}): `;
            const chanceParts = [];
            if (chances.uncommon > 0) chanceParts.push(`Необычная: ${chances.uncommon}%`);
            if (chances.rare > 0) chanceParts.push(`Редкая: ${chances.rare}%`);
            if (chances.epic > 0) chanceParts.push(`Эпическая: ${chances.epic}%`);
            if (chances.legendary > 0) chanceParts.push(`Легендарная: ${chances.legendary}%`);
            infoHTML += chanceParts.join(', ') || 'Только обычные';
            infoHTML += '</div>';
        }
    });
    infoHTML += '</div>';
    
    stylesContainer.innerHTML = infoHTML;
}

// Рендеринг магазина
function renderShop() {
    const shopContainer = document.getElementById('shop');
    if (!shopContainer) return;
    
    shopContainer.innerHTML = '';
    
    gameState.shop.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'shop-card';
        
        const rarityInfo = RARITY[card.rarity];
        const styleInfo = ALL_STYLES.find(s => s.id === card.style);
        
        cardElement.style.borderColor = rarityInfo.color;
        cardElement.innerHTML = `
            <div class="card-header" style="background: ${styleInfo?.color || '#666'}">
                <span class="card-style">${styleInfo?.name || card.style}</span>
                <span class="card-rarity" style="color: ${rarityInfo.color}">${rarityInfo.name}</span>
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-cost" style="color: #ffd700">${rarityInfo.cost} золота</div>
        `;
        
        if (gameState.gold < rarityInfo.cost) {
            cardElement.classList.add('unaffordable');
        } else {
            cardElement.addEventListener('click', () => buyCard(index));
        }
        
        shopContainer.appendChild(cardElement);
    });
}

// Покупка карточки
function buyCard(shopIndex) {
    const card = gameState.shop[shopIndex];
    const rarityInfo = RARITY[card.rarity];
    
    if (gameState.gold < rarityInfo.cost) {
        addLog('Недостаточно золота!', 'info');
        return;
    }
    
    gameState.gold -= rarityInfo.cost;
    gameState.cards.push(card);
    applyCardEffect(card);
    
    gameState.shop.splice(shopIndex, 1);
    addLog(`Куплена карточка: ${card.name} (${RARITY[card.rarity].name})`, 'info');
    
    // Обновляем отображение с новыми шансами
    const styleProgress = getStyleProgress();
    renderShop();
    renderRarityChances(styleProgress);
    renderGladiator();
    updateUI();
}

// Применение эффекта карточки
function applyCardEffect(card, silent = false) {
    const effect = card.effect;
    
    if (!gameState.gladiator) {
        console.error('Гладиатор не создан!');
        return;
    }
    
    // Если карточка имеет уровень больше 1, эффекты уже масштабированы
    const level = card.level || 1;
    
    // Применяем базовые характеристики
    if (effect.health) {
        gameState.gladiator.maxHealth += effect.health;
        gameState.gladiator.currentHealth += effect.health;
        if (!silent) addLog(`+${effect.health} к здоровью!`, 'heal');
    }
    if (effect.armor) {
        gameState.gladiator.armor += effect.armor;
        if (!silent) addLog(`+${effect.armor} к броне!`, 'info');
    }
    if (effect.damage) {
        gameState.gladiator.damage += effect.damage;
        if (!silent) addLog(`+${effect.damage} к урону!`, 'info');
    }
    if (effect.attackSpeed) {
        gameState.gladiator.attackSpeed += effect.attackSpeed / 100;
        if (!silent) addLog(`+${effect.attackSpeed}% к скорости атаки!`, 'info');
    }
    
    // Сохраняем все эффекты для боя (включая специальные)
    if (!gameState.gladiator.effects) gameState.gladiator.effects = {};
    
    // Объединяем эффекты (для стаков некоторых эффектов)
    Object.keys(effect).forEach(key => {
        if (gameState.gladiator.effects[key] && typeof gameState.gladiator.effects[key] === 'number') {
            gameState.gladiator.effects[key] += effect[key];
        } else {
            gameState.gladiator.effects[key] = effect[key];
        }
    });
    
    if (!silent) {
        const levelText = level > 1 ? ` (ур. ${level})` : '';
        addLog(`Карточка "${card.name}"${levelText} применена!`, 'info');
    }
}

// Получение предпросмотра эффекта карточки
function getCardEffectPreview(card) {
    const effects = [];
    const effect = card.effect;
    
    if (effect.health) effects.push(`+${effect.health} HP`);
    if (effect.armor) effects.push(`+${effect.armor} ARM`);
    if (effect.damage) effects.push(`+${effect.damage} DMG`);
    if (effect.attackSpeed) effects.push(`+${effect.attackSpeed}% ASPD`);
    if (effect.critChance) effects.push(`+${effect.critChance}% Крит`);
    if (effect.slow) effects.push(`+${effect.slow}% Замедление`);
    
    return effects.length > 0 ? ` (${effects.join(', ')})` : '';
}

// Рендеринг гладиатора
function renderGladiator() {
    const gladiatorContainer = document.getElementById('gladiator');
    if (!gladiatorContainer || !gameState.gladiator) return;
    
    const gladiator = gameState.gladiator;
    const healthPercent = (gladiator.currentHealth / gladiator.maxHealth) * 100;
    const manaPercent = (gladiator.mana / gladiator.maxMana) * 100;
    
    gladiatorContainer.innerHTML = `
        <div class="gladiator-display">
            <h3>${gladiator.name}</h3>
            <div class="gladiator-stats">
                <div>HP: ${Math.ceil(gladiator.currentHealth)}/${gladiator.maxHealth}</div>
                <div>Урон: ${gladiator.damage}</div>
                <div>Броня: ${gladiator.armor}</div>
                <div>Скорость атаки: ${gladiator.attackSpeed.toFixed(2)}</div>
            </div>
            <div class="health-bar">
                <div class="health-label">Здоровье</div>
                <div class="health-fill" style="width: ${healthPercent}%"></div>
            </div>
            <div class="mana-bar">
                <div class="mana-label">Мана: ${Math.ceil(gladiator.mana)}/${gladiator.maxMana}</div>
                <div class="mana-fill" style="width: ${manaPercent}%"></div>
            </div>
            <div class="abilities-display">
                <div class="ability-info">
                    <strong>Пассивная:</strong> ${gladiator.passive.name}
                    <div class="ability-desc-small">${gladiator.passive.description}</div>
                </div>
                <div class="ability-info">
                    <strong>Активная:</strong> ${gladiator.active.name}
                    <div class="ability-desc-small">${gladiator.active.description}</div>
                </div>
            </div>
            <div class="gladiator-cards">
                <h4>Карточки (${gameState.cards.length}):</h4>
                <div class="cards-list">
                    ${gameState.cards.length > 0 ? gameState.cards.map(card => {
                        const effectPreview = getCardEffectPreview(card);
                        const level = card.level || 1;
                        const levelText = level > 1 ? ` [${level}]` : '';
                        return `
                        <div class="owned-card" style="border-left: 3px solid ${RARITY[card.rarity].color};">
                            <span style="color: ${RARITY[card.rarity].color}; font-weight: bold;">${card.name}${levelText}</span>
                            ${effectPreview ? `<div class="card-effect-preview">${effectPreview}</div>` : ''}
                        </div>
                    `;
                    }).join('') : '<div class="no-cards">Нет карточек</div>'}
                </div>
            </div>
        </div>
    `;
}

// Обновление UI
function updateUI() {
    document.getElementById('player-display-name').textContent = gameState.playerName;
    document.getElementById('current-round').textContent = gameState.round;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('gold').textContent = gameState.gold;
    
    if (gameState.currentScreen === 'game') {
        renderGladiator();
    }
}

// Обновление магазина
function refreshShop() {
    if (gameState.gold < 2) {
        addLog('Недостаточно золота для обновления (нужно 2)!', 'info');
        return;
    }
    
    gameState.gold -= 2;
    generateShop();
    addLog('Магазин обновлен!', 'info');
    updateUI();
}

// Установка готовности
function setReady() {
    if (!gameState.gladiator) {
        addLog('Сначала выберите героя!', 'info');
        return;
    }
    
    gameState.isReady = true;
    gameState.socket.emit('player-ready', { 
        roomId: gameState.roomId,
        gladiator: gameState.gladiator,
        cards: gameState.cards
    });
    
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
    renderGladiator();
    renderShop();
    updateUI();
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

// Показать визуализацию боя
function showBattleVisualization(data) {
    const battleViz = document.getElementById('battle-visualization');
    const enemyBattleViz = document.getElementById('enemy-battle-visualization');
    
    if (battleViz) battleViz.classList.remove('hidden');
    if (enemyBattleViz) enemyBattleViz.classList.remove('hidden');
    
    // Определяем какой гладиатор наш
    const isPlayer1 = data.gladiator1.name === gameState.gladiator?.name;
    const playerGlad = isPlayer1 ? data.gladiator1 : data.gladiator2;
    const enemyGlad = isPlayer1 ? data.gladiator2 : data.gladiator1;
    
    updateBattleGladiator('player-battle-info', playerGlad, false);
    updateBattleGladiator('enemy-battle-info', enemyGlad, true);
}

// Получение URL изображения героя
function getHeroImage(gladiator) {
    if (!gladiator) return '';
    
    // Сначала пытаемся найти по id
    if (gladiator.id) {
        if (HERO_IMAGES[gladiator.id]) {
            return HERO_IMAGES[gladiator.id];
        }
    }
    
    // Затем по имени (нормализованному)
    if (gladiator.name) {
        const normalizedName = gladiator.name.toLowerCase().replace(/\s+/g, '');
        
        // Маппинг альтернативных имен
        const nameMap = {
            'drowranger': 'drow',
            'crystalmaiden': 'crystal'
        };
        
        const heroId = nameMap[normalizedName] || normalizedName;
        if (HERO_IMAGES[heroId]) {
            return HERO_IMAGES[heroId];
        }
    }
    
    return '';
}

// Обновить визуализацию гладиатора в бою
function updateBattleGladiator(elementId, gladiator, isEnemy) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const healthPercent = (gladiator.health / gladiator.maxHealth) * 100;
    const manaPercent = (gladiator.mana / gladiator.maxMana) * 100;
    const heroImage = getHeroImage(gladiator);
    
    element.innerHTML = `
        <div class="battle-hero-container">
            <div class="battle-hero-image-container ${isEnemy ? 'enemy' : 'player'}">
                ${heroImage ? `<img src="${heroImage}" alt="${gladiator.name}" class="battle-hero-image" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="battle-hero-info">
                <div class="battle-gladiator-name">${gladiator.name}</div>
                <div class="battle-health-bar">
                    <div class="battle-health-fill" style="width: ${healthPercent}%"></div>
                    <div class="battle-health-text">${Math.ceil(gladiator.health)}/${gladiator.maxHealth}</div>
                </div>
                <div class="battle-mana-bar">
                    <div class="battle-mana-fill" style="width: ${manaPercent}%"></div>
                    <div class="battle-mana-text">${Math.ceil(gladiator.mana)}/${gladiator.maxMana}</div>
                </div>
            </div>
        </div>
    `;
}

// Обновить визуализацию боя
function updateBattleVisualization(update) {
    // Определяем какой гладиатор наш
    const isPlayer1 = update.gladiator1.name === gameState.gladiator?.name || 
                     update.gladiator1.name === gameState.selectedHero?.name;
    
    const playerGlad = isPlayer1 ? update.gladiator1 : update.gladiator2;
    const enemyGlad = isPlayer1 ? update.gladiator2 : update.gladiator1;
    
    updateBattleGladiator('player-battle-info', playerGlad, false);
    updateBattleGladiator('enemy-battle-info', enemyGlad, true);
    
    // Обновляем эффекты
    renderEffects('player-effects', playerGlad.effects || { positive: [], negative: [] });
    renderEffects('enemy-effects', enemyGlad.effects || { positive: [], negative: [] });
}

// Рендеринг эффектов
function renderEffects(containerId, effects) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Положительные эффекты
    if (effects.positive && effects.positive.length > 0) {
        const positiveDiv = document.createElement('div');
        positiveDiv.className = 'effects-group positive';
        effects.positive.forEach(effect => {
            const effectEl = document.createElement('div');
            effectEl.className = 'effect-item';
            effectEl.innerHTML = `<span class="effect-icon">${effect.icon}</span><span class="effect-name">${effect.name}</span><span class="effect-stacks">x${effect.stacks}</span>`;
            positiveDiv.appendChild(effectEl);
        });
        container.appendChild(positiveDiv);
    }
    
    // Негативные эффекты
    if (effects.negative && effects.negative.length > 0) {
        const negativeDiv = document.createElement('div');
        negativeDiv.className = 'effects-group negative';
        effects.negative.forEach(effect => {
            const effectEl = document.createElement('div');
            effectEl.className = 'effect-item';
            effectEl.innerHTML = `<span class="effect-icon">${effect.icon}</span><span class="effect-name">${effect.name}</span><span class="effect-stacks">x${effect.stacks}</span>`;
            negativeDiv.appendChild(effectEl);
        });
        container.appendChild(negativeDiv);
    }
}

// Сброс игры
function resetGame() {
    gameState.availableStyles = [];
    gameState.blockedStyles = [];
    gameState.selectedHero = null;
    gameState.gladiator = null;
    gameState.cards = [];
    gameState.shop = [];
    gameState.gold = STARTING_GOLD;
    gameState.lives = STARTING_LIVES;
    gameState.round = 1;
    gameState.isReady = false;
    
    // Скрываем визуализацию боя
    const battleViz = document.getElementById('battle-visualization');
    const enemyBattleViz = document.getElementById('enemy-battle-visualization');
    if (battleViz) battleViz.classList.add('hidden');
    if (enemyBattleViz) enemyBattleViz.classList.add('hidden');
    
    if (gameState.socket) {
        gameState.socket.disconnect();
    }
    
    showScreen('connection');
    document.getElementById('log').innerHTML = '';
    document.getElementById('connection-status').textContent = '';
}
