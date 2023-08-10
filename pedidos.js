const express = require('express');

const app = express();
app.use(express.json());

const connection = require('./db');

// ADD PRODUCT TO CART

app.post('/addProduct', (req, res) => {
    const { productId, clienteId, quantity } = req.body;
    const checkProductQuery = 'SELECT * FROM productos WHERE id = ? AND cliente_id = ? AND quantity >= ?';
    const valuesProductQuery = [productId, clienteId, quantity]

    connection.query(checkProductQuery, valuesProductQuery, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado o cantidad insuficiente' });
        }

        const updateQuantityQuery = 'UPDATE productos SET quantity = quantity - ? WHERE cliente_id = ? AND id = ?';
        const valuesQuantityQuery = [quantity, clienteId, productId]

        connection.query(updateQuantityQuery, valuesQuantityQuery, (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
            }

            const insertQuery = 'INSERT INTO carrito (cliente_id, producto_id, quantity) VALUES (?, ?, ?)';
            const insertValues = [clienteId, productId, quantity];

            connection.query(insertQuery, insertValues, (error, results) => {
                if (error) {
                    return res.status(500).json({ error: 'Error al consultar la base de datos', error });
                }

                res.status(200).json({ message: "Producto agregado al carro", results });
            });
        });
    });
});

// UPDATE PRODUCTS FROM CART

app.put("/updateFromCart", (req, res) => {
    const { productId, clienteId, quantityToRemove } = req.body;

    const getQuantityQuery = 'SELECT quantity FROM carrito WHERE cliente_id = ? AND producto_id = ?';
    const getQuantityValues = [clienteId, productId];

    connection.query(getQuantityQuery, getQuantityValues, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        const quantityInCart = results[0].quantity;
        const newQuantityInCart = quantityInCart - quantityToRemove;

        if (newQuantityInCart < 0) {
            return res.status(400).json({ error: 'La cantidad a eliminar es mayor que la cantidad en el carrito' });
        }

        const updateCartQuery = 'UPDATE carrito SET quantity = ? WHERE cliente_id = ? AND producto_id = ?';
        const updateCartValues = [newQuantityInCart, clienteId, productId];

        connection.query(updateCartQuery, updateCartValues, (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error al actualizar la cantidad en el carrito', error });
            }

            const updateProductQuery = 'UPDATE productos SET quantity = quantity + ? WHERE cliente_id = ? AND id = ?';
            const updateProductValues = [quantityToRemove, clienteId, productId];

            connection.query(updateProductQuery, updateProductValues, (error) => {
                if (error) {
                    return res.status(500).json({ error: 'Error al actualizar la cantidad del producto en la base de datos', error });
                }

                res.status(200).json({ message: "Producto parcialmente eliminado del carrito y cantidad actualizada en la base de datos" });
            })
        })
    })
})

// REMOVE PRODUCTS FROM CART

app.delete('/removeFromCart', (req, res) => {
    const { productId, clienteId } = req.body;

    const getQuantityQuery = 'SELECT quantity FROM carrito WHERE cliente_id = ? AND producto_id = ?';
    const getQuantityValues = [clienteId, productId];

    connection.query(getQuantityQuery, getQuantityValues, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        const quantityInCart = results[0].quantity;

        const deleteQuery = 'DELETE FROM carrito WHERE cliente_id = ? AND producto_id = ?';
        const deleteValues = [clienteId, productId];

        connection.query(deleteQuery, deleteValues, (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error al eliminar el producto del carrito', error });
            }

            const updateProductQuery = 'UPDATE productos SET quantity = quantity + ? WHERE cliente_id = ? AND id = ?';
            const updateProductValues = [quantityInCart, clienteId, productId];

            connection.query(updateProductQuery, updateProductValues, (error) => {
                if (error) {
                    return res.status(500).json({ error: 'Error al actualizar la cantidad del producto en la base de datos' });
                }

                res.status(200).json({ message: "Producto eliminado del carrito y cantidad actualizada en la base de datos" });
            });
        });
    });
});

// ADD DIRECTION 

app.post("/addDirection", (req, res) => {
    const { clienteId, calle, estado, ciudad, pais, cp } = req.body
    const query = 'INSERT INTO domicilio (cliente_id, calle, estado, ciudad, pais, cp) VALUES (?, ?, ?, ?, ?, ?)'
    const values = [clienteId, calle, estado, ciudad, pais, cp]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
        }

        res.status(200).json({ message: "Domicilio agregado", results });
    })
})

