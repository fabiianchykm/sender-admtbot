// Завантажуємо змінні середовища
require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Отримуємо список ID адміністраторів з .env
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',');

// --- Наша імпровізована база даних ---
// В реальному проєкті тут буде підключення до PostgreSQL, MongoDB тощо.
let scheduleContent = {
    title: "Розклад Богослужінь",
    details: "Понеділок: 9:00\nВівторок: 18:00\nСереда: 9:00"
};
// ------------------------------------

// Налаштування сервера
app.use(cors()); // Дозволяє запити з інших доменів (важливо для GitHub Pages)
app.use(bodyParser.json()); // Дозволяє читати JSON з тіла запиту

/**
 * Middleware для валідації запиту від Telegram
 */
const validateTelegramAuth = (req, res, next) => {
    const { initData } = req.body;
    if (!initData) {
        return res.status(400).json({ message: 'initData is required' });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
        return res.status(403).json({ message: 'Authentication failed' });
    }

    req.user = JSON.parse(urlParams.get('user'));
    next();
};

/**
 * Головний ендпоінт для отримання даних.
 */
app.post('/api/data', validateTelegramAuth, (req, res) => {
    const userId = req.user.id;
    const isAdmin = ADMIN_IDS.includes(String(userId));

    console.log(`Валідований запит від User ID: ${userId}, isAdmin: ${isAdmin}`);

    res.json({
        ...scheduleContent,
        isAdmin: isAdmin
    });
});

/**
 * Ендпоінт для оновлення даних (доступний тільки для адмінів).
 */
app.post('/api/update', validateTelegramAuth, (req, res) => {
    const { title, details } = req.body;
    const userId = req.user.id;

    // Перевіряємо, чи є користувач адміном
    if (!ADMIN_IDS.includes(String(userId))) {
        return res.status(403).json({ message: 'Доступ заборонено' });
    }

    // Оновлюємо дані в "базі даних"
    scheduleContent.title = title;
    scheduleContent.details = details;

    console.log(`Контент оновлено адміністратором ${userId}`);

    res.json({ message: 'Дані успішно оновлено!', ...scheduleContent });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на порті ${PORT}`);
});