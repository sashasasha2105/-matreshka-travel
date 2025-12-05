# 🎨 Aceternity UI Demo

## Готовые компоненты из Aceternity UI

Я создал **6 полноценных компонентов** из Aceternity UI, адаптированных для Vanilla JS:

---

## ✨ Созданные компоненты

### 1. **Spotlight Card**
📁 `components/aceternity/spotlight-card.js`
- Карточка со светящимся эффектом при наведении
- Источник: https://ui.aceternity.com/components/card-spotlight

### 2. **Background Beams**
📁 `components/aceternity/background-beams.js`
- Анимированные световые лучи на фоне
- Идеально для hero секций
- Источник: https://ui.aceternity.com/components/background-beams

### 3. **Shimmer Button**
📁 `components/aceternity/shimmer-button.js`
- Кнопка с эффектом блеска
- Источник: https://ui.aceternity.com/components/shimmer-button

### 4. **Text Generate Effect**
📁 `components/aceternity/text-generate.js`
- Анимация появления текста по словам/буквам
- Источник: https://ui.aceternity.com/components/text-generate-effect

### 5. **Moving Border Button**
📁 `components/aceternity/moving-border-button.js`
- Кнопка с вращающейся границей
- Источник: https://ui.aceternity.com/components/moving-border

### 6. **3D Card Effect**
📁 `components/aceternity/card-3d.js`
- Карточка с 3D перспективой при наведении
- Источник: https://ui.aceternity.com/components/3d-card-effect

---

## 🚀 Открыть демо

```bash
open aceternity_showcase.html
```

Или запусти локальный сервер:

```bash
python3 -m http.server 8000
# Открой: http://localhost:8000/aceternity_showcase.html
```

---

## 📦 Что в демо?

### Hero секция
- ✨ Background Beams на фоне
- 📝 Text Generate Effect для заголовков
- 🔘 Shimmer и Moving Border кнопки

### Spotlight Cards
- 3 карточки с разными цветами подсветки
- Эффект следования за курсором

### 3D Cards
- 2 карточки с 3D эффектом
- Реагируют на движение мыши

### Кнопки
- Shimmer Button (синяя)
- Moving Border Button
- Shimmer Button (фиолетовая)

### Text Generate
- Появление текста по словам
- С blur эффектом

### Background Beams
- Демо секция с анимированными лучами
- Настраиваемые цвета и скорость

---

## 💻 Быстрое использование

### Пример 1: Spotlight Card

```html
<!-- Подключи компонент -->
<script src="components/aceternity/spotlight-card.js" defer></script>

<!-- Контейнер -->
<div id="myCard"></div>

<script>
new SpotlightCard('myCard', {
    title: 'Заголовок',
    description: 'Описание карточки',
    icon: '✨',
    spotlightColor: 'rgba(59, 130, 246, 0.3)'
});
</script>
```

### Пример 2: Background Beams

```html
<script src="components/aceternity/background-beams.js" defer></script>

<div style="position: relative; height: 100vh;">
    <div id="beams"></div>
    <div style="position: relative; z-index: 10;">
        <h1>Твой контент</h1>
    </div>
</div>

<script>
new BackgroundBeams('beams', {
    beamCount: 8,
    colors: ['#3b82f6', '#8b5cf6', '#ec4899']
});
</script>
```

### Пример 3: Shimmer Button

```html
<script src="components/aceternity/shimmer-button.js" defer></script>

<div id="myButton"></div>

<script>
new ShimmerButton('myButton', {
    text: 'Нажми меня',
    backgroundColor: '#3b82f6',
    onClick: () => alert('Clicked!')
});
</script>
```

### Пример 4: Text Generate

```html
<script src="components/aceternity/text-generate.js" defer></script>

<div id="myText"></div>

<script>
new TextGenerate('myText', {
    text: 'Этот текст появится по словам',
    duration: 50,
    animateBy: 'words'
});
</script>
```

---

## 🎯 Структура файлов

```
PythonProject20/
├── aceternity_showcase.html          # 🎨 ГЛАВНОЕ ДЕМО
│
├── components/aceternity/
│   ├── spotlight-card.js             # ✨ Spotlight Card
│   ├── background-beams.js           # 🌟 Background Beams
│   ├── shimmer-button.js             # 💫 Shimmer Button
│   ├── text-generate.js              # 📝 Text Generate
│   ├── moving-border-button.js       # 🔘 Moving Border Button
│   └── card-3d.js                    # 🎴 3D Card
│
├── scripts/utils/
│   ├── animations.js                 # 🎬 Animation utilities
│   └── aceternity-adapter.js         # 🔄 Adapter
│
└── Документация/
    ├── ACETERNITY_README.md          # Главный README
    ├── ACETERNITY_QUICKSTART.md      # Быстрый старт
    ├── ACETERNITY_INTEGRATION_GUIDE.md # Полный гайд
    └── ACETERNITY_DEMO.md            # Этот файл
```

---

## 🎪 Что показывает демо?

1. **Hero секция с Background Beams**
   - Анимированный фон с лучами света
   - Text Generate эффект для заголовка
   - 2 разных типа кнопок

2. **Секция Spotlight Cards**
   - 3 карточки с информацией о городах России
   - Эффект spotlight при наведении

3. **Секция 3D Cards**
   - 2 карточки с 3D перспективой
   - Отслеживание движения мыши

4. **Секция с кнопками**
   - Демонстрация всех типов кнопок
   - С разными цветами и эффектами

5. **Text Generate демо**
   - Появление текста по словам
   - 2 блока текста с задержкой

6. **Background Beams демо**
   - Отдельная секция для демонстрации лучей
   - С контентом поверх

7. **Гайд по интеграции**
   - 4 простых шага для добавления компонента
   - С примерами кода

---

## 📚 Дополнительные ресурсы

- **Исходники компонентов**: `components/aceternity/`
- **Утилиты**: `scripts/utils/`
- **Документация**: `ACETERNITY_*.md` файлы
- **Другие демо**: `demo_aceternity_*.html`

---

## 🔥 Следующие шаги

1. **Открой демо** - посмотри все компоненты в действии
2. **Изучи код** - открой исходники компонентов
3. **Попробуй сам** - скопируй код и адаптируй под свои нужды
4. **Добавь новые** - используй шаблон `_template.js`

---

## 💡 Советы

- Все компоненты **независимы** - можно использовать любой отдельно
- Компоненты **настраиваемые** - смотри опции в конструкторе
- Все эффекты **оптимизированы** - используют CSS transitions
- Компоненты **адаптивны** - работают на всех устройствах

---

Made with ❤️ for Матрешка Travel App
Inspired by [Aceternity UI](https://ui.aceternity.com/)
