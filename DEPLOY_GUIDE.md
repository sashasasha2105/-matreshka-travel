# Руководство по развертыванию бота 24/7

## Вариант 1: Развертывание на VPS (Рекомендуется)

### Шаг 1: Подготовка сервера
```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Python и зависимости
sudo apt install python3 python3-pip python3-venv git -y
```

### Шаг 2: Клонирование проекта
```bash
cd /opt
sudo git clone https://github.com/sashasasha2105/-matreshka-travel.git matreshka
cd matreshka
```

### Шаг 3: Установка зависимостей
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Шаг 4: Настройка systemd service
```bash
sudo nano /etc/systemd/system/matreshka-bot.service
```

Вставьте следующее содержимое:
```ini
[Unit]
Description=Matreshka Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/matreshka
Environment="PATH=/opt/matreshka/venv/bin"
ExecStart=/opt/matreshka/venv/bin/python3 /opt/matreshka/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Шаг 5: Запуск бота
```bash
sudo systemctl daemon-reload
sudo systemctl enable matreshka-bot
sudo systemctl start matreshka-bot
```

### Проверка статуса
```bash
sudo systemctl status matreshka-bot
journalctl -u matreshka-bot -f
```

---

## Вариант 2: PythonAnywhere (Бесплатно)

1. Зарегистрируйтесь на https://www.pythonanywhere.com
2. Загрузите файлы проекта
3. Откройте Bash консоль
4. Установите зависимости:
```bash
pip3 install --user -r requirements.txt
```
5. Запустите бота в фоне:
```bash
nohup python3 bot.py > bot.log 2>&1 &
```

---

## Вариант 3: Heroku

1. Создайте `Procfile`:
```
worker: python bot.py
```

2. Деплой:
```bash
heroku login
heroku create matreshka-bot
git push heroku main
heroku ps:scale worker=1
```

---

## Вариант 4: Docker (Продвинутый)

Используйте готовый Dockerfile из проекта:
```bash
docker build -t matreshka-bot .
docker run -d --name matreshka --restart always matreshka-bot
```

---

## Мониторинг

### Просмотр логов systemd
```bash
journalctl -u matreshka-bot -f
```

### Перезапуск бота
```bash
sudo systemctl restart matreshka-bot
```

### Остановка бота
```bash
sudo systemctl stop matreshka-bot
```