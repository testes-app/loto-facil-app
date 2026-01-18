import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'lotofacil.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (initPromise) return initPromise;
  if (dbInstance) return dbInstance;

  initPromise = (async () => {
    try {
      console.log('📦 Abrindo banco de dados...');
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Inicialização rigorosa
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');

      await db.execAsync(`
                CREATE TABLE IF NOT EXISTS jogos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    numeros TEXT NOT NULL,
                    data_criacao TEXT NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS concursos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    numero_concurso INTEGER NOT NULL UNIQUE,
                    data_sorteio TEXT NOT NULL,
                    numeros_sorteados TEXT NOT NULL
                );
                
                CREATE INDEX IF NOT EXISTS idx_concurso_numero ON concursos(numero_concurso);
            `);

      console.log('✅ Banco de dados pronto!');
      dbInstance = db;
      return db;
    } catch (error) {
      console.error('❌ Erro no SQLite:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
};

export const getDatabase = async () => {
  return await openDatabase();
};
