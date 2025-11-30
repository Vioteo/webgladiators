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
    { id: 'ultimate', name: 'Ультимейт', color: '#ffff44' },
    { id: 'heal', name: 'Лечение', color: '#44ff88' }
];

// Пути к локальным изображениям героев (Dota 2) - используем SVG
const HERO_IMAGES = {
    'axe': 'images/heroes/axe_full.svg',
    'sven': 'images/heroes/sven_full.svg',
    'drow': 'images/heroes/drow_ranger_full.svg',
    'pudge': 'images/heroes/pudge_full.svg',
    'riki': 'images/heroes/riki_full.svg',
    'crystal': 'images/heroes/crystal_maiden_full.svg',
    'juggernaut': 'images/heroes/juggernaut_full.svg',
    'lina': 'images/heroes/lina_full.svg'
};

// Герои с пассивными и активными способностями
const HEROES = [
    {
        id: 'axe',
        name: 'Axe',
        style: 'tank',
        health: 12000,
        damage: 55,
        armor: 4,
        attackSpeed: 1.2,
        passive: {
            name: 'Берсерк',
            description: 'При потере здоровья автоматически увеличивает броню. Чем больше потеряно здоровья, тем выше защита (до +5 брони при критическом здоровье)'
        },
        active: {
            name: 'Берсеркер Крик',
            description: 'Увеличивает броню на 5 на 3 секунды. Делает гладиатора более устойчивым к урону',
            manaCost: 100,
            cooldown: 8000
        }
    },
    {
        id: 'sven',
        name: 'Sven',
        style: 'critical',
        health: 10000,
        damage: 75,
        armor: 2,
        attackSpeed: 1.5,
        passive: {
            name: 'Божественная Сила',
            description: 'Каждая атака имеет 20% шанс нанести критический урон (x2). Постоянно усиливает боевую мощь'
        },
        active: {
            name: 'Божественная Сила',
            description: 'Активирует божественную мощь: урон увеличивается в 2 раза, скорость атаки на 50% выше на 5 секунд',
            manaCost: 120,
            cooldown: 12000
        }
    },
    {
        id: 'drow',
        name: 'Drow Ranger',
        style: 'frost',
        health: 8000,
        damage: 70,
        armor: 1,
        attackSpeed: 1.8,
        passive: {
            name: 'Морозные Стрелы',
            description: 'Каждая атака замедляет врага на 20% на 2 секунды. Непрерывно контролирует противника'
        },
        active: {
            name: 'Молчание',
            description: 'Наносит 1500 урона врагу и замедляет его на 2 секунды. Мощный контрольный эффект',
            manaCost: 90,
            cooldown: 10000
        }
    },
    {
        id: 'pudge',
        name: 'Pudge',
        style: 'tank',
        health: 13000,
        damage: 50,
        armor: 3,
        attackSpeed: 1.1,
        passive: {
            name: 'Гниение',
            description: 'Постоянно наносит 100 урона в секунду врагу. Непрерывный урон от токсичного разложения'
        },
        active: {
            name: 'Крюк',
            description: 'Мощный крюк, наносящий 2000 урона врагу. Огромный всплеск урона',
            manaCost: 110,
            cooldown: 14000
        }
    },
    {
        id: 'riki',
        name: 'Riki',
        style: 'critical',
        health: 8500,
        damage: 80,
        armor: 1,
        attackSpeed: 1.7,
        passive: {
            name: 'Удар в спину',
            description: 'Каждая атака имеет 30% шанс нанести критический урон x2.5. Постоянная угроза критических ударов'
        },
        active: {
            name: 'Невидимость',
            description: 'Становится невидимым на 3 секунды. Следующий удар наносит урон в 3 раза больше обычного',
            manaCost: 80,
            cooldown: 15000
        }
    },
    {
        id: 'crystal',
        name: 'Crystal Maiden',
        style: 'frost',
        health: 7500,
        damage: 55,
        armor: 0,
        attackSpeed: 1.6,
        passive: {
            name: 'Восстановление маны',
            description: 'Восстанавливает ману на 50% быстрее, чем обычно. Позволяет чаще использовать способности'
        },
        active: {
            name: 'Ледяной Взрыв',
            description: 'Мощный ледяной взрыв, наносящий 1800 урона и замедляющий врага на 50% на 4 секунды. Сильное замедление и урон',
            manaCost: 100,
            cooldown: 9000
        }
    },
    {
        id: 'juggernaut',
        name: 'Juggernaut',
        style: 'fury',
        health: 9500,
        damage: 65,
        armor: 2,
        attackSpeed: 1.6,
        passive: {
            name: 'Танец клинка',
            description: 'Имеет 25% шанс уклониться от любой атаки врага. Высокая выживаемость через уклонение'
        },
        active: {
            name: 'Вихрь',
            description: 'Становится полностью неуязвимым на 5 секунд и наносит 500 урона в секунду врагу. Полная защита и постоянный урон',
            manaCost: 130,
            cooldown: 16000
        }
    },
    {
        id: 'lina',
        name: 'Lina',
        style: 'ultimate',
        health: 8000,
        damage: 60,
        armor: 1,
        attackSpeed: 1.7,
        passive: {
            name: 'Жар',
            description: 'Каждая атака увеличивает скорость атаки на 5%. Максимум +50% скорости атаки (10 стаков). Разгоняется во время боя'
        },
        active: {
            name: 'Лагуна Блейд',
            description: 'Наносит 3000 чистого урона, игнорируя броню врага. Самый мощный единичный урон в игре',
            manaCost: 200,
            cooldown: 20000
        }
    }
];

// Редкость карточек
const RARITY = {
    common: { name: 'Обычная', color: '#cccccc', cost: 5, maxLevel: 5 },
    uncommon: { name: 'Необычная', color: '#44ff44', cost: 7, maxLevel: 4 },
    rare: { name: 'Редкая', color: '#4488ff', cost: 10, maxLevel: 3 },
    epic: { name: 'Эпическая', color: '#8844ff', cost: 15, maxLevel: 2 },
    legendary: { name: 'Легендарная', color: '#ff8844', cost: 25, maxLevel: 1 }
};

