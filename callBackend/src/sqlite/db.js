import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
}

// Inicializar tabla si no existe
(async () => {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS listas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      url TEXT,
      column_to_key TEXT
    );

    CREATE TABLE IF NOT EXISTS lista_columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lista_id INTEGER,
      position INTEGER,
      name TEXT,
      key TEXT
    );

    CREATE TABLE IF NOT EXISTS lead_phone_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT,
      usuario TEXT,
      lista_id INTEGER,
      status TEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lead_phone_feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT,
      usuario TEXT,
      lista_id INTEGER,
      comment TEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      type TEXT NOT NULL,
      url_name TEXT,
      url_lista TEXT
    );
    INSERT INTO usuarios (usuario, password, type)
    VALUES ("1040","$2b$10$rcfxXhHzaNoVayfItr6VuexKW64VEct3WzV0ae3JLiKfWIQERyu.S","admin");
  `);
})();
