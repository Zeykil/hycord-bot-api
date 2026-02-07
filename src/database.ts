import Database from 'better-sqlite3';

// Cria o banco em memória ou arquivo (no Fly.io, se o container reiniciar, reseta, 
// mas não tem problema pois ele puxa do Firebase de novo ao ligar)
const db = new Database('hycord_cache.db');

export class LocalCache {
    static init() {
        // Cria a tabela se não existir
        db.exec(`
            CREATE TABLE IF NOT EXISTS servers (
                uuid TEXT PRIMARY KEY,
                bot_token TEXT,
                status TEXT,
                full_json TEXT
            )
        `);
        console.log('📂 Cache SQL Local iniciado.');
    }

    static upsertServer(uuid: string, data: any) {
        const stmt = db.prepare(`
            INSERT INTO servers (uuid, bot_token, status, full_json)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(uuid) DO UPDATE SET
            bot_token = excluded.bot_token,
            status = excluded.status,
            full_json = excluded.full_json
        `);

        // Extrai dados críticos para colunas, o resto fica no JSON
        const token = data.config?.general?.bot_token || '';
        const status = data.stats?.status || 'offline';

        stmt.run(uuid, token, status, JSON.stringify(data));
        // console.log(`💾 Cache SQL atualizado para: ${uuid} | Status: ${status}`);
    }

    static getServer(uuid: string) {
        const stmt = db.prepare('SELECT * FROM servers WHERE uuid = ?');
        const row = stmt.get(uuid) as any;
        if (!row) return null;
        return {
            ...row,
            data: JSON.parse(row.full_json)
        };
    }
    
    static getAllServers() {
        return db.prepare('SELECT * FROM servers').all();
    }
}