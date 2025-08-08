// commands/registerCommands.js
const { SlashCommandBuilder } = require('discord.js');

async function registerCommands(client) {
    try {
        console.log('🔄 เริ่มลงทะเบียนคำสั่ง Slash ของ SteamThailand Bot โดย xeno (ริน)...');

        const commands = [
            // 🔧 /setup donate & removedonate
            new SlashCommandBuilder()
                .setName('setup')
                .setDescription('ตั้งค่าการบริจาค (เฉพาะแอดมิน)')
                .setDMPermission(false)
                .addSubcommand(sub =>
                    sub.setName('donate')
                        .setDescription('เพิ่มผู้รับบริจาค')
                        .addStringOption(opt =>
                            opt.setName('recipient')
                                .setDescription('ชื่อผู้รับ')
                                .setRequired(true)
                        )
                        .addStringOption(opt =>
                            opt.setName('tradelink')
                                .setDescription('ลิงก์ trade offer')
                                .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub.setName('removedonate')
                        .setDescription('ลบผู้รับบริจาค')
                        .addStringOption(opt =>
                            opt.setName('recipient')
                                .setDescription('ชื่อผู้รับ')
                                .setRequired(true)
                        )
                ),

            // ⚠️ /blacklist
            new SlashCommandBuilder()
                .setName('blacklist')
                .setDescription('จัดการบัญชีดำ SteamID')
                .setDMPermission(false)
                .addSubcommand(sub =>
                    sub.setName('add')
                        .setDescription('เพิ่ม SteamID ในบัญชีดำ')
                        .addStringOption(opt =>
                            opt.setName('steamid')
                                .setDescription('SteamID64 ของผู้เล่น')
                                .setRequired(true)
                        )
                        .addStringOption(opt =>
                            opt.setName('reason')
                                .setDescription('เหตุผลในการแบน')
                                .setRequired(true)
                        )
                )
                .addSubcommand(sub =>
                    sub.setName('remove')
                        .setDescription('ลบ SteamID จากบัญชีดำ')
                        .addStringOption(opt =>
                            opt.setName('steamid')
                                .setDescription('SteamID64 ของผู้เล่น')
                                .setRequired(true)
                        )
                ),

            // 🔍 /check
            new SlashCommandBuilder()
                .setName('check')
                .setDescription('ตรวจสอบบัญชีดำ')
                .setDMPermission(false)
                .addStringOption(opt =>
                    opt.setName('steamid')
                        .setDescription('SteamID64 ของผู้เล่น')
                        .setRequired(true)
                ),

            // 💸 /donate
            new SlashCommandBuilder()
                .setName('donate')
                .setDescription('ขอลิงก์บริจาค')
                .setDMPermission(false),

            // 📜 /history
            new SlashCommandBuilder()
                .setName('history')
                .setDescription('ดูประวัติบัญชีดำทั้งหมด')
                .setDMPermission(false),

            // 📦 /donationhistory
            new SlashCommandBuilder()
                .setName('donationhistory')
                .setDescription('ดูประวัติการบริจาคทั้งหมด')
                .setDMPermission(false)
        ];

        // ลงทะเบียนคำสั่ง
        await client.application.commands.set(commands.map(c => c.toJSON()));

        console.log('✅ ลงทะเบียนคำสั่ง Slash สำเร็จแล้ว');
    } catch (error) {
        console.error('❌ พบข้อผิดพลาดในการลงทะเบียนคำสั่ง:', error);
    }
}

module.exports = { registerCommands };