// Карточки улучшений для стилей
const CARDS = {
    critical: [
        { id: 'crit_chance_1', name: 'Шанс крита +10%', rarity: 'common', effect: { critChance: 10 } },
        { id: 'crit_damage_1', name: 'Урон крита +50%', rarity: 'uncommon', effect: { critDamage: 50 } },
        { id: 'crit_chance_2', name: 'Шанс крита +20%', rarity: 'rare', effect: { critChance: 20 } },
        { id: 'crit_on_kill', name: 'Крит при убийстве', rarity: 'epic', effect: { critOnKill: true } },
        { id: 'crit_master', name: 'Мастер крита', rarity: 'legendary', effect: { critChance: 30, critDamage: 100 } },
        { id: 'crit_lifesteal_1', name: 'Кровопийца +10%', rarity: 'uncommon', effect: { lifesteal: 10 } },
        { id: 'crit_execute', name: 'Казнь критом', rarity: 'epic', effect: { critExecute: true } }
    ],
    frost: [
        { id: 'frost_slow_1', name: 'Замедление +15%', rarity: 'common', effect: { slow: 15 } },
        { id: 'frost_damage_1', name: 'Урон мороза +100', rarity: 'uncommon', effect: { frostDamage: 100 } },
        { id: 'frost_stack_1', name: 'Стаки мороза +1', rarity: 'rare', effect: { frostStack: 1 } },
        { id: 'frost_freeze', name: 'Замораживание', rarity: 'epic', effect: { freeze: true } },
        { id: 'frost_master', name: 'Мастер мороза', rarity: 'legendary', effect: { slow: 50, frostDamage: 250 } },
        { id: 'frost_shield', name: 'Ледяной щит', rarity: 'rare', effect: { frostShield: true } },
        { id: 'frost_burst', name: 'Ледяной взрыв', rarity: 'epic', effect: { frostBurst: true } }
    ],
    poison: [
        { id: 'poison_damage_1', name: 'Урон яда +50', rarity: 'common', effect: { poisonDamage: 50 } },
        { id: 'poison_stack_1', name: 'Стаки яда +2', rarity: 'uncommon', effect: { poisonStack: 2 } },
        { id: 'poison_duration_1', name: 'Длительность +3с', rarity: 'rare', effect: { poisonDuration: 3 } },
        { id: 'poison_explode', name: 'Взрыв яда', rarity: 'epic', effect: { poisonExplode: true } },
        { id: 'poison_master', name: 'Мастер яда', rarity: 'legendary', effect: { poisonDamage: 150, poisonStack: 5 } },
        { id: 'poison_venom', name: 'Смертельный яд', rarity: 'rare', effect: { deadlyPoison: true } },
        { id: 'poison_cloud', name: 'Ядовитое облако', rarity: 'epic', effect: { poisonCloud: true } }
    ],
    fury: [
        { id: 'fury_attack_1', name: 'Скорость атаки +10%', rarity: 'common', effect: { attackSpeed: 10 } },
        { id: 'fury_damage_1', name: 'Урон при ярости +75', rarity: 'uncommon', effect: { furyDamage: 75 } },
        { id: 'fury_stack_1', name: 'Стаки ярости +2', rarity: 'rare', effect: { furyStack: 2 } },
        { id: 'fury_berserk', name: 'Берсерк', rarity: 'epic', effect: { berserk: true } },
        { id: 'fury_master', name: 'Мастер ярости', rarity: 'legendary', effect: { attackSpeed: 30, furyDamage: 200 } }
    ],
    tank: [
        { id: 'tank_health_1', name: 'Здоровье +1000', rarity: 'common', effect: { health: 1000 } },
        { id: 'tank_armor_1', name: 'Броня +2', rarity: 'uncommon', effect: { armor: 2 } },
        { id: 'tank_regen_1', name: 'Реген +50/с', rarity: 'rare', effect: { regen: 50 } },
        { id: 'tank_thorns', name: 'Шипы', rarity: 'epic', effect: { thorns: true } },
        { id: 'tank_master', name: 'Мастер танка', rarity: 'legendary', effect: { health: 3000, armor: 5 } },
        { id: 'tank_taunt', name: 'Провокация', rarity: 'rare', effect: { taunt: true } },
        { id: 'tank_rage', name: 'Ярость танка', rarity: 'epic', effect: { tankRage: true } }
    ],
    evasion: [
        { id: 'evasion_chance_1', name: 'Шанс уклонения +10%', rarity: 'common', effect: { evasionChance: 10 } },
        { id: 'evasion_counter_1', name: 'Контратака при уклонении', rarity: 'uncommon', effect: { counterAttack: true } },
        { id: 'evasion_dodge_1', name: 'Полное уклонение +5%', rarity: 'rare', effect: { fullEvasion: 5 } },
        { id: 'evasion_blink', name: 'Блинк при уклонении', rarity: 'epic', effect: { blink: true } },
        { id: 'evasion_master', name: 'Мастер уклонения', rarity: 'legendary', effect: { evasionChance: 30, counterAttack: true } },
        { id: 'evasion_agility', name: 'Ловкость +20%', rarity: 'uncommon', effect: { agility: 20 } },
        { id: 'evasion_phase', name: 'Фазовый сдвиг', rarity: 'epic', effect: { phaseShift: true } }
    ],
    shield: [
        { id: 'shield_block_1', name: 'Блок +100', rarity: 'common', effect: { shieldBlock: 100 } },
        { id: 'shield_regen_1', name: 'Восстановление щита', rarity: 'uncommon', effect: { shieldRegen: true } },
        { id: 'shield_reflect_1', name: 'Отражение урона 20%', rarity: 'rare', effect: { reflect: 20 } },
        { id: 'shield_barrier', name: 'Барьер', rarity: 'epic', effect: { barrier: true } },
        { id: 'shield_master', name: 'Мастер щита', rarity: 'legendary', effect: { shieldBlock: 400, reflect: 40 } }
    ],
    ultimate: [
        { id: 'ult_cooldown_1', name: 'Перезарядка -20%', rarity: 'common', effect: { cooldown: -20 } },
        { id: 'ult_damage_1', name: 'Урон ульты +250', rarity: 'uncommon', effect: { ultDamage: 250 } },
        { id: 'ult_chain_1', name: 'Цепная ульта', rarity: 'rare', effect: { chain: true } },
        { id: 'ult_execute', name: 'Казнь', rarity: 'epic', effect: { execute: true } },
        { id: 'ult_master', name: 'Мастер ульты', rarity: 'legendary', effect: { ultDamage: 750, cooldown: -50 } },
        { id: 'ult_charge', name: 'Заряд ульты', rarity: 'uncommon', effect: { ultCharge: true } },
        { id: 'ult_overcharge', name: 'Перегрузка', rarity: 'epic', effect: { ultOvercharge: true } }
    ],
    heal: [
        { id: 'heal_regen_1', name: 'Регенерация +50', rarity: 'common', effect: { regen: 50 } },
        { id: 'heal_amount_1', name: 'Лечение +300', rarity: 'uncommon', effect: { healAmount: 300 } },
        { id: 'heal_on_hit_1', name: 'Лечение при атаке +100', rarity: 'rare', effect: { healOnHit: 100 } },
        { id: 'heal_shield', name: 'Щит восстановления', rarity: 'epic', effect: { healShield: true, shieldAmount: 1000 } },
        { id: 'heal_master', name: 'Мастер лечения', rarity: 'legendary', effect: { regen: 150, healAmount: 500 } },
        { id: 'heal_burst', name: 'Мгновенное лечение', rarity: 'rare', effect: { healBurst: true } },
        { id: 'heal_aoe', name: 'Массовое лечение', rarity: 'epic', effect: { healAOE: true } }
    ]
};

