const fs = require('fs').promises;
const path = require('path');

const dataFile = path.resolve(__dirname, 'data.json');
const defaultData = { blacklist: [], donationHistory: [] };

async function loadData() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        try {
            return JSON.parse(data);
        } catch (parseError) {
            console.warn('⚠️ ไฟล์ JSON เสียหาย กำลังสร้างใหม่...');
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
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการบันทึกไฟล์:', error);
    }
}

module.exports = { loadData, saveData };
