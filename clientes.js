const express = require('express');

const app = express();
app.use(express.json());

const connection = require('./db');

// CREATE USER 

app.post("/newUser", (req, res) => {
    const { name, lastname, email, password } = req.body
    const query = 'INSERT INTO clientes (name, lastname, email, password) VALUES (?, ?, ?, ?)';
    const values = [name, lastname, email, password]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en el servidor' })
        } else {
            res.json({ message: 'Usuario creado correctamente', results })
        }
    })
})

// UPDATE INFO ABOUT USER 

app.put("/updateinfo", (req, res) => {
    const { name, lastname, email, password, id } = req.body
    const query = 'UPDATE clientes SET name = ?, lastname = ?, email = ?, password = ? WHERE id = ?'
    const values = [name, lastname, email, password, id]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en el servidor' })
        } else {
            res.json({ results })
        }
    })
})

// GET INFO ABOUT USER 

app.get("/getUser/:idUser", (req, res) => {
    const { idUser } = req.params
    const query = 'SELECT * FROM clientes WHERE id = ?'
    const values = [idUser]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en el servidor' })
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontro al usuario' })
        }

        res.status(200).json({ message: 'Usuario encontrado', results })

    })
})

// VERIFICATION ABOUT LOG IN

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM clientes WHERE email = ? AND password = ?';
    const values = [email, password];

    connection.query(query, values, (err, results, fields) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.json({ message: 'Inicio de sesión exitoso', usuario: { ...results[0] } });
    });
});

// DELETE ACCOUNT

app.delete('/deleteUser/:idUser', (req, res) => {
    const { idUser } = req.params;
    const query = 'DELETE FROM clientes WHERE id = ?';
    const values = [idUser];

    connection.query(query, values, (error, results) => {
        if (error) {
           return res.status(500).json({ error: 'Error en el servidor' });
        } else {
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        }
    });
});

module.exports = app;

