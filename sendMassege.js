// /path/to/your/project/sendMessage.js

// Завантажуємо змінні середовища з файлу .env
require('dotenv').config();

// Імпортуємо бібліотеку
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./logger');

// --- ВАШІ НАЛАШТУВАННЯ ---

// 1. Токен вашого бота з .env файлу
const BOT_TOKEN = process.env.BOT_TOKEN;

// 2. ID вашого публічного каналу з .env файлу
const CHANNEL_ID = process.env.CHANNEL_ID;

// 3. URL вашої мініпрограми (обов'язково з https://)
const MINI_APP_URL = process.env.MINI_APP_URL;

// --- КІНЕЦЬ НАЛАШТУВАНЬ ---

// Перевірка, чи всі необхідні змінні завантажено
if (!BOT_TOKEN || !CHANNEL_ID || !MINI_APP_URL) {
    logger.fatal('Missing required environment variables (BOT_TOKEN, CHANNEL_ID, MINI_APP_URL). Check your .env file.');
    process.exit(1); // Зупиняємо виконання, якщо конфігурація неповна
}

// Створюємо екземпляр бота. Ми не будемо запускати його в режимі опитування,
// оскільки нам потрібно лише надіслати одне повідомлення.
const bot = new TelegramBot(BOT_TOKEN);

// Асинхронна функція для надсилання повідомлення
async function sendMessageWithWebApp() {
    const text = "👋 Привіт!\n\nНатисніть кнопку нижче, щоб запустити наш додаток!";

    const options = {
        // Створюємо клавіатуру з кнопкою, що веде на Mini App
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '✨ Відкрити додаток ✨', // Текст на кнопці
                        web_app: { url: MINI_APP_URL } // Об'єкт WebAppInfo
                    }
                ]
            ]
        }
    };

    try {
        // Надсилаємо повідомлення в канал
        const sentMessage = await bot.sendMessage(CHANNEL_ID, text, options);
        logger.info({ channel: CHANNEL_ID, messageId: sentMessage.message_id }, 'Message sent successfully to channel');

        // Опціонально: закріпити повідомлення.
        // Для цього бот повинен мати права адміністратора "Закріплювати повідомлення".
        // await bot.pinChatMessage(CHANNEL_ID, sentMessage.message_id);
        // logger.info({ messageId: sentMessage.message_id }, 'Message pinned successfully.');

    } catch (error) {
        const errorDetails = {};
        // Виводимо більш детальну інформацію про помилку від API Telegram
        if (error.response && error.response.body) {
            // Тіло відповіді може бути рядком (потребує парсингу) або вже об'єктом.
            const errorBody = typeof error.response.body === 'string'
                ? JSON.parse(error.response.body)
                : error.response.body;
            errorDetails.code = errorBody.error_code || 'N/A';
            errorDetails.description = errorBody.description || 'No description';
        } else {
            errorDetails.message = error.message;
        }
        logger.error({ err: errorDetails }, 'Failed to send message. Check BOT_TOKEN, CHANNEL_ID, and bot admin permissions.');
    }
}

// Викликаємо нашу функцію
sendMessageWithWebApp();