// ADD PAY

app.post("/addPay", (req, res) => {
    const { nombre } = req.body
    const query = 'INSERT INTO metodo_de_pago (nombre) VALUES (?)'
    const values = [nombre]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
        }

        res.status(200).json({ message: "Metodo de pago agregado", results });
    })
})

// CREATE ORDER 

app.post("/createOrder", (req, res) => {
    const { cliente_id, metododepago_id, total, domicilio_id } = req.body;

    const checkClienteQuery = 'SELECT * FROM clientes WHERE id = ?';
    const checkMetodoPagoQuery = 'SELECT * FROM metodo_de_pago WHERE id = ?';
    const checkDomicilioQuery = 'SELECT * FROM domicilio WHERE id = ?';

    connection.query(checkClienteQuery, [cliente_id], (clienteError, clienteResults) => {
        if (clienteError || clienteResults.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        connection.query(checkMetodoPagoQuery, [metododepago_id], (metodoPagoError, metodoPagoResults) => {
            if (metodoPagoError || metodoPagoResults.length === 0) {
                return res.status(404).json({ error: 'Método de pago no encontrado' });
            }

            connection.query(checkDomicilioQuery, [domicilio_id], (domicilioError, domicilioResults) => {
                if (domicilioError || domicilioResults.length === 0) {
                    return res.status(404).json({ error: 'Domicilio no encontrado' });
                }

                const insertQuery = 'INSERT INTO orden (cliente_id, metododepago_id, total, domicilio_id) VALUES (?, ?, ?, ?)';
                const values = [cliente_id, metododepago_id, total, domicilio_id];

                connection.query(insertQuery, values, (error, results) => {
                    if (error) {
                        return res.status(500).json({ error: 'Error al consultar la base de datos', error });
                    }

                    res.status(200).json({ message: "Orden creada", results });
                });
            });
        });
    });
});

// ADD DETAILS ABOUT ORDER

app.post('/detailsOrder', (req, res) => {
    const { ordenId, productoId, quantity, price } = req.body

    const checkOrdenQuery = 'SELECT * FROM orden WHERE id = ?'
    const checkProductoQuery = 'SELECT * FROM carrito WHERE producto_id = ?'
    const checkQuantityQuery = 'SELECT * FROM carrito WHERE quantity = ?'
    const checkPriceQuery = 'SELECT * FROM orden WHERE total = ?'

    connection.query(checkOrdenQuery, [ordenId], (ordenError, ordenResults) => {
        if (ordenError || ordenResults.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrado' });
        }

        connection.query(checkProductoQuery, [productoId], (productoError, productoResults) => {
            if (productoError || productoResults.length === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            connection.query(checkQuantityQuery, [quantity], (quantityError, quantityResults) => {
                if (quantityError || quantityResults.length === 0) {
                    return res.status(404).json({ error: 'Cantidad no concuerda con la orden' });
                }

                connection.query(checkPriceQuery, [price], (priceError, priceResults) => {
                    if (priceError || priceResults.length === 0) {
                        return res.status(404).json({ error: 'Total no encontrado' });
                    }

                    const query = 'INSERT INTO orden_detalles (orden_id, producto_id, quantity, price) VALUES (?, ?, ?, ?)'
                    const values = [ordenId, productoId, quantity, price]

                    connection.query(query, values, (error, results) => {
                        if (error) {
                            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
                        }

                        res.status(200).json({ message: "Detalles de la orden creadas", results });
                    })
                })
            })
        })
    })
})

// GET ORDER 

app.get('/getOrder/:idOrder', (req, res) => {
    const { idOrder } = req.params
    const query = 'SELECT * FROM orden WHERE id = ?'
    const values = [idOrder]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        res.status(200).json({ message: 'Orden obtenido', results })
    })
})

// GET DETAILS ABOUT ORDER 

app.get('/getDetailsOrder/:idDetailsOrder', (req, res) => {
    const { idDetailsOrder } = req.params
    const query = 'SELECT * FROM orden_detalles WHERE id = ?'
    const values = [idDetailsOrder]

    connection.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al consultar la base de datos', error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Detalles del orden no encontrados' });
        }

        res.status(200).json({ message: 'Detalles del orden obtenidos', results })
    })
})

module.exports = app