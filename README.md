````markdown
# 🇹🇭 Steam Bot Discord

> Discord Bot สำหรับชุมชนเกมเมอร์สาย Steam 🇹🇭  
> ระบบจัดการ Blacklist Cheater และระบบ Donation Steam Trade Offer

---

## 🔧 ฟีเจอร์หลักของ SteamThailand Bot

### ✅ ระบบ Blacklist Steam Cheater

- ตรวจสอบและเพิ่มผู้เล่นที่ใช้โปรแกรมโกงเข้า **บัญชีดำ (Blacklist)**
- ใช้ SteamID64 ในการแบน
- จำกัดจำนวนการแบนต่อวัน (ป้องกันการใช้งานเกินควร)
- ปุ่ม **ยืนยัน / ยกเลิก** ก่อนแบน
- เก็บ log การแบน + ส่งแจ้งเตือนใน Discord

📌 **คำสั่ง:**
```bash
/blacklist
/check
/history
````

---

### 🎁 ระบบ Donation / Steam Trade Offer

* แสดงรายชื่อผู้รับบริจาคพร้อม emoji
* ส่งลิงก์ trade offer ไปทาง DM
* บันทึกประวัติการบริจาคในระบบ
* แอดมินสามารถเพิ่ม/ลบผู้รับบริจาคได้ผ่านคำสั่ง

📌 **คำสั่ง:**

```bash
/donate
/setup donate
/setup removedonate
/donationhistory
```

---

### 🔐 ระบบตรวจสอบลิงก์ & ความปลอดภัย

* ตรวจสอบว่า Steam Trade Link ถูกต้องหรือไม่
* ตรวจสอบว่า SteamID64 เป็นตัวเลข 17 หลักจริงหรือไม่
* ป้องกันคำสั่งจากคนไม่มี role แอดมิน
* มีระบบ cooldown ป้องกัน spam

---

### 📜 ระบบจัดการข้อมูล / บันทึก Log

* บันทึกข้อมูลลง `data.json` อย่างปลอดภัย (blacklist, donationHistory)
* โหลดข้อมูลตอนบอทเริ่มทำงาน
* เขียน log ทุกคำสั่งที่สำคัญไปยัง log channel

---

### 💬 แจ้งเตือน / Embed

* ส่ง embed สวยงามเมื่อ:

  * แบนผู้เล่น
  * เพิ่มหรือลบผู้รับบริจาค
  * มีการบริจาคเกิดขึ้น
* แจ้งเตือนผ่าน DM และ Log Channel

---

### 🎮 รองรับ Slash Command เต็มรูปแบบ

* ใช้ `registerCommands()` ลงทะเบียนคำสั่งอัตโนมัติ
* รองรับทุกประเภท interaction:

  * Slash commands
  * Select menus
  * Buttons

---

## 📦 Dependencies

* `discord.js` (v14+)
* Node.js v16.9 ขึ้นไป
* ไม่ต้องใช้ฐานข้อมูลภายนอก (ใช้ JSON file)

---

## 🧠 พัฒนาต่อยอดในอนาคต

* เชื่อม Steam API จริง (VAC ban, ชื่อ, รูป, โปรไฟล์)
* เชื่อมฐานข้อมูล MongoDB / Firebase
* ระบบรีพอร์ตผู้เล่น
* Leaderboard สำหรับผู้โดเนท
* แจ้งเตือน VAC Ban อัตโนมัติ

---

## 📂 โครงสร้างไฟล์เบื้องต้น

```
SteamThailandBot/
├── commands/
├── data.json
├── embeds.js
├── utils.js
├── index.js
```

---

## ⚙️ การใช้งาน

1. ติดตั้ง Dependency:

```bash
npm install
```

2. สร้าง `.env` หรือแก้ไข `config.discordToken` ใน `index.js` ด้วย Token ของคุณ

3. เริ่มบอท:

```bash
node index.js
```

---

> หากคุณต้องการฟีเจอร์เพิ่มเติมหรือมีคำถามใด ๆ — ยินดีต้อนรับเสมอ!
> 📩 ติดต่อผู้พัฒนา หรือเปิด Issue ได้เลย 🙌

```

