import express from 'express';
import { db } from './firebase';
import { LocalCache } from './database';
import { BotManager } from './bot';

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Iniciar Banco Local
LocalCache.init();

// 2. Listener do Firebase (REAL-TIME)
console.log("📡 Conectando ao Firebase e aguardando alterações...");

// Ouve a coleção 'servers'. Sempre que algo mudar, o snapshot dispara.
db.collection('servers').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const serverData = change.doc.data();
        const uuid = change.doc.id;
        const type = change.type;

        if (type === 'added' || type === 'modified') {
            // 1. Atualiza o SQL Local (Cache)
            LocalCache.upsertServer(uuid, serverData);

            // 2. Extrai dados vitais
            const token = serverData.config?.general?.bot_token;
            const status = serverData.stats?.status; // 'online' ou 'offline'

            // 3. Avisa o Gerente do Bot
            console.log(`🔄 [SYNC] Alteração detectada no Server ${uuid} (${status})`);
            BotManager.syncState(uuid, token, status);
        }
        
        if (type === 'removed') {
            console.log(`🗑️ Servidor removido: ${uuid}`);
            BotManager.syncState(uuid, "", "offline"); // Mata o bot
        }
    });
});

// 3. Mini API Web (Para o Fly.io saber que estamos vivos)
app.get('/', (req, res) => {
    const servers = LocalCache.getAllServers();
    res.json({ 
        status: "API Bot Online", 
        cached_servers: servers.length 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Bot rodando na porta ${PORT}`);
});