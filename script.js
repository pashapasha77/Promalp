// ========== ДАННЫЕ УСЛУГ ==========
const servicesData = [
    // Фасадные работы
    { name: 'Утепление фасада', unit: 'м²', price: 2500, category: 'facade' },
    { name: 'Герметизация панельных швов', unit: 'м.п.', price: 800, category: 'facade' },
    { name: 'Покраска фасада', unit: 'м²', price: 150, category: 'facade' },
    { name: 'Мойка окон', unit: 'м²', price: 150, category: 'facade' },
    { name: 'Мойка фасада', unit: 'м²', price: 100, category: 'facade' },
    // Кровельные работы
    { name: 'Чистка снега', unit: 'м²', price: 60, category: 'roof' },
    { name: 'Удаление наледи', unit: 'м.п.', price: 200, category: 'roof' },
    { name: 'Удаление сосулек', unit: 'м.п.', price: 100, category: 'roof' },
    { name: 'Монтаж водосточных систем', unit: 'м.п.', price: 620, category: 'roof' },
    { name: 'Установка снегозадержателей', unit: 'м.п.', price: 500, category: 'roof' },
    // Монтажные работы
    { name: 'Монтаж кондиционеров', unit: 'шт.', price: 11000, category: 'mount' },
    { name: 'Монтаж рекламы', unit: 'шт.', price: 500, category: 'mount' },
    // Прочие услуги
    { name: 'Демонтажные работы', unit: 'час', price: 300, category: 'other' },
    { name: 'Спил деревьев', unit: 'шт.', price: 15000, category: 'other' }
];

const MIN_ORDER = 10000;

const pricesMap = {};
servicesData.forEach(s => { pricesMap[s.name] = { price: s.price, unit: s.unit }; });

// ========== МОБИЛЬНОЕ МЕНЮ ==========
const toggle = document.getElementById('mobile-toggle');
const menu = document.getElementById('nav-menu');
if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('active'));
}

// ========== СЛАЙДЕР НА ГЛАВНОЙ ==========
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.slider-arrow--prev');
const nextBtn = document.querySelector('.slider-arrow--next');
const dotsContainer = document.getElementById('slider-dots');

if (slides.length > 0) {
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === index);
        });
        if (dotsContainer) {
            dotsContainer.innerHTML = slides.map((_, i) =>
                `<button class="slider-dot ${i === index ? 'active' : ''}" data-index="${i}"></button>`
            ).join('');
        }
    }

    function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); }
    function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; showSlide(currentSlide); }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('slider-dot')) {
                currentSlide = parseInt(e.target.dataset.index);
                showSlide(currentSlide);
            }
        });
    }

    showSlide(0);
    setInterval(nextSlide, 6000);
}

// ========== ТАБЛИЦА УСЛУГ ==========
const tbody = document.getElementById('services-tbody');

function renderServicesTable(category = 'all') {
    if (!tbody) return;

    const filtered = category === 'all' ? servicesData : servicesData.filter(s => s.category === category);
    tbody.innerHTML = filtered.map(s =>
        `<tr><td>${s.name}</td><td>${s.unit}</td><td>от ${s.price.toLocaleString('ru-RU')} ₽</td></tr>`
    ).join('');

    populateServiceSelects(category);
    calculatePricePage();
}

function populateServiceSelects(category = 'all') {
    const filtered = category === 'all' ? servicesData : servicesData.filter(s => s.category === category);

    const selects = [
        document.getElementById('service-select'),
        document.getElementById('home-service-select'),
        document.getElementById('service-select-page'),
        document.getElementById('service-select-form')
    ];

    selects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '';

        if (select.id === 'service-select-form') {
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-- Выберите услугу --';
            emptyOption.disabled = true;
            emptyOption.selected = true;
            select.appendChild(emptyOption);
        }

        filtered.forEach(s => {
            const option = document.createElement('option');
            option.value = s.name;
            option.textContent = `${s.name} — от ${s.price} ₽/${s.unit}`;
            select.appendChild(option);
        });

        if (currentValue && [...select.options].some(o => o.value === currentValue)) {
            select.value = currentValue;
        }
    });
}

// Вкладки на странице услуг
document.querySelectorAll('.service-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.service-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderServicesTable(tab.dataset.tab);
    });
});

// ========== КАЛЬКУЛЯТОР НА СТРАНИЦЕ УСЛУГ ==========
const serviceSelectPage = document.getElementById('service-select-page');
const areaInputPage = document.getElementById('area-input-page');
const heightSelectPage = document.getElementById('height-select-page');

