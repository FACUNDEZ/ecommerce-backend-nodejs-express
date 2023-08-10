const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

const app = express()
app.use(express.json())
app.use(cors({ origin: "*" }))
dotenv.config()

const clientesApp = require('./clientes')
app.use('/', clientesApp)

const productosApp = require('./productos')
app.use('/', productosApp) 

const pedidosApp = require('./pedidos')
app.use('/', pedidosApp)

app.listen(3000, () => {
    console.log('El servidor corre por el puerto 3000')
})