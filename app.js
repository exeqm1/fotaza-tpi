const express = require('express');
const path = require('path');
require('dotenv').config();

// Importamos el "Director de Orquesta" de los modelos
const db = require('./models'); 

const app = express();

// Configuración del motor de plantillas (Views)
app.set('view engine', 'pug');
// Apuntamos a la carpeta de tus vistas (asegurate de tener esta ruta o adaptarla)
app.set('views', path.join(__dirname, 'views'));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de prueba básica
app.get('/', (req, res) => {
    res.render('index'); // Busca automáticamente index.pug en la carpeta views
});

// PRUEBA DE FUEGO: Autenticar conexión y levantar servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Conexión a la base de datos de Laragon establecida con éxito.');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
    }
}

startServer();