function calculatePricePage() {
    if (!serviceSelectPage || !areaInputPage || !serviceSelectPage.value) return;

    const service = pricesMap[serviceSelectPage.value];
    if (!service) return;

    const area = parseFloat(areaInputPage.value) || 0;
    const heightCoeff = heightSelectPage ? parseFloat(heightSelectPage.value) : 1.3;

    let basePrice = (service.unit === 'час' || service.unit === 'шт.' || service.unit === 'выезд' || service.unit === 'точка')
        ? service.price
        : service.price * area;

    let workPrice = Math.round(basePrice * heightCoeff);

    // Применяем минимальный заказ
    if (workPrice < MIN_ORDER) {
        workPrice = MIN_ORDER;
    }

    const totalPrice = workPrice;

    const workEl = document.getElementById('work-price-page');
    const totalEl = document.getElementById('total-price-page');
    const materialRow = document.getElementById('material-price-row');

    if (workEl) workEl.textContent = workPrice.toLocaleString('ru-RU');
    if (totalEl) totalEl.textContent = totalPrice.toLocaleString('ru-RU');
    if (materialRow) materialRow.style.display = 'none';
}

if (serviceSelectPage) serviceSelectPage.addEventListener('change', calculatePricePage);
if (areaInputPage) areaInputPage.addEventListener('input', calculatePricePage);
if (heightSelectPage) heightSelectPage.addEventListener('change', calculatePricePage);

// ========== ПОРТФОЛИО ==========
const portfolioGrid = document.getElementById('portfolio-grid');

