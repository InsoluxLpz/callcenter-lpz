// src/database/initSqlite.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function openDb() {
  return open({
    filename: path.join(__dirname, 'callcenter.sqlite'),
    driver: sqlite3.Database,
  });
}

async function initSqlite() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS listas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      url TEXT
    );

    CREATE TABLE IF NOT EXISTS mod_lista_columnas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lista_id INTEGER,
      posicion INTEGER,
      nombre TEXT,
      key TEXT
    );

    CREATE TABLE IF NOT EXISTS status_llamadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      celular TEXT,
      usuario TEXT,
      lista_id INTEGER,
      status TEXT,
      comentario TEXT,
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

    INSERT OR IGNORE INTO usuarios (usuario, password, type)
    VALUES ("111", "Ins0lux.", "admin");
  `);

  console.log('SQLite inicializado');
}

module.exports = {
  initSqlite,
  openDb,
};
