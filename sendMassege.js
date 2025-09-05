// /path/to/your/project/sendMessage.js

// Завантажуємо змінні середовища з файлу .env
require('dotenv').config();

// Імпортуємо бібліотеку
const TelegramBot = require('node-telegram-bot-api');

// --- ВАШІ НАЛАШТУВАННЯ ---

// 1. Токен вашого бота з .env файлу
const BOT_TOKEN = process.env.BOT_TOKEN;

// 2. ID вашого публічного каналу з .env файлу
const CHANNEL_ID = process.env.CHANNEL_ID;

// 3. URL вашої мініпрограми (обов'язково з https://)
const MINI_APP_URL = process.env.MINI_APP_URL;

// --- КІНЕЦЬ НАЛАШТУВАНЬ ---

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
        console.log(`✅ Повідомлення успішно надіслано в канал ${CHANNEL_ID}`);
        console.log(`   ID повідомлення: ${sentMessage.message_id}`);

        // Опціонально: закріпити повідомлення.
        // Для цього бот повинен мати права адміністратора "Закріплювати повідомлення".
        // await bot.pinChatMessage(CHANNEL_ID, sentMessage.message_id);
        // console.log('   Повідомлення було успішно закріплено.');

    } catch (error) {
        console.error('❌ Сталася помилка під час надсилання повідомлення:');
        // Виводимо більш детальну інформацію про помилку від API Telegram
        if (error.response && error.response.body) {
            const errorBody = JSON.parse(error.response.body);
            console.error(`   [${errorBody.error_code}] ${errorBody.description}`);
        } else {
            console.error(error.message);
        }
        console.error('\n   Перевірте, чи правильно вказано BOT_TOKEN, CHANNEL_ID та чи додано бота в канал як адміністратора.');
    }
}

// Викликаємо нашу функцію
sendMessageWithWebApp();