const portfolioItems = [
    { title: 'Герметизация швов', desc: 'Жилой дом, ул. Советская, 15', img: 'https://www.gryazi.net/images/cleaning/prom_alp.jpg', category: 'facade' },
    { title: 'Мойка фасада', desc: 'Бизнес-центр "Волга", 12 этажей', img: 'https://proalp24.ru/assets/components/phpthumbof/cache/imagefas.871df799a6bba9999bb0e1b77e8e957b.png', category: 'facade' },
    { title: 'Утепление фасада', desc: 'Частный дом, п. Караваево', img: 'https://avatars.mds.yandex.net/get-altay/13818104/2a000001926dd8f69d3b70512914a5eb9f92/orig', category: 'facade' },
    { title: 'Покраска фасада', desc: 'Административное здание, ул. Ленина', img: 'https://oknaservis.su/images/maykafasad/IMG_09584.jpg', category: 'facade' },
    { title: 'Очистка кровли', desc: 'Складской комплекс', img: 'https://avatars.mds.yandex.net/get-altay/1546239/2a0000016c878817676379b7a8dd49487079/orig', category: 'roof' },
    { title: 'Удаление наледи', desc: 'ТЦ "Галерея"', img: 'https://i.ytimg.com/vi/OnxsX6CX49M/maxres2.jpg', category: 'roof' },
    { title: 'Монтаж водостоков', desc: 'Частный дом, п. Фанерник', img: 'https://avatars.mds.yandex.net/get-ydo/1384592/2a000001903fb4f37ba64515c0dbf9463fd2/diploma', category: 'roof' },
    { title: 'Монтаж рекламы', desc: 'ТЦ "РИО", крышная установка', img: 'https://www.gryazi.net/images/cleaning/prom_alp.jpg', category: 'mount' },
    { title: 'Монтаж кондиционера', desc: 'Офисное здание, ул. Никитская', img: 'https://oknaservis.su/images/maykafasad/IMG_09584.jpg', category: 'mount' },
    { title: 'Спил деревьев', desc: 'Частный сектор, ул. Зелёная', img: 'https://avatars.mds.yandex.net/get-ydo/2353700/2a000001750707cd09f3af2a811d3dc740dd/diploma', category: 'other' },
    { title: 'Демонтаж конструкций', desc: 'Промышленный объект', img: 'https://proalp24.ru/assets/components/phpthumbof/cache/imagefas.871df799a6bba9999bb0e1b77e8e957b.png', category: 'other' }
];
function renderPortfolio(category = 'all') {
    if (!portfolioGrid) return;

    const filtered = category === 'all' ? portfolioItems : portfolioItems.filter(p => p.category === category);

    portfolioGrid.innerHTML = filtered.map(item => `
        <div class="portfolio-card">
            <div class="portfolio-card__image">
                <img src="${item.img}" alt="${item.title}" loading="lazy">
                <span class="portfolio-card__category">${getCategoryName(item.category)}</span>
            </div>
            <div class="portfolio-card__content">
                <h3 class="portfolio-card__title">${item.title}</h3>
                <p class="portfolio-card__desc">${item.desc}</p>
                <div class="portfolio-card__meta">
                    <span><i class="fas fa-map-marker-alt"></i> Кострома</span>
                    <span><i class="fas fa-check-circle"></i> Выполнено</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryName(cat) {
    const names = { facade: 'Фасад', roof: 'Кровля', mount: 'Монтаж', other: 'Прочее' };
    return names[cat] || cat;
}

// Фильтр портфолио
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPortfolio(btn.dataset.filter);
    });
});

if (portfolioGrid) renderPortfolio('all');

// ========== ОТЗЫВЫ (СЛАЙДЕР) ==========
const reviewsContainer = document.getElementById('reviews-container');
const sliderDots = document.getElementById('slider-dots');

if (reviewsContainer) {
    const reviews = [
        { name: 'Алексей Петров', text: 'Отличная работа! Быстро и качественно утеплили фасад офисного здания.', stars: 5 },
        { name: 'Елена Смирнова', text: 'Заказывали очистку кровли от снега. Приехали в тот же день.', stars: 5 },
        { name: 'ООО "СтройГрад"', text: 'Сотрудничаем на постоянной основе. Настоящие профи!', stars: 5 }
    ];

    let currentReview = 0;

    function renderReviews() {
        reviewsContainer.innerHTML = reviews.map((r, i) => `
            <div class="review-card" style="display: ${i === currentReview ? 'block' : 'none'};">
                <div class="review-card__avatar">${r.name.charAt(0)}</div>
                <div class="review-card__name">${r.name}</div>
                <div class="review-card__stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
                <div class="review-card__text">«${r.text}»</div>
            </div>
        `).join('');

        if (sliderDots) {
            sliderDots.innerHTML = reviews.map((_, i) =>
                `<button class="slider-dot ${i === currentReview ? 'active' : ''}" data-index="${i}"></button>`
            ).join('');
        }
    }

    function showReview(index) {
        currentReview = (index + reviews.length) % reviews.length;
        reviewsContainer.querySelectorAll('.review-card').forEach((card, i) => {
            card.style.display = i === currentReview ? 'block' : 'none';
        });
        if (sliderDots) {
            sliderDots.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentReview);
            });
        }
    }

    document.querySelector('.slider-arrows--prev')?.addEventListener('click', () => showReview(currentReview - 1));
    document.querySelector('.slider-arrows--next')?.addEventListener('click', () => showReview(currentReview + 1));
    sliderDots?.addEventListener('click', (e) => {
        if (e.target.classList.contains('slider-dot')) {
            showReview(parseInt(e.target.dataset.index));
        }
    });

    renderReviews();
    setInterval(() => showReview(currentReview + 1), 8000);
}

// ========== ФОРМЫ ==========
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        form.reset();
    });
});

// ========== КНОПКА ВК ==========
const vkBtn = document.querySelector('.vk-button');
if (vkBtn) vkBtn.href = 'https://vk.com/write-12345678';

// ========== КНОПКА "ЗАКАЗАТЬ ЗВОНОК" ==========
document.querySelectorAll('.btn-callback').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('📞 Пожалуйста, позвоните нам по номеру 8-952-233-91-45 или оставьте заявку на странице Контакты.');
    });
});

// ========== ПЛАВНАЯ ПРОКРУТКА ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#about') {
            const target = document.querySelector('#about') || document.querySelector('.advantages');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ========== ОТКРЫТИЕ НУЖНОЙ ВКЛАДКИ ПО URL ==========
function openTabFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
        const tabBtn = document.querySelector(`.service-tab-btn[data-tab="${tab}"]`);
        if (tabBtn) {
            setTimeout(() => tabBtn.click(), 100);
        }
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
populateServiceSelects('all');

if (tbody) {
    renderServicesTable('all');
    openTabFromUrl();
}

setTimeout(() => {
    calculatePricePage();
}, 100);

// Закрытие мобильного меню при клике вне
document.addEventListener('click', (e) => {
    if (menu && menu.classList.contains('active') && !e.target.closest('.nav') && !e.target.closest('.mobile-toggle')) {
        menu.classList.remove('active');
    }
});

// Открытие выпадающего меню по клику (а не при наведении)
document.querySelectorAll('.nav-item.dropdown').forEach(item => {
    const toggle = item.querySelector('.dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Закрываем другие открытые меню
        document.querySelectorAll('.nav-item.dropdown').forEach(other => {
            if (other !== item) {
                other.classList.remove('active');
            }
        });

        // Переключаем текущее меню
        item.classList.toggle('active');
    });
});

// Закрытие меню при клике вне
document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item.dropdown')) {
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            item.classList.remove('active');
        });
    }
});

// Открытие выпадающего меню по клику на мобильных устройствах
document.querySelectorAll('.nav-item.dropdown').forEach(item => {
    const link = item.querySelector('.nav-link');
    if (!link) return;

    link.addEventListener('click', function(e) {
        // Проверяем, находимся ли мы на мобильном устройстве (ширина экрана до 768px)
        if (window.innerWidth <= 768) {
            e.preventDefault(); // Отменяем переход по ссылке

            // Закрываем другие открытые меню
            document.querySelectorAll('.nav-item.dropdown').forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                }
            });

            // Переключаем текущее меню
            item.classList.toggle('active');
        }
    });
});

// Закрытие меню при клике вне
document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item.dropdown')) {
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            item.classList.remove('active');
        });
    }
});

// Закрытие меню при изменении размера экрана (если стало больше 768px)
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            item.classList.remove('active');
        });
    }
});
