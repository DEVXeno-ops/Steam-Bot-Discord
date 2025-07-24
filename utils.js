function isValidSteamID64(steamId) {
    try {
        if (typeof steamId !== 'string') return false;
        // SteamID64 ต้องเป็นตัวเลข 17 หลัก และขึ้นต้นด้วย 7656
        const result = /^\d{17}$/.test(steamId) && steamId.startsWith('7656');
        console.log(`✅ ตรวจสอบ SteamID64: ${steamId} ผลลัพธ์: ${result}`);
        return result;
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการตรวจสอบ SteamID64:', error);
        return false;
    }
}

function isValidTradeLink(link) {
    try {
        if (typeof link !== 'string') return false;
        // ตรวจสอบลิงก์ trade offer แบบมาตรฐาน steamcommunity.com/tradeoffer/new/?partner=...&token=...
        const regex = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[\w-]+$/i;
        const result = regex.test(link);
        console.log(`✅ ตรวจสอบ Trade Link: ${link} ผลลัพธ์: ${result}`);
        return result;
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการตรวจสอบ Trade Link:', error);
        return false;
    }
}

function sanitizeInput(input) {
    try {
        if (!input || typeof input !== 'string') return '';
        // ลบอักขระที่อาจทำให้เกิด XSS หรือปัญหา input อื่น ๆ และ trim
        const sanitized = input.replace(/[<>&"'`]/g, '').trim();
        console.log(`✅ sanitizeInput: "${input}" → "${sanitized}"`);
        return sanitized;
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการ sanitize input:', error);
        return '';
    }
}

async function logToChannel(client, channelId, embed) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || !channel.isText()) {
            console.warn(`⚠️ ไม่พบช่องหรือไม่สามารถส่งข้อความใน: ${channelId}`);
            return;
        }
        await channel.send({ embeds: [embed] });
        console.log(`✅ ส่ง log ไปยังช่อง ${channelId} สำเร็จ`);
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการส่ง log:', error);
        // fallback log
        try {
            const fallback = await client.channels.fetch(channelId);
            await fallback.send('❌ ไม่สามารถส่ง Embed ได้');
            console.log(`✅ ส่ง fallback log ไปยังช่อง ${channelId} สำเร็จ`);
        } catch (e) {
            console.error('❌ ไม่สามารถ fallback log ได้:', e);
        }
    }
}

// เครดิต: SteamThailand Bot โดย xeno (ริน)

module.exports = {
    isValidSteamID64,
    isValidTradeLink,
    sanitizeInput,
    logToChannel
};
