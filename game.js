// Константы
const STARTING_LIVES = 100;
const STARTING_GOLD = 10;
const SHOP_SIZE = 5;

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
    document.getElementById('connect-btn').addEventListener('click', connectToRoom);
    document.getElementById('create-room-btn').addEventListener('click', createRoom);
    document.getElementById('ready-btn').addEventListener('click', setReady);
    document.getElementById('not-ready-btn').addEventListener('click', setNotReady);
    document.getElementById('refresh-shop-btn').addEventListener('click', refreshShop);
}

// Создание комнаты
function createRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    const serverUrl = document.getElementById('server-url').value.trim() || window.defaultServerUrl || window.location.origin;
    
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
    const serverUrl = document.getElementById('server-url').value.trim() || window.defaultServerUrl || window.location.origin;
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
    
    gameState.socket.on('battle-started', () => {
        addLog('=== БОЙ НАЧАЛСЯ ===', 'info');
        document.getElementById('battle-status').textContent = 'Бой идет...';
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
        
        const styleInfo = ALL_STYLES.find(s => s.id === hero.style);
        
        heroCard.innerHTML = `
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

// Генерация магазина
function generateShop() {
    gameState.shop = [];
    
    for (let i = 0; i < SHOP_SIZE; i++) {
        // Выбираем случайный доступный стиль
        const style = gameState.availableStyles[Math.floor(Math.random() * gameState.availableStyles.length)];
        const styleCards = CARDS[style];
        
        // Выбираем случайную карточку с учетом редкости
        const rarityWeights = {
            common: 50,
            uncommon: 30,
            rare: 15,
            epic: 4,
            legendary: 1
        };
        
        const weightedCards = [];
        styleCards.forEach(card => {
            const weight = rarityWeights[card.rarity];
            for (let j = 0; j < weight; j++) {
                weightedCards.push({ ...card, style });
            }
        });
        
        const randomCard = weightedCards[Math.floor(Math.random() * weightedCards.length)];
        gameState.shop.push(randomCard);
    }
    
    renderShop();
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
    
    // Показываем доступные стили
    const stylesContainer = document.getElementById('available-styles');
    if (stylesContainer) {
        const availableStylesText = gameState.availableStyles.map(s => {
            const styleInfo = ALL_STYLES.find(st => st.id === s);
            return `<span style="color: ${styleInfo?.color || '#fff'}">${styleInfo?.name || s}</span>`;
        }).join(', ');
        stylesContainer.innerHTML = `<div class="styles-info"><strong>Доступные стили:</strong> ${availableStylesText}</div>`;
    }
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
    addLog(`Куплена карточка: ${card.name}`, 'info');
    
    renderShop();
    renderGladiator();
    updateUI();
}

// Применение эффекта карточки
function applyCardEffect(card) {
    const effect = card.effect;
    
    if (effect.health) {
        gameState.gladiator.maxHealth += effect.health;
        gameState.gladiator.currentHealth += effect.health;
    }
    if (effect.armor) gameState.gladiator.armor += effect.armor;
    if (effect.damage) gameState.gladiator.damage += effect.damage;
    if (effect.attackSpeed) gameState.gladiator.attackSpeed += effect.attackSpeed / 100;
    
    // Сохраняем эффекты для боя
    if (!gameState.gladiator.effects) gameState.gladiator.effects = {};
    Object.assign(gameState.gladiator.effects, effect);
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
                    ${gameState.cards.map(card => `
                        <div class="owned-card">
                            <span style="color: ${RARITY[card.rarity].color}">${card.name}</span>
                        </div>
                    `).join('')}
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
    
    if (gameState.socket) {
        gameState.socket.disconnect();
    }
    
    showScreen('connection');
    document.getElementById('log').innerHTML = '';
    document.getElementById('connection-status').textContent = '';
}
