import { Client, GatewayIntentBits } from 'discord.js';

export class BotManager {
    private static instance: Client | null = null;
    private static currentToken: string = "";

    // Verifica o estado e decide se LIGA, DESLIGA ou REINICIA
    static async syncState(uuid: string, token: string, status: string) {
        const isOnline = status === 'online';

        // CENÁRIO 1: Servidor OFFLINE -> Bot deve morrer
        if (!isOnline) {
            if (this.instance) {
                console.log('🔴 Servidor Offline. Desligando Bot...');
                await this.instance.destroy();
                this.instance = null;
                this.currentToken = "";
            }
            return;
        }

        // CENÁRIO 2: Servidor ONLINE, mas bot desligado -> LIGAR
        if (isOnline && !this.instance) {
            console.log('🟢 Servidor Online! Iniciando Bot...');
            await this.startBot(token);
            return;
        }

        // CENÁRIO 3: Servidor ONLINE, bot ligado, mas TOKEN mudou -> REINICIAR
        if (isOnline && this.instance && this.currentToken !== token) {
            console.log('🔄 Token mudou. Reiniciando Bot...');
            await this.instance.destroy();
            this.instance = null;
            await this.startBot(token);
        }
    }

    private static async startBot(token: string) {
        if (!token) {
            console.log('⚠️ Tentativa de iniciar bot sem token.');
            return;
        }

        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        client.once('ready', () => {
            console.log(`🤖 Bot Logado como: ${client.user?.tag}`);
        });

        try {
            await client.login(token);
            this.instance = client;
            this.currentToken = token;
        } catch (error) {
            console.error('❌ Erro ao logar bot:', error);
        }
    }
}