// Сохранение состояния в localStorage
function saveGameState() {
    if (gameState.roomId && gameState.playerName) {
        const savedState = {
            playerName: gameState.playerName,
            roomId: gameState.roomId,
            timestamp: Date.now()
        };
        localStorage.setItem('webgladiators_state', JSON.stringify(savedState));
    }
}

// Загрузка состояния из localStorage
function loadGameState() {
    try {
        const saved = localStorage.getItem('webgladiators_state');
        if (saved) {
            const state = JSON.parse(saved);
            // Проверяем, что сохраненное состояние не старше 24 часов
            const maxAge = 24 * 60 * 60 * 1000; // 24 часа
            if (Date.now() - state.timestamp < maxAge) {
                return state;
            } else {
                localStorage.removeItem('webgladiators_state');
            }
        }
    } catch (e) {
        console.error('Ошибка загрузки состояния:', e);
    }
    return null;
}

// Очистка сохраненного состояния
function clearSavedState() {
    localStorage.removeItem('webgladiators_state');
}

// Игровое состояние
let gameState = {
    socket: null,
    playerName: '',
    roomId: null,
    enemyName: '', // Имя противника
    enemyReady: false, // Статус готовности противника
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
    setupKeyboardControls();
});

// Настройка управления с клавиатуры
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        // Только на игровом экране
        if (gameState.currentScreen !== 'game') return;
        
        // Покупка карточек на 1-5
        if (e.key >= '1' && e.key <= '5') {
            const index = parseInt(e.key) - 1;
            if (gameState.shop && gameState.shop[index]) {
                buyCard(index);
            }
        }
        
        // Рерол магазина на R
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            refreshShop();
        }
    });
}

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
    
    // Проверяем сохраненное состояние при загрузке
    checkForReconnection();
}

// Проверка возможности переподключения
function checkForReconnection() {
    const savedState = loadGameState();
    if (savedState) {
        // Восстанавливаем имя игрока
        const nameInput = document.getElementById('player-name');
        if (nameInput) {
            nameInput.value = savedState.playerName;
        }
        
        // Показываем опцию переподключения
        showReconnectionOption(savedState);
    }
}

// Показать опцию переподключения
function showReconnectionOption(savedState) {
    const statusDiv = document.getElementById('connection-status');
    if (!statusDiv) return;
    
    const reconnectDiv = document.createElement('div');
    reconnectDiv.className = 'reconnect-option';
    reconnectDiv.innerHTML = `
        <div class="reconnect-info">
            <strong>🔄 Обнаружена сохраненная игра</strong>
            <div>Комната: ${savedState.roomId}</div>
            <div>Игрок: ${savedState.playerName}</div>
        </div>
        <button id="reconnect-btn" class="btn btn-primary">Переподключиться к игре</button>
        <button id="clear-saved-btn" class="btn btn-secondary btn-small">Начать новую игру</button>
    `;
    
    statusDiv.appendChild(reconnectDiv);
    
    document.getElementById('reconnect-btn').addEventListener('click', () => {
        reconnectToGame(savedState);
    });
    
    document.getElementById('clear-saved-btn').addEventListener('click', () => {
        clearSavedState();
        reconnectDiv.remove();
        showStatus('Сохраненное состояние очищено', 'info');
    });
}

