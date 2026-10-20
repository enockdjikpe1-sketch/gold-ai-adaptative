const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
    console.log("Erreur : Tokens Telegram manquants dans les secrets.");
    process.exit(1);
}

const data = JSON.stringify({
    chat_id: chatId,
    text: "🚨 *GOLD AI ADAPTIVE - SIGNAL TEST M15* 🚨\n\n📊 Actif : XAU/USD (Or)\n🟢 Signal : BUY (Achat)\n💰 Prix : 2650.00\n✨ Le bot tourne avec succès sur GitHub Actions !",
    parse_mode: 'Markdown'
});

const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    res.on('data', (chunk) => { console.log("Réponse Telegram :", chunk.toString()); });
});

req.on('error', (e) => { console.error(e); });
req.write(data);
req.end();
