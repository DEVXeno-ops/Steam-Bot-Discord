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
        'ชื่อ1 ': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🎮' },
        'ชื่อ2': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ3': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ4': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ5': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' },
        'ชื่อ6': { link: 'https://steamcommunity.com/tradeoffer', emoji: '🌟' }
    },
    maxBansPerDay: 5
};

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.DirectMessages] });

let blacklist = [], donationHistory = [];
const userBanCounts = new Map();

setInterval(() => userBanCounts.clear(), 24 * 60 * 60 * 1000);

client.once('ready', async () => {
    console.log(`เริ่มทำงาน: ${client.user.tag} (${new Date().toLocaleString('th-TH')})`);
    try {
        const data = await loadData();
        blacklist = data.blacklist || [];
        donationHistory = data.donationHistory || [];
        await registerCommands(client);
        console.log('ลงทะเบียนคำสั่งสำเร็จ');
    } catch (error) {
        console.error('ข้อผิดพลาดใน ready:', error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isCommand() && !interaction.isStringSelectMenu() && !interaction.isButton()) return;

        const userId = interaction.user.id;

        if (interaction.isCommand()) {
            const { commandName, options, member } = interaction;
            await interaction.deferReply({ ephemeral: true });

            if (commandName === 'setup') {
                if (!member.roles.cache.has(config.adminRoleId)) {
                    return interaction.editReply({ content: '❌ เฉพาะแอดมินเท่านั้น!' });
                }
                const subcommand = options.getSubcommand();

                if (subcommand === 'donate') {
                    const recipient = sanitizeInput(options.getString('recipient'));
                    const tradeLink = sanitizeInput(options.getString('tradelink'));
                    if (!recipient || !tradeLink) return interaction.editReply({ content: '❌ โปรดระบุชื่อผู้รับและลิงก์อย่างถูกต้อง' });
                    if (!isValidTradeLink(tradeLink)) return interaction.editReply({ content: '❌ ลิงก์ trade offer ไม่ถูกต้อง' });

                    config.tradeOfferLinks[recipient] = { link: tradeLink, emoji: '🎁' };
                    const embed = createEmbed('donate', 'success', { recipient, link: tradeLink });
                    await logToChannel(client, config.logChannelId, embed);
                    await interaction.user.send({ embeds: [embed] }).catch(() => console.log('ไม่สามารถส่ง DM'));
                    return interaction.editReply({ content: '✅ ตั้งค่าผู้รับบริจาคสำเร็จ!' });
                }

                if (subcommand === 'removedonate') {
                    const recipient = sanitizeInput(options.getString('recipient'));
                    if (!config.tradeOfferLinks[recipient]) return interaction.editReply({ content: `❌ ไม่พบผู้รับบริจาคชื่อ ${recipient}` });

                    delete config.tradeOfferLinks[recipient];
                    const embed = createEmbed('removedonate', 'success', { recipient });
                    await logToChannel(client, config.logChannelId, embed);
                    await interaction.user.send({ embeds: [embed] }).catch(() => console.log('ไม่สามารถส่ง DM'));
                    return interaction.editReply({ content: `✅ ลบผู้รับบริจาค ${recipient} สำเร็จ!` });
                }
            }

            else if (commandName === 'blacklist') {
                const steamId = sanitizeInput(options.getString('steamid'));
                const reason = sanitizeInput(options.getString('reason'));
                if (!isValidSteamID64(steamId) || !reason) {
                    return interaction.editReply({ content: '❌ โปรดระบุ SteamID64 และเหตุผลให้ถูกต้อง' });
                }

                const todayKey = `${userId}-${new Date().toDateString()}`;
                const banCount = (userBanCounts.get(todayKey) || 0) + 1;
                if (banCount > config.maxBansPerDay) {
                    return interaction.editReply({ content: `❌ คุณแบนครบ ${config.maxBansPerDay} ครั้งแล้ววันนี้` });
                }
                userBanCounts.set(todayKey, banCount);

                const confirmButton = new ButtonBuilder()
                    .setCustomId(`confirm_ban_${steamId}_${Buffer.from(reason).toString('base64')}`)
                    .setLabel('ยืนยัน')
                    .setStyle(ButtonStyle.Success);
                const cancelButton = new ButtonBuilder()
                    .setCustomId('cancel_ban')
                    .setLabel('ยกเลิก')
                    .setStyle(ButtonStyle.Danger);

                return interaction.editReply({
                    content: `คุณต้องการแบน SteamID **${steamId}** ด้วยเหตุผล: \`${reason}\` ใช่หรือไม่?`,
                    components: [new ActionRowBuilder().addComponents(confirmButton, cancelButton)]
                });
            }

            else if (commandName === 'check') {
                const steamId = sanitizeInput(options.getString('steamid'));
                if (!isValidSteamID64(steamId)) return interaction.editReply({ content: '❌ SteamID64 ต้องเป็นตัวเลข 17 หลัก' });

                const found = blacklist.find(e => e.steamId === steamId);
                if (!found) return interaction.editReply({ content: '✅ SteamID นี้ไม่อยู่ในบัญชีดำ' });

                const embed = createEmbed('blacklist', 'success', { steamId: found.steamId, reason: found.reason });
                return interaction.editReply({ embeds: [embed] });
            }

            else if (commandName === 'donate') {
                if (Object.keys(config.tradeOfferLinks).length === 0) {
                    return interaction.editReply({ content: '❌ ยังไม่มีผู้รับบริจาค กรุณาใช้คำสั่ง /setup donate ก่อน' });
                }
                const { embed, row } = createDonationGUI(config.tradeOfferLinks);
                return interaction.editReply({ embeds: [embed], components: [row] });
            }

            else if (commandName === 'history') {
                const embed = createEmbed('history', 'success', { blacklist });
                return interaction.editReply({ embeds: [embed] });
            }

            else if (commandName === 'donationhistory') {
                const embed = createEmbed('donationhistory', 'success', { donationHistory });
                return interaction.editReply({ embeds: [embed] });
            }
        }

        else if (interaction.isStringSelectMenu() && interaction.customId === 'donate_select') {
            await interaction.deferUpdate();
            const recipient = interaction.values[0];
            const data = config.tradeOfferLinks[recipient];
            if (!data) {
                return interaction.editReply({ content: '❌ เลือกผู้รับบริจาคไม่ถูกต้อง', components: [] });
            }

            const embed = createEmbed('donate', 'success', { recipient, link: data.link, emoji: data.emoji });
            await interaction.user.send({ embeds: [embed] }).catch(() => console.log('ไม่สามารถส่ง DM'));

            await interaction.editReply({ content: '✅ ส่งลิงก์บริจาคไปทาง DM แล้ว', embeds: [], components: [] });

            await logToChannel(client, config.logChannelId, createEmbed('donationlog', 'success', { userTag: interaction.user.tag, recipient }));

            donationHistory.push({ userId: userId, username: interaction.user.tag, recipient, timestamp: Date.now() });
            await saveData({ blacklist, donationHistory });
        }

        else if (interaction.isButton()) {
            await interaction.deferUpdate();

            if (interaction.customId.startsWith('confirm_ban_')) {
                const parts = interaction.customId.split('_');
                if (parts.length < 4) {
                    return interaction.editReply({ content: '❌ ข้อมูลแบนไม่ถูกต้อง', components: [] });
                }
                const steamId = parts[2];
                const reason = Buffer.from(parts.slice(3).join('_'), 'base64').toString('utf-8');

                if (blacklist.some(e => e.steamId === steamId)) {
                    return interaction.editReply({ content: '❌ SteamID นี้ถูกแบนไปแล้ว', components: [] });
                }

                blacklist.push({ steamId, timestamp: Date.now(), reason });
                await saveData({ blacklist, donationHistory });

                const embed = createEmbed('blacklist', 'success', { steamId, reason });
                await logToChannel(client, config.logChannelId, embed);
                await interaction.user.send({ embeds: [embed] }).catch(() => console.log('ไม่สามารถส่ง DM'));

                return interaction.editReply({ content: '✅ เพิ่มในบัญชีดำสำเร็จ!', components: [] });
            }

            if (interaction.customId === 'cancel_ban') {
                return interaction.editReply({ content: '❌ ยกเลิกการแบน', components: [] });
            }
        }

    } catch (error) {
        console.error('ข้อผิดพลาดใน interactionCreate:', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ เกิดข้อผิดพลาด โปรดลองอีกครั้ง' }).catch(() => {});
        } else {
            await interaction.reply({ content: '❌ เกิดข้อผิดพลาด โปรดลองอีกครั้ง', ephemeral: true }).catch(() => {});
        }
    }
});

client.login(config.discordToken).catch(err => console.error('ข้อผิดพลาดในการล็อกอิน:', err));