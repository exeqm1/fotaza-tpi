const express = require('express');
const path = require('path');
require('dotenv').config();

const db = require('./models'); 

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'resources', 'img', 'logo.png'));
});
const fs = require('fs');

console.log(
  fs.existsSync(path.join(__dirname, 'resources', 'img', 'logo.png'))
);

app.use('/resources', express.static(path.join(__dirname, 'resources')));


app.get('/', (req, res) => {
    res.render('index'); 
});

app.get('/posts', (req, res) => {
    res.render('posts'); 
});

app.get('/profile', (req, res) => {
    res.render('profile'); 
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.sequelize.authenticate();
        console.log('Conexión a la base de datos de Laragon establecida con éxito.');
        
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();