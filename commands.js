const { SlashCommandBuilder } = require('discord.js');

async function registerCommands(client) {
    const commands = [
        // 🔧 /setup donate & removedonate
        new SlashCommandBuilder()
            .setName('setup')
            .setDescription('ตั้งค่าการบริจาค (เฉพาะแอดมิน)')
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
            .setDescription('เพิ่มในบัญชีดำ')
            .addStringOption(opt =>
                opt.setName('steamid')
                    .setDescription('SteamID64 ของผู้เล่น')
                    .setRequired(true)
            )
            .addStringOption(opt =>
                opt.setName('reason')
                    .setDescription('เหตุผลในการแบน')
                    .setRequired(true)
            ),

        // 🔍 /check
        new SlashCommandBuilder()
            .setName('check')
            .setDescription('ตรวจสอบบัญชีดำ')
            .addStringOption(opt =>
                opt.setName('steamid')
                    .setDescription('SteamID64 ของผู้เล่น')
                    .setRequired(true)
            ),

        // 💸 /donate
        new SlashCommandBuilder()
            .setName('donate')
            .setDescription('ขอลิงก์บริจาค'),

        // 📜 /history
        new SlashCommandBuilder()
            .setName('history')
            .setDescription('ดูประวัติบัญชีดำทั้งหมด'),

        // 📦 /donationhistory
        new SlashCommandBuilder()
            .setName('donationhistory')
            .setDescription('ดูประวัติการบริจาคทั้งหมด')
    ];

    try {
        await client.application.commands.set(commands.map(cmd => cmd.toJSON()));
        console.log('✅ ลงทะเบียนคำสั่ง Slash สำเร็จแล้ว');
    } catch (error) {
        console.error('❌ พบข้อผิดพลาดในการลงทะเบียนคำสั่ง:', error);
    }
}

module.exports = { registerCommands };
