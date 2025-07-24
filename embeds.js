const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

function createEmbed(type, status, options = {}) {
    try {
        const {
            steamId = 'ไม่ระบุ',
            reason = 'ไม่ระบุ',
            recipient = 'ไม่ระบุ',
            link = '',
            userTag = 'ไม่ทราบชื่อ',
            blacklist = [],
            donationHistory = [],
            emoji = '🎁',
        } = options;

        const embed = new EmbedBuilder().setTimestamp();

        switch (type) {
            case 'blacklist':
                embed
                    .setColor('#FF5555')
                    .setTitle('🚫 การแบน')
                    .setThumbnail('https://i.imgur.com/9z1J1qM.png');
                if (status === 'success') {
                    embed
                        .setDescription(`เพิ่ม **${steamId}** เข้าบัญชีดำสำเร็จ`)
                        .addFields([
                            { name: 'Steam ID', value: steamId, inline: true },
                            { name: 'เหตุผล', value: reason, inline: true },
                        ]);
                } else {
                    embed
                        .setDescription(`❌ ไม่สามารถแบน **${steamId}** ได้`)
                        .addFields([{ name: 'ข้อผิดพลาด', value: reason }]);
                }
                break;

            case 'donate':
                embed
                    .setColor('#55FF55')
                    .setTitle(`${emoji} บริจาคให้ ${recipient}!`)
                    .setThumbnail('https://i.imgur.com/2z3Y4kF.png')
                    .setDescription(`ส่งไอเทม: [คลิกเพื่อบริจาค](${link})`)
                    .addFields([{ name: 'ผู้รับ', value: recipient }]);
                break;

            case 'donationlog':
                embed
                    .setColor('#55FF55')
                    .setTitle('📝 บันทึกการบริจาค')
                    .setDescription(`${userTag} ขอรับลิงก์บริจาคให้ **${recipient}**`);
                break;

            case 'history':
                embed
                    .setColor('#FF5555')
                    .setTitle('📜 ประวัติบัญชีดำ')
                    .setDescription(
                        blacklist.length
                            ? blacklist
                                .map(e =>
                                    `• SteamID: **${e.steamId}**\n  เหตุผล: ${e.reason}\n  เวลา: ${new Date(e.timestamp).toLocaleString('th-TH')}`
                                )
                                .join('\n\n')
                            : 'ไม่มีรายการในบัญชีดำ'
                    );
                break;

            case 'donationhistory':
                embed
                    .setColor('#55FF55')
                    .setTitle('📜 ประวัติการบริจาค')
                    .setDescription(
                        donationHistory.length
                            ? donationHistory
                                .map(e =>
                                    `• ผู้ใช้: **${e.username}**\n  ผู้รับ: ${e.recipient}\n  เวลา: ${new Date(e.timestamp).toLocaleString('th-TH')}`
                                )
                                .join('\n\n')
                            : 'ไม่มีประวัติการบริจาค'
                    );
                break;

            case 'removedonate':
            case 'donate_setting':
                embed
                    .setColor(status === 'success' ? '#55FF55' : '#FF5555')
                    .setTitle(status === 'success' ? '✅ ตั้งค่าสำเร็จ' : '❌ ข้อผิดพลาด')
                    .setDescription(
                        type === 'removedonate'
                            ? `ลบผู้รับ: **${recipient}**`
                            : `ตั้งค่าผู้รับบริจาค: **${recipient}**\nลิงก์: ${link}`
                    );
                break;

            default:
                embed
                    .setColor('#AAAAAA')
                    .setTitle('ℹ️ ไม่พบประเภท Embed')
                    .setDescription('ไม่สามารถสร้าง Embed ได้จากประเภทที่ระบุ');
                break;
        }

        console.log(`✅ สร้าง Embed ประเภท "${type}" สำเร็จ`);
        return embed;

    } catch (error) {
        console.error(`❌ ข้อผิดพลาดในการสร้าง Embed ประเภท "${type}":`, error);
        return new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle('❌ เกิดข้อผิดพลาดในการสร้าง Embed')
            .setDescription('โปรดลองใหม่อีกครั้ง หรือแจ้งแอดมิน');
    }
}

function createDonationGUI(tradeOfferLinks = {}) {
    try {
        const options = Object.entries(tradeOfferLinks).map(([name, data]) => ({
            label: `บริจาคให้ ${name}`,
            value: name,
            emoji: data.emoji || '🎁',
        }));

        const menu = new StringSelectMenuBuilder()
            .setCustomId('donate_select')
            .setPlaceholder('เลือกผู้รับบริจาค...')
            .addOptions(options);

        console.log('✅ สร้าง Donation GUI สำเร็จ');

        return {
            embed: new EmbedBuilder()
                .setColor('#55FF55')
                .setTitle('🎁 เลือกผู้รับบริจาค')
                .setDescription('เลือกผู้รับจากเมนูด้านล่าง\nลิงก์จะถูกส่งไปทาง DM')
                .setFooter({
                    text: 'กรุณาเลือกภายใน 30 วินาที',
                    iconURL: 'https://i.imgur.com/2z3Y4kF.png',
                })
                .setTimestamp(),
            row: new ActionRowBuilder().addComponents(menu),
        };
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการสร้าง Donation GUI:', error);
        return {
            embed: new EmbedBuilder()
                .setColor('#FF5555')
                .setTitle('❌ เกิดข้อผิดพลาดในการสร้างเมนูบริจาค')
                .setDescription('โปรดลองใหม่ภายหลัง หรือแจ้งแอดมิน'),
            row: new ActionRowBuilder(),
        };
    }
}

module.exports = { createEmbed, createDonationGUI };
