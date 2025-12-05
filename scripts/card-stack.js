/**
 * 🃏 CARD STACK
 * Стек карточек партнёров с анимацией
 * Vanilla JavaScript компонент
 */

class CardStack {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'cardStackContainer',
      items: options.items || [],
      autoRotate: options.autoRotate !== undefined ? options.autoRotate : false,
      rotateInterval: options.rotateInterval || 5000,
      ...options
    };

    this.state = {
      items: [...this.options.items],
      currentIndex: 0,
      isAnimating: false
    };

    this.container = null;
    this.rotateTimer = null;
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

    if (this.options.autoRotate) {
      this.startAutoRotate();
    }
  }

  /**
   * Рендер стека карточек
   */
  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-stack-container';

    const stack = document.createElement('div');
    stack.className = 'card-stack';
    stack.id = 'cardStack';

    this.state.items.forEach((item, index) => {
      const card = this.createCard(item, index);
      stack.appendChild(card);
    });

    wrapper.appendChild(stack);

    this.container.innerHTML = '';
    this.container.appendChild(wrapper);
  }

  /**
   * Создание карточки
   */
  createCard(item, index) {
    const card = document.createElement('div');
    card.className = 'card-stack-item';
    card.dataset.index = index;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Партнёр ${item.name}`);

    card.innerHTML = `
      <div class="card-header">
        <div class="card-emoji">${item.emoji || '🏪'}</div>
        <div class="card-info">
          <div class="card-name">${item.name}</div>
          <div class="card-designation">${item.designation}</div>
          ${item.rating ? `<div class="card-rating">⭐ ${item.rating}</div>` : ''}
        </div>
      </div>
      <div class="card-content">${item.content}</div>
      ${item.offer ? `
        <div class="card-offer">
          <div class="card-offer-icon">🎁</div>
          <div class="card-offer-text">${item.offer}</div>
        </div>
      ` : ''}
    `;

    return card;
  }

  /**
   * Привязка обработчиков событий
   */
  attachEventListeners() {
    const stack = document.getElementById('cardStack');
    if (!stack) return;

    const cards = stack.querySelectorAll('.card-stack-item');

    cards.forEach((card, index) => {
      // Click - перемещаем карточку назад
      card.addEventListener('click', () => {
        if (this.state.isAnimating) return;
        this.rotateStack();
      });

      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (this.state.isAnimating) return;
          this.rotateStack();
        }
      });
    });
  }

  /**
   * Ротация стека - переместить верхнюю карточку назад
   */
  rotateStack() {
    if (this.state.isAnimating) return;

    this.state.isAnimating = true;

    const stack = document.getElementById('cardStack');
    const cards = Array.from(stack.querySelectorAll('.card-stack-item'));

    if (cards.length === 0) {
      this.state.isAnimating = false;
      return;
    }

    // Добавляем класс анимации выхода к первой карточке
    const firstCard = cards[0];
    firstCard.classList.add('exiting');

    // После анимации перемещаем карточку в конец
    setTimeout(() => {
      // Перемещаем данные в массиве
      const firstItem = this.state.items.shift();
      this.state.items.push(firstItem);

      // Перерисовываем
      this.render();
      this.attachEventListeners();

      this.state.isAnimating = false;
    }, 500);
  }

  /**
   * Запуск автоматической ротации
   */
  startAutoRotate() {
    this.stopAutoRotate();
    this.rotateTimer = setInterval(() => {
      this.rotateStack();
    }, this.options.rotateInterval);
  }

  /**
   * Остановка автоматической ротации
   */
  stopAutoRotate() {
    if (this.rotateTimer) {
      clearInterval(this.rotateTimer);
      this.rotateTimer = null;
    }
  }

  /**
   * Обновление items
   */
  updateItems(newItems) {
    this.state.items = [...newItems];
    this.state.currentIndex = 0;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Уничтожение компонента
   */
  destroy() {
    this.stopAutoRotate();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Экспорт для глобального использования
window.CardStack = CardStack;
