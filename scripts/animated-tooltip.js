/**
 * 🎨 ANIMATED TOOLTIP
 * Интерактивные аватары команды с анимированными тултипами
 * Vanilla JavaScript компонент
 */

class AnimatedTooltip {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'animatedTooltipContainer',
      items: options.items || [],
      ...options
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
   * Рендер аватаров
   */
  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'animated-tooltip-container';

    this.options.items.forEach((item, index) => {
      const avatar = this.createAvatar(item, index);
      wrapper.appendChild(avatar);
    });

    this.container.innerHTML = '';
    this.container.appendChild(wrapper);
  }

  /**
   * Создание аватара
   */
  createAvatar(item, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tooltip-avatar-wrapper';
    wrapper.dataset.index = index;
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('aria-label', `${item.name}, ${item.designation}`);

    wrapper.innerHTML = `
      <img
        src="${item.image}"
        alt="${item.name}"
        class="tooltip-avatar"
        loading="${index < 4 ? 'eager' : 'lazy'}"
      />
      ${item.badge ? `<div class="avatar-badge">${item.badge}</div>` : ''}
      <div class="avatar-tooltip">
        <div class="tooltip-content">
          <div class="tooltip-name">${item.name}</div>
          <div class="tooltip-role">${item.designation}</div>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    `;

    return wrapper;
  }

  /**
   * Привязка обработчиков событий
   */
  attachEventListeners() {
    const avatars = this.container.querySelectorAll('.tooltip-avatar-wrapper');

    avatars.forEach(avatar => {
      // Для touch устройств - toggle tooltip при клике
      avatar.addEventListener('click', (e) => {
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
          e.preventDefault();

          // Закрываем все другие активные tooltip
          avatars.forEach(other => {
            if (other !== avatar) {
              other.classList.remove('active');
            }
          });

          // Toggle текущий
          avatar.classList.toggle('active');
        }
      });

      // Keyboard support
      avatar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          avatar.classList.toggle('active');
        }
      });
    });

    // Закрытие tooltip при клике вне
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tooltip-avatar-wrapper')) {
        avatars.forEach(avatar => {
          avatar.classList.remove('active');
        });
      }
    });
  }

  /**
   * Обновление items
   */
  updateItems(newItems) {
    this.options.items = newItems;
    this.render();
    this.attachEventListeners();
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
window.AnimatedTooltip = AnimatedTooltip;
