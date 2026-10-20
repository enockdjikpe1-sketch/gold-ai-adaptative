const WebSocket = require('ws');
const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function sendTelegram(message) {
    if (!TOKEN || !CHAT_ID) return;
    const data = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = https.request(options, (res) => {});
    req.write(data);
    req.end();
}

function calculateEMA(data, period) {
    let k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
        ema = (data[i] * k) + (ema * (1 - k));
    }
    return ema;
}

const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

ws.on('open', function() {
    ws.send(JSON.stringify({
        ticks_history: "frxXAUUSD",
        adjust_start_time: 1,
        count: 100,
        end: "latest",
        granularity: 900, // M15
        style: "candles"
    }));
});

ws.on('message', function(data) {
    try {
        const response = JSON.parse(data);
        if (response.msg_type === "candles") {
            const candles = response.candles;
            const closes = candles.map(c => c.close);
            const currentPrice = closes[closes.length - 1];
            const ema50 = calculateEMA(closes, 50);
            const ema200 = calculateEMA(closes, Math.min(200, closes.length));

            let signal = "NEUTRAL";
            if (ema50 > ema200 && currentPrice > ema50) signal = "BUY";
            else if (ema50 < ema200 && currentPrice < ema50) signal = "SELL";

            if (signal !== "NEUTRAL") {
                const msg = `🚨 *GOLD AI ADAPTIVE - SIGNAL* 🚨\n\n` +
                            `📈 *Symbole :* XAU/USD (Or)\n` +
                            `🎯 *Action :* ${signal === 'BUY' ? 'ACHAT (BUY)' : 'VENTE (SELL)'}\n` +
                            `💰 *Prix :* ${currentPrice.toFixed(2)}\n` +
                            `📊 *Régime :* Tendance détectée\n` +
                            `⏰ *Heure :* ${new Date().toLocaleTimeString()}\n\n` +
                            `_Ouvrez votre application Deriv/MT5 pour placer l'ordre._`;
                sendTelegram(msg);
            }
            setTimeout(() => { ws.close(); process.exit(0); }, 2000);
        }
    } catch(e) {
        process.exit(1);
    }
});
          
