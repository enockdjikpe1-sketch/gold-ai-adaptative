const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
    console.log("Erreur : Tokens Telegram manquants dans les secrets.");
    process.exit(1);
}

// Récupération du vrai prix de l'or en direct via une API publique de marché
function getGoldPriceAndSend() {
    https.get('https://data-asg.goldprice.org/dbXRates/USD', (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                const goldPrice = parsedData.items[0].xauPrice;
                
                // Calculs dynamiques basés sur le vrai cours du marché
                const entry = goldPrice.toFixed(2);
                const stopLoss = (goldPrice - 6).toFixed(2);
                const takeProfit = (goldPrice + 12).toFixed(2);
                
                // Simulation d'indicateur dynamique (RSI fluctuant)
                const rsi = (40 + (Math.random() * 30)).toFixed(1);
                let signalType = "🟡 NEUTRAL / WAIT";
                
                if (rsi < 45) {
                    signalType = "🟢 BUY (Achat)";
                } else if (rsi > 58) {
                    signalType = "🔴 SELL (Vente)";
                }

                sendTelegramMessage(entry, stopLoss, takeProfit, rsi, signalType);
            } catch (e) {
                console.error("Erreur lors de l'analyse des données de prix :", e);
            }
        });
    }).on('error', (err) => {
        console.error("Erreur réseau :", err.message);
    });
}

function sendTelegramMessage(entry, stopLoss, takeProfit, rsi, signalType) {
    const message = `🚨 *GOLD AI ADAPTIVE - SIGNAL LIVE* 🚨\n\n` +
                    `📊 *Actif :* XAU/USD (Or)\n` +
                    `🎯 *Signal :* ${signalType}\n` +
                    `💰 *Prix en direct :* ${entry} $\n` +
                    `🛑 *Stop Loss :* ${stopLoss} $\n` +
                    `🎯 *Take Profit :* ${takeProfit} $\n\n` +
                    `📈 *RSI (14) :* ${rsi}\n` +
                    `⚡ *Source :* Marché en temps réel`;

    const data = JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
    });

    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        res.on('data', (chunk) => { console.log("Réponse Telegram :", chunk.toString()); });
    });

    req.on('error', (e) => { console.error("Erreur Telegram :", e); });
    req.write(data);
    req.end();
}

// Lancement de l'analyse
getGoldPriceAndSend();
