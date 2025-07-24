const fs = require('fs').promises;
const path = require('path');

const dataFile = path.resolve(__dirname, 'data.json');
const defaultData = { blacklist: [], donationHistory: [] };

function logWithTime(message) {
  console.log(`[${new Date().toLocaleTimeString('th-TH')}] ${message}`);
}

async function loadData(retries = 3) {
  try {
    logWithTime('🔄 กำลังโหลดข้อมูลจาก data.json...');
    const data = await fs.readFile(dataFile, 'utf8');
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed.blacklist) || !Array.isArray(parsed.donationHistory)) {
        logWithTime('⚠️ รูปแบบข้อมูลไม่ถูกต้อง พบข้อมูลไม่ใช่ Array, จะรีเซ็ตข้อมูลใหม่');
        await saveData(defaultData);
        return defaultData;
      }
      logWithTime('✅ โหลดข้อมูลสำเร็จ');
      return parsed;
    } catch (parseError) {
      logWithTime('⚠️ ไฟล์ JSON เสียหาย กำลังสร้างไฟล์ใหม่...');
      await saveData(defaultData);
      return defaultData;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      logWithTime('📄 ไม่พบไฟล์ data.json กำลังสร้างใหม่...');
      await saveData(defaultData);
      return defaultData;
    }
    if (retries > 0) {
      logWithTime(`⚠️ ข้อผิดพลาดในการโหลดไฟล์: ${error.message} | กำลังลองโหลดใหม่ (${retries} ครั้งที่เหลือ)...`);
      return loadData(retries - 1);
    }
    logWithTime(`❌ ข้อผิดพลาดในการโหลดไฟล์ (หมด retries): ${error.stack}`);
    return defaultData;
  }
}

async function saveData(data) {
  try {
    logWithTime('💾 กำลังบันทึกข้อมูลลง data.json...');
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    logWithTime('✅ บันทึกข้อมูลสำเร็จ');
  } catch (error) {
    logWithTime(`❌ ข้อผิดพลาดในการบันทึกไฟล์: ${error.stack}`);
  }
}

// เครดิต: SteamThailand Bot by xeno (ริน)

module.exports = { loadData, saveData };
