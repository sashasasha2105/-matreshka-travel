/**
 * 🍎 APPLE CARDS CAROUSEL
 * Горизонтальная карусель в стиле Apple для пакетов путешествий
 * Vanilla JavaScript компонент с touch support
 */

class AppleCardsCarousel {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'appleCardsCarousel',
      title: options.title || 'Готовые пакеты путешествий',
      cards: options.cards || [],
      onCardClick: options.onCardClick || null,
      showNavButtons: options.showNavButtons !== undefined ? options.showNavButtons : true,
      showDots: options.showDots !== undefined ? options.showDots : false,
      ...options
    };

    this.state = {
      currentIndex: 0,
      cards: this.options.cards,
      isDragging: false,
      startX: 0,
      scrollLeft: 0
    };

    this.container = null;
    this.track = null;
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
   * Рендер карусели
   */
  render() {
    const section = document.createElement('div');
    section.className = 'apple-carousel-section';

    section.innerHTML = `
      <div class="apple-carousel-container">
        <h2 class="apple-carousel-title">${this.options.title}</h2>
        <div class="apple-carousel-wrapper">
          ${this.options.showNavButtons ? '<button class="apple-carousel-nav apple-carousel-nav-prev" aria-label="Previous">‹</button>' : ''}
          <div class="apple-carousel-track" id="appleCarouselTrack">
            ${this.state.cards.map((card, index) => this.createCard(card, index)).join('')}
          </div>
          ${this.options.showNavButtons ? '<button class="apple-carousel-nav apple-carousel-nav-next" aria-label="Next">›</button>' : ''}
        </div>
        ${this.options.showDots ? this.createDots() : ''}
      </div>
    `;

    this.container.innerHTML = '';
    this.container.appendChild(section);

    this.track = document.getElementById('appleCarouselTrack');
  }

  /**
   * Создание карточки
   */
  createCard(card, index) {
    return `
      <div class="apple-card" data-index="${index}" tabindex="0" role="button" aria-label="Пакет ${card.name}">
        <img
          src="${card.image}"
          alt="${card.name}"
          class="apple-card-image"
          loading="${index < 3 ? 'eager' : 'lazy'}"
        />
        <div class="apple-card-overlay">
          <div class="apple-card-category">${card.duration}</div>
          <div class="apple-card-title">${card.name}</div>
          <div class="apple-card-description">${card.description}</div>
          <div class="apple-card-meta">
            <span>📍 ${card.cities.length} ${this.pluralize(card.cities.length, 'город', 'города', 'городов')}</span>
            <span class="apple-card-price">${card.price}$</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Создание индикаторов (dots)
   */
  createDots() {
    const dots = this.state.cards.map((_, index) =>
      `<div class="apple-carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
    ).join('');

    return `<div class="apple-carousel-dots">${dots}</div>`;
  }

  /**
   * Привязка обработчиков событий
   */
  attachEventListeners() {
    const cards = this.container.querySelectorAll('.apple-card');

    // Клик по карточке
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (!this.state.isDragging) {
          this.handleCardClick(this.state.cards[index], index);
        }
      });

      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCardClick(this.state.cards[index], index);
        }
      });
    });

    // Touch/Drag support для трека
    if (this.track) {
      // Mouse events
      this.track.addEventListener('mousedown', this.handleDragStart.bind(this));
      this.track.addEventListener('mousemove', this.handleDragMove.bind(this));
      this.track.addEventListener('mouseup', this.handleDragEnd.bind(this));
      this.track.addEventListener('mouseleave', this.handleDragEnd.bind(this));

      // Touch events
      this.track.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: true });
      this.track.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: true });
      this.track.addEventListener('touchend', this.handleDragEnd.bind(this));
    }

    // Кнопки навигации
    if (this.options.showNavButtons) {
      const prevBtn = this.container.querySelector('.apple-carousel-nav-prev');
      const nextBtn = this.container.querySelector('.apple-carousel-nav-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.scrollPrev());
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.scrollNext());
      }
    }

    // Индикаторы (dots)
    if (this.options.showDots) {
      const dots = this.container.querySelectorAll('.apple-carousel-dot');
      dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.scrollToIndex(index);
        });
      });
    }

    // Обновление активного индикатора при скролле
    if (this.track) {
      this.track.addEventListener('scroll', this.updateActiveDot.bind(this));
    }
  }

  /**
   * Обработка начала драга
   */
  handleDragStart(e) {
    this.state.isDragging = true;
    this.state.startX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX;
    this.state.scrollLeft = this.track.scrollLeft;
    this.track.style.cursor = 'grabbing';
  }

  /**
   * Обработка движения драга
   */
  handleDragMove(e) {
    if (!this.state.isDragging) return;

    e.preventDefault();
    const x = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX;
    const walk = (x - this.state.startX) * 2;
    this.track.scrollLeft = this.state.scrollLeft - walk;
  }

  /**
   * Обработка окончания драга
   */
  handleDragEnd() {
    this.state.isDragging = false;
    this.track.style.cursor = 'grab';
  }

  /**
   * Обработка клика на карточке
   */
  handleCardClick(card, index) {
    console.log('🍎 Клик на пакет:', card.name);

    if (this.options.onCardClick) {
      this.options.onCardClick(card, index);
    } else {
      // Дефолтное поведение - переход на детальную страницу
      if (card.id) {
        if (typeof showPackageDetails === 'function') {
          showPackageDetails(card.id);
        }
      }
    }
  }

  /**
   * Скролл к предыдущей карточке
   */
  scrollPrev() {
    if (this.state.currentIndex > 0) {
      this.state.currentIndex--;
      this.scrollToIndex(this.state.currentIndex);
    }
  }

  /**
   * Скролл к следующей карточке
   */
  scrollNext() {
    if (this.state.currentIndex < this.state.cards.length - 1) {
      this.state.currentIndex++;
      this.scrollToIndex(this.state.currentIndex);
    }
  }

  /**
   * Скролл к карточке по индексу
   */
  scrollToIndex(index) {
    const cards = this.container.querySelectorAll('.apple-card');
    if (cards[index]) {
      const cardWidth = cards[index].offsetWidth;
      const gap = 24; // 1.5rem gap
      const scrollPosition = (cardWidth + gap) * index;

      this.track.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });

      this.state.currentIndex = index;
      this.updateActiveDot();
    }
  }

  /**
   * Обновление активного индикатора
   */
  updateActiveDot() {
    if (!this.options.showDots) return;

    const dots = this.container.querySelectorAll('.apple-carousel-dot');
    if (dots.length === 0) return;

    // Вычисляем текущий индекс на основе позиции скролла
    const scrollLeft = this.track.scrollLeft;
    const cardWidth = this.container.querySelector('.apple-card')?.offsetWidth || 0;
    const gap = 24;
    const currentIndex = Math.round(scrollLeft / (cardWidth + gap));

    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /**
   * Вспомогательная функция для плюрализации
   */
  pluralize(count, one, few, many) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return one;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return few;
    } else {
      return many;
    }
  }

  /**
   * Обновление карточек
   */
  updateCards(newCards) {
    this.state.cards = newCards;
    this.state.currentIndex = 0;
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
    this.state.currentIndex = 0;
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
window.AppleCardsCarousel = AppleCardsCarousel;