// Переподключение к сохраненной игре
function reconnectToGame(savedState) {
    if (!savedState.playerName || !savedState.roomId) {
        showStatus('Ошибка: нет данных для переподключения', 'error');
        return;
    }
    
    gameState.playerName = savedState.playerName;
    gameState.roomId = savedState.roomId;
    
    initSocketConnection();
    
    showStatus('Переподключение к игре...', 'info');
    
    // Если сокет уже подключен, сразу отправляем запрос
    if (gameState.socket.connected) {
        gameState.socket.emit('join-room', { 
            roomId: savedState.roomId, 
            playerName: savedState.playerName 
        });
    } else {
        gameState.socket.once('connect', () => {
            gameState.socket.emit('join-room', { 
                roomId: savedState.roomId, 
                playerName: savedState.playerName 
            });
        });
    }
    
    // Обработка успешного переподключения
    gameState.socket.once('joined-room', (roomId) => {
        gameState.roomId = roomId;
        showStatus('Переподключение успешно!', 'success');
        refreshRoomsList();
    });
    
    gameState.socket.once('reconnected', (data) => {
        // Восстановление состояния будет обработано в setupSocketListeners
        showStatus('✅ Игра восстановлена!', 'success');
    });
    
    // Обработка ошибок
    gameState.socket.once('error', (error) => {
        showStatus(`Ошибка переподключения: ${error}`, 'error');
        // Если комната не найдена, очищаем сохраненное состояние
        if (error.includes('не найдена') || error.includes('заполнена')) {
            clearSavedState();
            setTimeout(() => {
                checkForReconnection();
            }, 1000);
        }
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
        saveGameState(); // Сохраняем состояние
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
        saveGameState(); // Сохраняем состояние
        showStatus('Подключено к комнате!', 'success');
        refreshRoomsList(); // Обновляем список комнат
    });
    
    // Обработка ошибок
    gameState.socket.once('error', (error) => {
        showStatus(`Ошибка: ${error}`, 'error');
        setTimeout(() => refreshRoomsList(), 1000);
    });
}

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
        // Обновляем стили для магазина
        gameState.availableStyles = data.styles;
        gameState.blockedStyles = data.blockedStyles || [];
        
        // Если герой еще не выбран - показываем выбор
        if (!gameState.selectedHero) {
            gameState.gold = STARTING_GOLD;
            gameState.selectedHero = null;
            gameState.gladiator = null;
            gameState.cards = [];
            
            showScreen('hero-selection');
            renderHeroSelection();
            addLog(`Доступные стили: ${data.styles.map(s => ALL_STYLES.find(st => st.id === s)?.name || s).join(', ')}`, 'info');
            addLog(`Заблокированные: ${data.blockedStyles.map(s => ALL_STYLES.find(st => st.id === s)?.name || s).join(', ')}`, 'info');
        } else {
            // Если герой уже выбран - просто обновляем магазин
            generateShop();
            renderGladiator();
            updateUI();
            addLog(`Новые доступные стили: ${data.styles.map(s => ALL_STYLES.find(st => st.id === s)?.name || s).join(', ')}`, 'info');
        }
    });
    
    gameState.socket.on('hero-selected', (data) => {
        if (data.playerId !== gameState.socket.id) {
            addLog('Противник выбрал героя', 'info');
            // Обновляем информацию о противнике на экране выбора
            updateEnemySelectionInfo();
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
            gameState.enemyReady = data.ready;
            renderEnemyInfo();
            addLog(data.ready ? 'Противник готов к бою!' : 'Противник отменил готовность', 'info');
        }
    });
    
    gameState.socket.on('battle-started', (data) => {
        addLog('=== БОЙ НАЧАЛСЯ ===', 'info');
        document.getElementById('battle-status').textContent = 'Бой идет...';
        
        // Очищаем журнал боя
        const battleLogContainer = document.getElementById('battle-log');
        if (battleLogContainer) {
            battleLogContainer.innerHTML = '';
        }
        
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
    
    // Обработка урона для анимации
    gameState.socket.on('battle-damage', (data) => {
        const isPlayer1 = data.target === 1;
        const targetElementId = isPlayer1 ? 'player-battle-info' : 'enemy-battle-info';
        showDamageNumber(targetElementId, data.damage, data.isCrit, data.isEvaded, data.blockedDamage || 0);
    });
    
    // Обработка лечения для анимации
    gameState.socket.on('battle-heal', (data) => {
        const isPlayer1 = data.target === 1;
        const targetElementId = isPlayer1 ? 'player-battle-info' : 'enemy-battle-info';
        showHealNumber(targetElementId, data.amount);
    });
    
    gameState.socket.on('battle-result', (result) => {
        // Скрываем визуализацию боя
        setTimeout(() => {
            hideBattleVisualization();
        }, 500);
        
        const isWinner = result.winner === gameState.socket.id;
        gameState.lives = isWinner ? result.winnerLives : result.loserLives;
        
        // Показываем результат только после завершения визуализации
        setTimeout(() => {
            showBattleResult(isWinner, result);
            
            if (result.gameOver) {
                addLog(isWinner ? '🎉 ПОБЕДА! ИГРА ОКОНЧЕНА!' : '💀 ПОРАЖЕНИЕ! ИГРА ОКОНЧЕНА!', 'info');
            } else {
                gameState.round++;
                
                // Золото уже обновлено на сервере с учетом бонуса
                if (result.player1Gold !== undefined || result.player2Gold !== undefined) {
                    const isPlayer1 = result.player1Id === gameState.socket.id;
                    gameState.gold = isPlayer1 ? result.player1Gold : result.player2Gold;
                }
                
                addLog(isWinner ? 
                    `🎉 Победа в раунде! Жизней: ${gameState.lives}, Золота: ${gameState.gold}` : 
                    `💀 Поражение в раунде. Жизней: ${gameState.lives}, Золота: ${gameState.gold}`, 'info');
                
                // Показываем лог боя если есть
                if (result.battleLog && result.battleLog.length > 0) {
                    addLog('--- Лог боя ---', 'info');
                    result.battleLog.slice(-15).forEach(log => {
                        if (log.includes('наносит')) {
                            addLog(log, 'damage');
                        } else if (log.includes('использует') || log.includes('Наносит')) {
                            addLog(log, 'info');
                        } else {
                            addLog(log, 'info');
                        }
                    });
                }
                
                // Генерация нового магазина будет после round-end
            }
            
            updateUI();
        }, 800);
    });
    
    gameState.socket.on('round-end', (data) => {
        gameState.isReady = false;
        
        // НЕ сбрасываем героя и карточки - они сохраняются между раундами!
        // gameState.selectedHero = null; // УБРАНО
        // gameState.gladiator = null; // УБРАНО
        // gameState.cards = []; // УБРАНО
        
        // Обновляем золото (герой и карточки сохраняются)
        if (data.player1Gold !== undefined || data.player2Gold !== undefined) {
            const isPlayer1 = gameState.socket.id === (data.player1Id || '');
            gameState.gold = isPlayer1 ? data.player1Gold : data.player2Gold;
        }
        
        // Обновляем информацию о противнике
        if (data.player1Name && data.player2Name) {
            const isPlayer1 = gameState.socket.id === (data.player1Id || '');
            gameState.enemyName = isPlayer1 ? data.player2Name : data.player1Name;
            gameState.enemyReady = isPlayer1 ? (data.player2Ready || false) : (data.player1Ready || false);
        }
        
        // Обновляем доступные стили для магазина
        if (data.availableStyles) {
            gameState.availableStyles = data.availableStyles;
            gameState.blockedStyles = data.blockedStyles || [];
            generateShop();
        }
        
        // Восстанавливаем здоровье гладиатора после боя
        if (gameState.gladiator) {
            gameState.gladiator.currentHealth = gameState.gladiator.maxHealth;
        }
        
        // Обновляем отображение противника
        renderEnemyInfo();
        
        // Скрываем визуализацию боя
        const battleViz = document.getElementById('battle-visualization');
        const enemyBattleViz = document.getElementById('enemy-battle-visualization');
        if (battleViz) battleViz.classList.add('hidden');
        if (enemyBattleViz) enemyBattleViz.classList.add('hidden');
        
        // Показываем обычное отображение
        const normalDisplay = document.getElementById('character-portrait');
        if (normalDisplay) {
            const img = document.getElementById('character-image');
            if (img && gameState.gladiator) {
                const heroImage = getHeroImage(gameState.gladiator);
                if (heroImage) img.src = heroImage;
            }
        }
        
        document.getElementById('ready-btn').classList.remove('hidden');
        document.getElementById('not-ready-btn').classList.add('hidden');
        document.getElementById('battle-status').textContent = 'Подготовка к следующему раунду';
        
        // Остаемся на игровом экране, не возвращаемся к выбору героя
        if (gameState.currentScreen !== 'game') {
            showScreen('game');
        }
        
        // Обновляем отображение
        renderGladiator();
        renderShop();
        updateUI();
        
        addLog('Раунд окончен. Покупайте карточки и готовьтесь к следующему бою!', 'info');
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
// Важно: сохраняем ссылку на оригинальную функцию ДО присваивания в window
if (typeof window !== 'undefined') {
    const originalConnectToRoom = connectToRoom;
    window.connectToRoom = function(roomId) {
        originalConnectToRoom(roomId);
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
        
        // Фильтруем карточки максимального уровня
        const availableCards = cardsWithRarity.filter(card => {
            const existingCard = gameState.cards.find(c => c.id === card.id);
            if (!existingCard) return true; // Новая карточка доступна
            
            const rarityInfo = RARITY[card.rarity];
            const maxLevel = rarityInfo.maxLevel || 5;
            return existingCard.level < maxLevel; // Доступна только если не максимального уровня
        });
        
        if (availableCards.length > 0) {
            const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
            gameState.shop.push({ ...randomCard, style });
        } else if (cardsWithRarity.length > 0) {
            // Если все карточки максимального уровня, берем любую (но она не будет доступна для покупки)
            const randomCard = cardsWithRarity[Math.floor(Math.random() * cardsWithRarity.length)];
            gameState.shop.push({ ...randomCard, style });
        } else {
            // Fallback на common если нет карт нужной редкости
            const commonCards = styleCards.filter(card => card.rarity === 'common');
            const availableCommon = commonCards.filter(card => {
                const existingCard = gameState.cards.find(c => c.id === card.id);
                if (!existingCard) return true;
                const rarityInfo = RARITY[card.rarity];
                const maxLevel = rarityInfo.maxLevel || 5;
                return existingCard.level < maxLevel;
            });
            
            if (availableCommon.length > 0) {
                const randomCard = availableCommon[Math.floor(Math.random() * availableCommon.length)];
                gameState.shop.push({ ...randomCard, style });
            } else if (commonCards.length > 0) {
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

// Получение пиксель-арт изображения для карточки
function getCardPixelArt(card) {
    if (!card) return '';
    
    // Можно использовать простые эмодзи или создать маппинг на изображения
    // Пока возвращаем пустую строку, чтобы использовались эмодзи из styleIcons
    // В будущем можно добавить маппинг на реальные изображения:
    // const CARD_PIXEL_ART = {
    //     'crit_chance_1': 'path/to/image.png',
    //     ...
    // };
    
    return '';
}

// Рендеринг магазина (новая версия с пиксель-арт)
function renderShop() {
    const shopContainer = document.getElementById('shop');
    if (!shopContainer) return;
    
    shopContainer.innerHTML = '';
    
    gameState.shop.forEach((card, index) => {
        const cardElement = document.createElement('div');
        
        // Определяем класс в зависимости от layout
        const isNewLayout = shopContainer.classList.contains('shop-grid-pixel') || 
                           document.querySelector('.main-content.new-layout');
        
        if (isNewLayout) {
            cardElement.className = 'shop-card-pixel';
        } else {
            cardElement.className = 'shop-card';
        }
        
        const rarityInfo = RARITY[card.rarity];
        const styleInfo = ALL_STYLES.find(s => s.id === card.style);
        const cardIcon = getCardPixelArt(card);
        
        if (isNewLayout) {
            // Новый стиль с пиксель-арт
            cardElement.style.borderColor = rarityInfo.color;
            cardElement.innerHTML = `
                ${cardIcon ? `<img src="${cardIcon}" alt="${card.name}" class="card-image">` : 
                  `<div class="card-image" style="background: ${styleInfo?.color || '#666'}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px;">${styleIcons[card.style] || '🎴'}</div>`}
                <div class="card-name-pixel">${card.name}</div>
                <div class="card-cost-pixel">${rarityInfo.cost}💰</div>
            `;
        } else {
            // Старый стиль
            cardElement.style.borderColor = rarityInfo.color;
            cardElement.innerHTML = `
                <div class="card-header" style="background: ${styleInfo?.color || '#666'}">
                    <span class="card-style">${styleInfo?.name || card.style}</span>
                    <span class="card-rarity" style="color: ${rarityInfo.color}">${rarityInfo.name}</span>
                </div>
                <div class="card-name">${card.name}</div>
                <div class="card-cost" style="color: #ffd700">${rarityInfo.cost} золота</div>
            `;
        }
        
        // Проверяем доступность карточки
        const existingCard = gameState.cards.find(c => c.id === card.id);
        const isMaxLevel = existingCard && existingCard.level >= (rarityInfo.maxLevel || 5);
        
        if (isMaxLevel) {
            cardElement.classList.add('max-level');
            cardElement.style.opacity = '0.5';
            cardElement.style.cursor = 'not-allowed';
        } else if (gameState.gold < rarityInfo.cost) {
            cardElement.classList.add('unaffordable');
        } else {
            cardElement.addEventListener('click', () => buyCard(index));
        }
        
        shopContainer.appendChild(cardElement);
    });
}

// Иконки стилей для карточек
const styleIcons = {
    'critical': '⚔️',
    'frost': '❄️',
    'poison': '☠️',
    'fury': '⚡',
    'tank': '🛡️',
    'evasion': '💨',
    'shield': '🛡️',
    'ultimate': '✨',
    'heal': '💚'
};

// Покупка карточки
function buyCard(shopIndex) {
    const card = gameState.shop[shopIndex];
    const rarityInfo = RARITY[card.rarity];
    
    if (gameState.gold < rarityInfo.cost) {
        addLog('Недостаточно золота!', 'info');
        return;
    }
    
    // Проверяем есть ли уже такая карточка
    const existingCardIndex = gameState.cards.findIndex(c => c.id === card.id);
    
    if (existingCardIndex >= 0) {
        // Карточка уже есть - повышаем уровень
        const existingCard = gameState.cards[existingCardIndex];
        const maxLevel = rarityInfo.maxLevel || 5;
        
        if (existingCard.level >= maxLevel) {
            addLog(`Карточка "${card.name}" уже максимального уровня (${maxLevel})!`, 'info');
            return;
        }
        
        // Повышаем уровень
        existingCard.level = (existingCard.level || 1) + 1;
        
        // Применяем эффект с учетом уровня (бонус увеличивается)
        const levelMultiplier = existingCard.level === maxLevel ? 1.5 : 1.2; // Последний уровень дает 1.5x бонус
        applyCardEffect(card, false, levelMultiplier);
        
        gameState.gold -= rarityInfo.cost;
        gameState.shop.splice(shopIndex, 1);
        addLog(`Карточка "${card.name}" повышена до уровня ${existingCard.level} (${RARITY[card.rarity].name})!`, 'info');
    } else {
        // Новая карточка
        card.level = 1;
        gameState.gold -= rarityInfo.cost;
        gameState.cards.push(card);
        applyCardEffect(card);
        
        gameState.shop.splice(shopIndex, 1);
        addLog(`Куплена карточка: ${card.name} (${RARITY[card.rarity].name})`, 'info');
    }
    
    // Обновляем отображение с новыми шансами
    const styleProgress = getStyleProgress();
    renderShop();
    renderRarityChances(styleProgress);
    renderGladiator();
    updateUI();
}

// Применение эффекта карточки
function applyCardEffect(card, silent = false, levelMultiplier = 1.0) {
    const effect = card.effect;
    
    if (!gameState.gladiator) {
        console.error('Гладиатор не создан!');
        return;
    }
    
    // Если карточка имеет уровень больше 1, эффекты уже масштабированы
    const level = card.level || 1;
    const multiplier = levelMultiplier;
    
    const oldStats = {
        health: gameState.gladiator.maxHealth,
        armor: gameState.gladiator.armor,
        damage: gameState.gladiator.damage,
        attackSpeed: gameState.gladiator.attackSpeed
    };
    
    // Применяем базовые характеристики с учетом уровня
    if (effect.health) {
        const bonus = Math.floor(effect.health * multiplier);
        gameState.gladiator.maxHealth += bonus;
        gameState.gladiator.currentHealth += bonus;
        if (!silent) addLog(`+${bonus} к здоровью!`, 'heal');
    }
    if (effect.armor) {
        const bonus = Math.floor(effect.armor * multiplier);
        gameState.gladiator.armor += bonus;
        if (!silent) addLog(`+${bonus} к броне!`, 'info');
    }
    if (effect.damage) {
        const bonus = Math.floor(effect.damage * multiplier);
        gameState.gladiator.damage += bonus;
        if (!silent) addLog(`+${bonus} к урону!`, 'info');
    }
    if (effect.attackSpeed) {
        const bonus = effect.attackSpeed * multiplier;
        gameState.gladiator.attackSpeed += bonus / 100;
        if (!silent) addLog(`+${bonus.toFixed(1)}% к скорости атаки!`, 'info');
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
        
        // Показываем обновленные характеристики
        const statChanges = [];
        if (effect.health) {
            statChanges.push(`HP: ${oldStats.health} → ${gameState.gladiator.maxHealth}`);
        }
        if (effect.armor) {
            statChanges.push(`Броня: ${oldStats.armor} → ${gameState.gladiator.armor}`);
        }
        if (effect.damage) {
            statChanges.push(`Урон: ${oldStats.damage} → ${gameState.gladiator.damage}`);
        }
        if (effect.attackSpeed) {
            statChanges.push(`Скорость: ${oldStats.attackSpeed.toFixed(2)} → ${gameState.gladiator.attackSpeed.toFixed(2)}`);
        }
        
        if (statChanges.length > 0) {
            addLog(`📊 Новые характеристики: ${statChanges.join(', ')}`, 'info');
        }
        
        // Обновляем отображение характеристик
        renderGladiator();
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

// Рендеринг гладиатора (новая версия для нового layout)
function renderGladiator() {
    // Характеристики слева
    const statsContainer = document.getElementById('character-stats');
    const abilitiesContainer = document.getElementById('character-abilities');
    const portraitImg = document.getElementById('character-image');
    
    if (!gameState.gladiator) return;
    
    const gladiator = gameState.gladiator;
    
    // Характеристики
    if (statsContainer) {
        // Получаем текущие характеристики из эффектов
        const effects = gladiator.effects || {};
        const critChance = effects.critChance || 0;
        const evasionChance = effects.evasionChance || 0;
        const regen = effects.regen || 0;
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">HP:</span>
                <span class="stat-value">${Math.ceil(gladiator.currentHealth)}/${gladiator.maxHealth}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Урон:</span>
                <span class="stat-value">${gladiator.damage}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Броня:</span>
                <span class="stat-value">${gladiator.armor}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Скорость атаки:</span>
                <span class="stat-value">${gladiator.attackSpeed.toFixed(2)}</span>
            </div>
            ${critChance > 0 ? `<div class="stat-item"><span class="stat-label">Шанс крита:</span><span class="stat-value">${critChance}%</span></div>` : ''}
            ${evasionChance > 0 ? `<div class="stat-item"><span class="stat-label">Уклонение:</span><span class="stat-value">${evasionChance}%</span></div>` : ''}
            ${regen > 0 ? `<div class="stat-item"><span class="stat-label">Регенерация:</span><span class="stat-value">+${regen}/сек</span></div>` : ''}
        `;
    }
    
    // Способности
    if (abilitiesContainer) {
        abilitiesContainer.innerHTML = `
            <div class="ability-item">
                <h5>⚡ ${gladiator.passive.name}</h5>
                <p>${gladiator.passive.description}</p>
            </div>
            <div class="ability-item">
                <h5>✨ ${gladiator.active.name}</h5>
                <p>${gladiator.active.description}</p>
                <p style="font-size: 0.75em; opacity: 0.7; margin-top: 5px;">
                    Мана: ${gladiator.active.manaCost} | КД: ${gladiator.active.cooldown/1000}с
                </p>
            </div>
        `;
    }
    
    // Изображение персонажа по центру
    if (portraitImg) {
        const heroImage = getHeroImage(gladiator);
        if (heroImage) {
            portraitImg.src = heroImage;
            portraitImg.style.display = 'block';
        } else {
            portraitImg.style.display = 'none';
        }
    }
    
    // Купленные способности справа
    renderOwnedCards();
    
    // Отображаем информацию о противнике
    renderEnemyInfo();
    
    // Fallback для старого layout
    const gladiatorContainer = document.getElementById('gladiator');
    if (gladiatorContainer && !statsContainer) {
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
            </div>
        `;
    }
}

// Рендеринг информации о противнике
function renderEnemyInfo() {
    const enemyContainer = document.getElementById('enemy-gladiator-normal');
    if (!enemyContainer) return;
    
    if (!gameState.enemyName) {
        enemyContainer.innerHTML = '<p>Ожидание противника...</p>';
        return;
    }
    
    const readyStatus = gameState.enemyReady ? 
        '<span style="color: #4caf50; font-weight: bold;">✓ Готов</span>' : 
        '<span style="color: #ff9800;">Ожидание...</span>';
    
    enemyContainer.innerHTML = `
        <div class="enemy-player-info">
            <div class="enemy-name" style="font-weight: bold; font-size: 1.1em; margin-bottom: 8px;">${gameState.enemyName}</div>
            <div class="enemy-ready-status">${readyStatus}</div>
        </div>
    `;
}

// Обновление информации о противнике на экране выбора
function updateEnemySelectionInfo() {
    const enemyNameEl = document.getElementById('enemy-name-selection');
    const enemyReadyEl = document.getElementById('enemy-ready-selection');
    if (enemyNameEl) {
        enemyNameEl.textContent = gameState.enemyName || 'Ожидание...';
    }
    if (enemyReadyEl) {
        enemyReadyEl.textContent = gameState.enemyName ? 'Ожидание выбора' : 'Ожидание...';
    }
}

// Рендеринг купленных карточек
function renderOwnedCards() {
    const ownedContainer = document.getElementById('owned-cards');
    if (!ownedContainer) return;
    
    if (gameState.cards.length === 0) {
        ownedContainer.innerHTML = '<div style="text-align: center; opacity: 0.5; padding: 20px;">Нет купленных способностей</div>';
        return;
    }
    
    ownedContainer.innerHTML = gameState.cards.map(card => {
        const level = card.level || 1;
        const levelText = level > 1 ? ` Lv${level}` : '';
        const cardIcon = getCardPixelArt(card);
        
        return `
            <div class="owned-card-pixel" style="border-color: ${RARITY[card.rarity].color};">
                ${cardIcon ? `<img src="${cardIcon}" alt="${card.name}">` : 
                  `<div style="width:32px;height:32px;background:${ALL_STYLES.find(s => s.id === card.style)?.color || '#666'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">${styleIcons[card.style] || '🎴'}</div>`}
                <span style="color: ${RARITY[card.rarity].color}; font-size: 0.65em; font-weight: bold;">${card.name}${levelText}</span>
            </div>
        `;
    }).join('');
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
    // Нельзя отменить готовность во время боя
    const battleViz = document.getElementById('battle-visualization');
    if (battleViz && !battleViz.classList.contains('hidden')) {
        addLog('Нельзя отменить готовность во время боя!', 'error');
        return;
    }
    
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
    
    // Показываем визуализацию боя
    if (battleViz) {
        battleViz.classList.remove('hidden');
        battleViz.classList.add('battle-fullscreen');
    }
    if (enemyBattleViz) enemyBattleViz.classList.remove('hidden');
    
    // Скрываем магазин и другие элементы
    const shopPanel = document.querySelector('.bottom-panel-shop');
    const leftPanel = document.querySelector('.left-panel-character');
    const rightPanel = document.querySelector('.right-panel-character');
    const gameLog = document.querySelector('.game-log-section');
    const notReadyBtn = document.getElementById('not-ready-btn');
    const readyBtn = document.getElementById('ready-btn');
    
    if (shopPanel) shopPanel.classList.add('hidden');
    if (leftPanel) leftPanel.classList.add('hidden');
    if (rightPanel) rightPanel.classList.add('hidden');
    if (gameLog) gameLog.classList.add('hidden');
    if (notReadyBtn) notReadyBtn.classList.add('hidden');
    if (readyBtn) readyBtn.classList.add('hidden');
    
    // Запускаем таймер боя
    battleStartTime = Date.now();
    if (battleTimerInterval) clearInterval(battleTimerInterval);
    battleTimerInterval = setInterval(() => {
        if (battleStartTime) {
            const elapsed = (Date.now() - battleStartTime) / 1000;
            updateBattleTimer(elapsed);
        }
    }, 100);
    
    // Определяем какой гладиатор наш
    const isPlayer1 = data.gladiator1.name === gameState.gladiator?.name;
    const playerGlad = isPlayer1 ? data.gladiator1 : data.gladiator2;
    const enemyGlad = isPlayer1 ? data.gladiator2 : data.gladiator1;
    const playerName = gameState.playerName;
    const enemyName = gameState.enemyName || (isPlayer1 ? data.player2Name : data.player1Name) || '';
    
    updateBattleGladiator('player-battle-info', playerGlad, false, playerName);
    updateBattleGladiator('enemy-battle-info', enemyGlad, true, enemyName);
}

function hideBattleVisualization() {
    const battleViz = document.getElementById('battle-visualization');
    if (battleViz) {
        battleViz.classList.add('hidden');
        battleViz.classList.remove('battle-fullscreen');
    }
    
    // Показываем обратно скрытые элементы
    const shopPanel = document.querySelector('.bottom-panel-shop');
    const leftPanel = document.querySelector('.left-panel-character');
    const rightPanel = document.querySelector('.right-panel-character');
    const gameLog = document.querySelector('.game-log-section');
    const notReadyBtn = document.getElementById('not-ready-btn');
    const readyBtn = document.getElementById('ready-btn');
    
    if (shopPanel) shopPanel.classList.remove('hidden');
    if (leftPanel) leftPanel.classList.remove('hidden');
    if (rightPanel) rightPanel.classList.remove('hidden');
    if (gameLog) gameLog.classList.remove('hidden');
    
    // Показываем кнопки готовности в зависимости от состояния
    if (gameState.isReady && notReadyBtn) {
        notReadyBtn.classList.remove('hidden');
        if (readyBtn) readyBtn.classList.add('hidden');
    } else if (!gameState.isReady && readyBtn) {
        readyBtn.classList.remove('hidden');
        if (notReadyBtn) notReadyBtn.classList.add('hidden');
    }
    
    if (battleTimerInterval) {
        clearInterval(battleTimerInterval);
        battleTimerInterval = null;
    }
    battleStartTime = null;
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
function updateBattleGladiator(elementId, gladiator, isEnemy, playerName = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const healthPercent = Math.max(0, Math.min(100, (gladiator.health / gladiator.maxHealth) * 100));
    const manaPercent = Math.max(0, Math.min(100, (gladiator.mana / gladiator.maxMana) * 100));
    const heroImage = getHeroImage(gladiator);
    const displayName = playerName || gladiator.name;
    
    element.innerHTML = `
        <div class="battle-hero-container">
            <div class="battle-hero-image-container ${isEnemy ? 'enemy' : 'player'}">
                ${heroImage ? `<img src="${heroImage}" alt="${gladiator.name}" class="battle-hero-image" onerror="this.onerror=null; this.src=''; this.style.display='none'">` : `<div class="battle-hero-placeholder">${gladiator.name.charAt(0)}</div>`}
            </div>
            <div class="battle-hero-info">
                <div class="battle-player-name">${displayName}</div>
                <div class="battle-gladiator-name">${gladiator.name}</div>
                <div class="battle-health-bar" style="position: relative;">
                    <div class="battle-health-fill" style="width: ${healthPercent}%"></div>
                    <div class="battle-health-text" style="position: absolute; width: 100%; text-align: center; z-index: 10; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); top: 50%; transform: translateY(-50%); font-size: 0.85em;">${Math.ceil(gladiator.health)}/${gladiator.maxHealth}</div>
                </div>
                <div class="battle-mana-bar" style="position: relative;">
                    <div class="battle-mana-fill" style="width: ${manaPercent}%"></div>
                    <div class="battle-mana-text" style="position: absolute; width: 100%; text-align: center; z-index: 10; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); top: 50%; transform: translateY(-50%); font-size: 0.85em;">${Math.ceil(gladiator.mana)}/${gladiator.maxMana}</div>
                </div>
            </div>
        </div>
    `;
}

// Обновить визуализацию боя
let battleStartTime = null;
let battleTimerInterval = null;

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
    
    // Обновляем таймер боя
    if (update.time !== undefined) {
        updateBattleTimer(update.time);
    }
}

function updateBattleTimer(timeInSeconds) {
    const timerElement = document.getElementById('battle-timer');
    if (timerElement) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Показать число урона/блока
function showDamageNumber(elementId, damage, isCrit, isEvaded, blockedDamage) {
    const container = document.querySelector(`#${elementId} .damage-numbers-container`);
    if (!container) return;
    
    const numberDiv = document.createElement('div');
    numberDiv.className = 'damage-number';
    
    if (isEvaded) {
        numberDiv.className += ' evaded';
        numberDiv.textContent = 'УКЛОНЕНИЕ';
        numberDiv.style.color = '#ffff00';
    } else if (blockedDamage > 0) {
        numberDiv.className += ' blocked';
        numberDiv.innerHTML = `-${damage}<br><span style="font-size: 0.7em;">БЛОК ${blockedDamage}</span>`;
        numberDiv.style.color = '#4488ff';
    } else if (isCrit) {
        numberDiv.className += ' crit';
        numberDiv.textContent = `-${damage} КРИТ!`;
        numberDiv.style.color = '#ff4444';
        numberDiv.style.fontSize = '1.5em';
    } else {
        numberDiv.textContent = `-${damage}`;
        numberDiv.style.color = '#ff8888';
    }
    
    container.appendChild(numberDiv);
    
    // Анимация
    setTimeout(() => {
        numberDiv.style.transition = 'all 0.3s ease-out';
        numberDiv.style.opacity = '0';
        numberDiv.style.transform = 'translateY(-50px)';
        setTimeout(() => {
            if (numberDiv.parentNode) {
                numberDiv.parentNode.removeChild(numberDiv);
            }
        }, 300);
    }, 2000);
}

// Показать число лечения
function showHealNumber(elementId, amount) {
    const container = document.querySelector(`#${elementId} .damage-numbers-container`);
    if (!container) return;
    
    const numberDiv = document.createElement('div');
    numberDiv.className = 'damage-number heal';
    numberDiv.textContent = `+${amount}`;
    numberDiv.style.color = '#44ff44';
    
    container.appendChild(numberDiv);
    
    // Анимация
    setTimeout(() => {
        numberDiv.style.transition = 'all 0.3s ease-out';
        numberDiv.style.opacity = '0';
        numberDiv.style.transform = 'translateY(-50px)';
        setTimeout(() => {
            if (numberDiv.parentNode) {
                numberDiv.parentNode.removeChild(numberDiv);
            }
        }, 300);
    }, 2000);
}

// Добавить запись в журнал боя
function addToBattleLog(data) {
    const battleLogContainer = document.getElementById('battle-log');
    if (!battleLogContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'battle-log-entry';
    
    if (data.isEvaded) {
        logEntry.textContent = 'Уклонение!';
        logEntry.style.color = '#ffff00';
    } else if (data.blockedDamage > 0) {
        logEntry.textContent = `Урон: ${data.damage} (Заблокировано: ${data.blockedDamage})`;
        logEntry.style.color = '#4488ff';
    } else if (data.isCrit) {
        logEntry.textContent = `КРИТИЧЕСКИЙ УДАР: ${data.damage}!`;
        logEntry.style.color = '#ff4444';
        logEntry.style.fontWeight = 'bold';
    } else {
        logEntry.textContent = `Урон: ${data.damage}`;
        logEntry.style.color = '#ff8888';
    }
    
    battleLogContainer.appendChild(logEntry);
    
    // Автопрокрутка вниз
    battleLogContainer.scrollTop = battleLogContainer.scrollHeight;
    
    // Ограничиваем количество записей
    while (battleLogContainer.children.length > 50) {
        battleLogContainer.removeChild(battleLogContainer.firstChild);
    }
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
    gameState.roomId = null;
    gameState.playerName = '';
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
    
    clearSavedState(); // Очищаем сохраненное состояние
    
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
    document.getElementById('player-name').value = '';
    
    // Проверяем возможность переподключения после сброса
    setTimeout(() => {
        checkForReconnection();
    }, 100);
}
