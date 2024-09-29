const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const conn = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('opened connection');
        }
    });

    conn.ev.on('messages.upsert', async m => {
        if (m.messages[0].key.fromMe) return;

        const messageContent = m.messages[0].message.conversation;
        const senderId = m.messages[0].key.remoteJid;
        let replyMessage = '';

        console.log("Pesan Baru Diterima");
        console.log(`${senderId} : ${messageContent}`);

        // Menggunakan if-else untuk pengecekan
        if (messageContent.toLowerCase() === 'halo' || messageContent.toLowerCase() === 'haloo') {
            replyMessage = "Haloo jugaa";
        } else if (messageContent.toLowerCase() === 'menu') {
            replyMessage = "Mohon Maaf Menu Belum Tersedia";
        } else if (messageContent.toLowerCase() === 'pagi') {
            replyMessage = "Selamat Pagi";
        } else {
            replyMessage = "Ngomong Apa Yaa??";
        }

        await conn.sendMessage(senderId, { text: replyMessage });
    });
}

connectToWhatsApp();
