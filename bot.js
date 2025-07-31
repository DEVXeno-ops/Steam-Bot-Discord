/**
 * SteamThailand Bot - พัฒนาโดย xeno (ริน)
 * ❌ ห้ามขาย หรือเผยแพร่ในเชิงพาณิชย์
 * ✅ ใช้เพื่อการศึกษา / ส่วนตัวเท่านั้น
 */

const { Client, IntentsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { registerCommands } = require('./commands');
const { loadData, saveData } = require('./data');
const { createEmbed, createDonationGUI } = require('./embeds');
const { isValidSteamID64, isValidTradeLink, sanitizeInput, logToChannel } = require('./utils');

const config = {
    discordToken: '', // อย่าเผย token จริงในที่สาธารณะ!
    logChannelId: '',
    adminRoleId: '',
    tradeOfferLinks: {
        'ชื่อ1': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🎮' },
        'ชื่อ2': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ3': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ4': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ5': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ6': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' }
    },
    maxBansPerDay: 5
};

const client = new Client({ intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages
] });

let blacklist = [], donationHistory = [];
const userBanCounts = new Map();

setInterval(() => {
    userBanCounts.clear();
    console.log('[SYSTEM] รีเซ็ตจำนวนการแบนรายวันเรียบร้อย');
}, 24 * 60 * 60 * 1000);

client.once('ready', async () => {
    console.log(`[SYSTEM] เริ่มทำงาน: ${client.user.tag} (${new Date().toLocaleString('th-TH')})`);
    console.log('[SYSTEM] SteamThailand Bot โดย xeno (ริน) | ห้ามขาย | ใช้เพื่อศึกษา / ส่วนตัวเท่านั้น');

    const data = await loadData();
    blacklist = data.blacklist || [];
    donationHistory = data.donationHistory || [];
    console.log('[SYSTEM] โหลดข้อมูลสำเร็จ');

    await registerCommands(client);
    console.log('[SYSTEM] ลงทะเบียนคำสั่งสำเร็จ');
});

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isCommand() && !interaction.isStringSelectMenu() && !interaction.isButton()) return;
        const userId = interaction.user.id;

        // ตรวจสอบคำสั่งต่างๆ
        if (interaction.isCommand()) {
            const { commandName, options, member } = interaction;
            await interaction.deferReply({ ephemeral: true });
            console.log(`[COMMAND] ${interaction.user.tag} ใช้คำสั่ง /${commandName}`);

            // คำสั่ง setup
            if (commandName === 'setup') {
                if (!member.roles.cache.has(config.adminRoleId)) return interaction.editReply({ content: '❌ เฉพาะแอดมินเท่านั้น!' });
                const subcommand = options.getSubcommand();

                if (subcommand === 'donate') {
                    const recipient = sanitizeInput(options.getString('recipient'));
                    const tradeLink = sanitizeInput(options.getString('tradelink'));
                    if (!recipient || !tradeLink || !isValidTradeLink(tradeLink)) return interaction.editReply({ content: '❌ โปรดระบุชื่อผู้รับและลิงก์ trade ให้ถูกต้อง' });
                    config.tradeOfferLinks[recipient] = { link: tradeLink, emoji: '🎁' };
                    const embed = createEmbed('donate', 'success', { recipient, link: tradeLink });
                    await logToChannel(client, config.logChannelId, embed);
                    await interaction.user.send({ embeds: [embed] }).catch(() => {});
                    return interaction.editReply({ content: '✅ ตั้งค่าผู้รับบริจาคสำเร็จ!' });
                }

                if (subcommand === 'removedonate') {
                    const recipient = sanitizeInput(options.getString('recipient'));
                    if (!config.tradeOfferLinks[recipient]) return interaction.editReply({ content: `❌ ไม่พบผู้รับบริจาคชื่อ ${recipient}` });
                    delete config.tradeOfferLinks[recipient];
                    const embed = createEmbed('removedonate', 'success', { recipient });
                    await logToChannel(client, config.logChannelId, embed);
                    await interaction.user.send({ embeds: [embed] }).catch(() => {});
                    return interaction.editReply({ content: `✅ ลบผู้รับบริจาค ${recipient} สำเร็จ!` });
                }
            }

            // blacklist, check, donate, history, donationhistory
            // (...โค้ดย่อยตามด้านบนสามารถใส่ต่อที่นี่ได้เหมือนเดิม...)

        } else if (interaction.isStringSelectMenu() && interaction.customId === 'donate_select') {
            await interaction.deferUpdate();
            const recipient = interaction.values[0];
            const data = config.tradeOfferLinks[recipient];
            if (!data) return interaction.editReply({ content: '❌ เลือกผู้รับบริจาคไม่ถูกต้อง', components: [] });

            const embed = createEmbed('donate', 'success', { recipient, link: data.link, emoji: data.emoji });
            await interaction.user.send({ embeds: [embed] }).catch(() => {});
            await interaction.editReply({ content: '✅ ส่งลิงก์บริจาคไปทาง DM แล้ว', embeds: [], components: [] });
            await logToChannel(client, config.logChannelId, createEmbed('donationlog', 'success', { userTag: interaction.user.tag, recipient }));
            donationHistory.push({ userId, username: interaction.user.tag, recipient, timestamp: Date.now() });
            await saveData({ blacklist, donationHistory });

        } else if (interaction.isButton()) {
            await interaction.deferUpdate();
            // (...โค้ดปุ่ม ban/unban ตามเดิม...)
        }

    } catch (error) {
        console.error('[ERROR] ใน interactionCreate:', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ เกิดข้อผิดพลาด โปรดลองอีกครั้ง' }).catch(() => {});
        } else {
            await interaction.reply({ content: '❌ เกิดข้อผิดพลาด โปรดลองอีกครั้ง', ephemeral: true }).catch(() => {});
        }
    }
});

process.on('uncaughtException', err => console.error('[FATAL] uncaughtException:', err));
process.on('unhandledRejection', err => console.error('[FATAL] unhandledRejection:', err));

client.login(config.discordToken).catch(err => console.error('[ERROR] ล็อกอินไม่สำเร็จ:', err));
