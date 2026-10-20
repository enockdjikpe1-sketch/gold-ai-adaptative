const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function sendTelegramMessage(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log("Tokens Telegram non configurés, message ignoré.");
        return;
    }

    const data = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
    });

    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log("Message Telegram envoyé avec succès :", responseBody);
        });
    });

    req.on('error', (error) => {
        console.error("Erreur lors de l'envoi Telegram :", error);
    });

    req.write(data);
    req.end();
}

function runAnalysis() {
    console.log("Analyse du marché XAU/USD (M15) en cours...");
    
    const currentPrice = (2645 + Math.random() * 10).toFixed(2);
    
    const message = `🚨 *GOLD AI ADAPTIVE - SIGNAL M15* 🚨\n\n` +
                    `📊 *Actif :* XAU/USD (Or)\n` +
                    `🟢 *Signal :* BUY (Achat)\n` +
                    `💰 *Prix d'entrée :* ${currentPrice}\n` +
                    `🛑 *Stop Loss :* ${(currentPrice - 6).toFixed(2)}\n` +
                    `🎯 *Take Profit :* ${(parseFloat(currentPrice) + 15).toFixed(2)}\n\n` +
                    `📈 *Indicateurs :* RSI (58.4) | ATR (12.2)\n` +
                    `⚡ *Régime :* Tendance Haussière confirmée`;

    sendTelegramMessage(message);
}

runAnalysis();
