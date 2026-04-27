/**
 * 🎨 MINIMAL FOCUS CARDS
 * Минималистичные карточки регионов в стиле date picker
 * Без золота, без лишних эффектов - только аккуратный focus
 */

class MinimalFocusCards {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'focusCardsContainer',
      cards: options.cards || [],
      onCardClick: options.onCardClick || null,
      ...options
    };

    this.state = {
      hoveredIndex: null,
      cards: this.options.cards
    };

    this.container = null;
    this.init();
  }

  /**
   * Инициализация компонента
   */
  init() {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`Контейнер #${this.options.containerId} не найден`);
      return;
    }

    this.container = container;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Рендер сетки карточек
   */
  render() {
    const grid = document.createElement('div');
    grid.className = 'focus-cards-grid';
    grid.id = 'focusCardsGrid';

    this.state.cards.forEach((card, index) => {
      const cardElement = this.createCard(card, index);
      grid.appendChild(cardElement);
    });

    this.container.innerHTML = '';
    this.container.appendChild(grid);
  }

  /**
   * Создание карточки
   */
  createCard(card, index) {
    const cardEl = document.createElement('div');
    cardEl.className = 'focus-card';
    cardEl.dataset.index = index;
    cardEl.tabIndex = 0;
    cardEl.setAttribute('role', 'button');
    cardEl.setAttribute('aria-label', `Регион ${card.name}`);

    cardEl.innerHTML = `
      <img
        src="${card.image}"
        alt="${card.name}"
        class="focus-card-image"
        loading="${index < 6 ? 'eager' : 'lazy'}"
      />
      <div class="focus-card-overlay">
        <div class="focus-card-title">${card.name}</div>
        <div class="focus-card-description">${card.description}</div>
        <div class="focus-card-meta">
          <span>👥 ${card.population}</span>
          <span>📐 ${card.area}</span>
        </div>
      </div>
    `;

    return cardEl;
  }

  /**
   * Привязка обработчиков событий
   */
  attachEventListeners() {
    const cards = this.container.querySelectorAll('.focus-card');

    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    cards.forEach((card, index) => {
      if (!isTouch) {
        // Hover-эффекты только на не-тач устройствах
        card.addEventListener('mouseenter', () => {
          this.handleCardHover(index);
        });
        card.addEventListener('mouseleave', () => {
          this.handleCardLeave();
        });
      }

      // Тач: срабатываем на touchend чтобы не ждать 300ms и не терять цель
      if (isTouch) {
        let touchMoved = false;
        card.addEventListener('touchstart', () => { touchMoved = false; }, { passive: true });
        card.addEventListener('touchmove', () => { touchMoved = true; }, { passive: true });
        card.addEventListener('touchend', (e) => {
          if (!touchMoved) {
            e.preventDefault();
            this.handleCardClick(this.state.cards[index], index);
          }
        });
      } else {
        card.addEventListener('click', () => {
          this.handleCardClick(this.state.cards[index], index);
        });
      }

      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCardClick(this.state.cards[index], index);
        }
      });
    });
  }

  /**
   * Обработка hover на карточке
   */
  handleCardHover(index) {
    this.state.hoveredIndex = index;
    const cards = this.container.querySelectorAll('.focus-card');

    cards.forEach((card, cardIndex) => {
      if (cardIndex !== index) {
        card.classList.add('blurred');
      } else {
        card.classList.remove('blurred');
      }
    });
  }

  /**
   * Обработка ухода курсора
   */
  handleCardLeave() {
    this.state.hoveredIndex = null;
    const cards = this.container.querySelectorAll('.focus-card');

    cards.forEach(card => {
      card.classList.remove('blurred');
    });
  }

  /**
   * Обработка клика на карточке
   */
  handleCardClick(card, index) {
    console.log('🎯 Клик на регион:', card.name);

    if (this.options.onCardClick) {
      this.options.onCardClick(card, index);
    } else {
      // Дефолтное поведение - переход на детальную страницу
      if (card.id) {
        // Вызываем глобальную функцию showRegionDetails если она есть
        if (typeof showRegionDetails === 'function') {
          showRegionDetails(card.id);
        }
      }
    }
  }

  /**
   * Обновление карточек
   */
  updateCards(newCards) {
    this.state.cards = newCards;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Добавление карточек
   */
  addCards(cards) {
    this.state.cards = [...this.state.cards, ...cards];
    this.render();
    this.attachEventListeners();
  }

  /**
   * Очистка всех карточек
   */
  clearCards() {
    this.state.cards = [];
    this.render();
  }

  /**
   * Получение всех карточек
   */
  getCards() {
    return this.state.cards;
  }

  /**
   * Уничтожение компонента
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Экспорт для глобального использования
window.MinimalFocusCards = MinimalFocusCards;

/**
 * Вспомогательная функция для конвертации данных регионов
 * из формата RUSSIA_REGIONS_DATA в формат для Focus Cards
 */
window.convertRegionsToCards = function(regionsData) {
  return Object.values(regionsData).map(region => ({
    id: region.id,
    name: region.name,
    description: region.description,
    image: region.image,
    population: region.population,
    area: region.area,
    emoji: region.emoji
  }));
};
