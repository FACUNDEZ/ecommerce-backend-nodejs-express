const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
});

connection.connect((error) => {
    if (error) {
        console.log(error, 'Error al conectar a la base de datos')
    } else {
        console.log('Conexión exitosa a la base de datos')
    }
});

module.exports = connection;