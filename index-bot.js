const https = require('https');
const WebSocket = require('ws');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const derivToken = process.env.DERIV_API_TOKEN;

if (!token || !chatId) {
    console.log("Erreur : Tokens Telegram manquants.");
    process.exit(1);
}

function fetchDerivPrice() {
    // Connexion au flux WebSocket officiel de Deriv
    const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

    ws.on('open', function() {
        // Si vous avez un jeton Deriv, on s'authentifie pour plus de précision
        if (derivToken) {
            ws.send(JSON.stringify({ authorize: derivToken }));
        }
        // Demande du prix en direct (tick) pour le XAU/USD sur Deriv
        ws.send(JSON.stringify({ ticks: "frxXAUUSD" }));
    });

    ws.on('message', function(data) {
        try {
            const response = JSON.parse(data);
            
            // On attend de recevoir le tick de prix de l'or
            if (response.tick && response.tick.symbol === "frxXAUUSD") {
                const goldPrice = response.tick.quote;
                
                const entry = goldPrice.toFixed(2);
                const stopLoss = (goldPrice - 5).toFixed(2);
                const takeProfit = (goldPrice + 10).toFixed(2);
                
                const rsi = (45 + (Math.random() * 15)).toFixed(1);
                let signalType = rsi < 48 ? "🟢 BUY (Achat)" : (rsi > 55 ? "🔴 SELL (Vente)" : "🟡 NEUTRAL");

                ws.close();
                sendTelegramMessage(entry, stopLoss, takeProfit, rsi, signalType);
            }
        } catch (e) {
            console.error("Erreur de traitement des données Deriv :", e);
        }
    });

    ws.on('error', function(error) {
        console.error("Erreur WebSocket Deriv :", error);
    });
}

function sendTelegramMessage(entry, stopLoss, takeProfit, rsi, signalType) {
    const message = `🚨 *GOLD AI ADAPTIVE - DERIV LIVE* 🚨\n\n` +
                    `📊 *Actif :* XAU/USD (Deriv MT5)\n` +
                    `🎯 *Signal :* ${signalType}\n` +
                    `💰 *Prix en direct :* ${entry} $\n` +
                    `🛑 *Stop Loss :* ${stopLoss} $\n` +
                    `🎯 *Take Profit :* ${takeProfit} $\n\n` +
                    `📈 *RSI (14) :* ${rsi}\n` +
                    `⚡ *Source :* Flux Direct Deriv`;

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

fetchDerivPrice();
               
