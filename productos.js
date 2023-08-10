const express = require('express')

const app = express()
app.use(express.json())

const connection = require('./db');

// CREATE PRODUCT

app.post('/newProduct', (req, res) => {
    const { product, price, cliente_id, quantity, category } = req.body
    const query = 'INSERT INTO productos (product, price, cliente_id, quantity, category) VALUES (?, ?, ?, ?, ?)'
    const values = [product, price, cliente_id, quantity, category]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error })
        } else {
            res.status(200).json({ results })
        }
    })
})

// GET PRODUCTS 

app.get("/getProducts/:id", (req, res) => {
    const { id } = req.params
    const query = 'SELECT * FROM productos WHERE id = ?'
    const values = [id]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' })
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no fue encontrado' })
        } else {
            return res.status(200).json({ message: 'Producto encontrado' })
        }
    })
})

// UPDATE PRODUCTS INFO 

app.put("/updateinfoProduct", (req, res) => {
    const { id, product, price, quantity, category } = req.body;
    const query = 'UPDATE productos SET product = ?, price = ?, quantity = ?, category = ? WHERE id = ?';
    const values = [product, price, quantity, category, id];

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        } else {
            res.json({ message: 'Producto actualizado correctamente', results });
        }
    });
});

// DELETE PRODUCT

app.delete("/deleteProduct/:idProduct", (req, res) => {
    const { idProduct } = req.params
    const query = 'DELETE FROM productos WHERE id = ?'
    const values = [idProduct]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        } else {
            res.json({ message: 'Producto eliminado correctamente', results })
        }
    })
})

// GET PRODUCTS THROUGH THE CATEGORY OR NAME

app.post('/searchProduct', (req, res) => {
    const { product, category } = req.body
    const query = 'SELECT * FROM productos WHERE product = ? OR category = ?'
    const values = [product, category]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' })
        }

        if (results.length !== 0) {
            res.status(200).json({ message: 'Resultados encontrados', results })
        } else {
            res.status(400).json({ error: 'No se encontró ningun resultado' })
        }
    })
})

// FILTER (CATEGORY) FOR PRODUCTS

app.get('/filterProducts/:category', (req, res) => {
    const { category } = req.params
    const query = 'SELECT * FROM productos WHERE category = ?'
    const values = [category]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' })
        }

        if (results.length !== 0) {
            res.status(200).json({ message: 'Filtrado correctamente', results })
        } else {
            res.status(404).json({ error: 'No se encontro la categoría' })
        }
    })
})

// FILTER (PRICE) FOR PRODUCTS

app.get("/filterPrice", (req, res) => {
    const { orderBy } = req.query;
    const query = 'SELECT * FROM productos ORDER BY price ' + (orderBy === 'desc' ? 'DESC' : 'ASC');

    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        } else {
            res.json({ message: 'Filtrado correctamente', results });
        }
    });
});

module.exports = app