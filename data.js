const fs = require('fs').promises;
const path = require('path');

const dataFile = path.resolve(__dirname, 'data.json');
const defaultData = { blacklist: [], donationHistory: [] };

async function loadData() {
    try {
        console.log('🔄 กำลังโหลดข้อมูลจาก data.json...');
        const data = await fs.readFile(dataFile, 'utf8');
        try {
            const parsed = JSON.parse(data);
            console.log('✅ โหลดข้อมูลสำเร็จ');
            return parsed;
        } catch (parseError) {
            console.warn('⚠️ ไฟล์ JSON เสียหาย กำลังสร้างไฟล์ใหม่...');
            await saveData(defaultData);
            return defaultData;
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn('📄 ไม่พบไฟล์ data.json กำลังสร้างใหม่...');
            await saveData(defaultData);
            return defaultData;
        }
        console.error('❌ ข้อผิดพลาดในการโหลดไฟล์:', error);
        return defaultData;
    }
}

async function saveData(data) {
    try {
        console.log('💾 กำลังบันทึกข้อมูลลง data.json...');
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
        console.log('✅ บันทึกข้อมูลสำเร็จ');
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการบันทึกไฟล์:', error);
    }
}

// เครดิต: SteamThailand Bot by xeno (ริน)

module.exports = { loadData, saveData };
