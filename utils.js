function isValidSteamID64(steamId) {
    // SteamID64 จริงควรเป็นตัวเลข 17 หลัก และขึ้นต้นด้วย 7656...
    return /^\d{17}$/.test(steamId) && steamId.startsWith('7656');
}

function isValidTradeLink(link) {
    const regex = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[\w-]+$/i;
    return regex.test(link);
}

function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    // ลบ HTML tags และ trim ช่องว่าง
    return input.replace(/[<>&"'`]/g, '').trim();
}

async function logToChannel(client, channelId, embed) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
            console.warn(`⚠️ ไม่พบช่องหรือไม่สามารถส่งข้อความใน: ${channelId}`);
            return;
        }
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการส่ง log:', error);
        // fallback log
        try {
            const fallback = await client.channels.fetch(channelId);
            await fallback.send('❌ ไม่สามารถส่ง Embed ได้');
        } catch (e) {
            console.error('❌ ไม่สามารถ fallback log ได้:', e);
        }
    }
}

module.exports = {
    isValidSteamID64,
    isValidTradeLink,
    sanitizeInput,
    logToChannel
};
