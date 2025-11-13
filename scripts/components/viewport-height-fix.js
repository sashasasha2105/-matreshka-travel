/**
 * Исправление 100vh для iOS Safari
 * Устанавливает правильную высоту viewport с учетом адресной строки
 */

(function() {
    'use strict';

    function setViewportHeight() {
        // Получаем реальную высоту viewport
        const vh = window.innerHeight * 0.01;

        // Устанавливаем CSS переменную --vh
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        console.log('✅ Viewport height установлен:', vh, 'px');
    }

    // Устанавливаем при загрузке
    setViewportHeight();

    // Обновляем при изменении размера окна (с debounce)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setViewportHeight();
        }, 100);
    });

    // Обновляем при изменении ориентации
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 100);
    });

    // Для iOS Safari - обновляем при scroll (адресная строка показывается/скрывается)
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        let scrollTimeout;
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Проверяем изменилась ли высота viewport
            if (Math.abs(currentScrollY - lastScrollY) > 50) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    setViewportHeight();
                    lastScrollY = currentScrollY;
                }, 100);
            }
        }, { passive: true });
    }

    console.log('✅ Viewport height fix инициализирован');
})();
