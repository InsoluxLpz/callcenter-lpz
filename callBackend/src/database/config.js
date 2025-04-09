const mysql = require('mysql2/promise'); // Cambiar a la versión de Promises
require("dotenv").config();

const dbConexion = () => {
    const db = mysql.createPool({ // Recomendado usar un pool para mejor gestión de conexiones
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPASSWORD,
        database: process.env.DATABASE,
        waitForConnections: true,
        connectionLimit: 5, // Número máximo de conexiones simultáneas
        queueLimit: 10
    });

    console.log('Base de datos configurada');
    return db;
};

module.exports = {
    dbConexion
};
