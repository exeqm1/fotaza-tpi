const db = require('./models');

async function seedDatabase() {
    try {
        // Sincronizamos la DB primero (sin forzar para no borrar tablas existentes)
        await db.sequelize.sync(); 
        
        // 1. Crear un usuario de prueba con sus fotos de perfil y portada
        const user = await db.User.create({
            username: 'fotografo_pro',
            email: 'fotografo@fotaza.com',
            password: 'password123', // Temporal, a futuro lo hashearemos
            role: 'USER',
            status: 'ACTIVE'
        });

        console.log('✅ Usuario creado:', user.username);

        // 2. Crear Post 1 (No a la venta)
        const post1 = await db.Post.create({
            userId: user.id,
            title: 'Atardecer en las sierras',
            descriptionText: 'Una vista espectacular desde lo más alto de la montaña en la hora dorada. Un momento de mucha paz.',
            postStatus: 'ACTIVE',
            forSale: false,
            price: 0
        });

        await db.Image.create({
            postId: post1.id,
            title: post1.title,
            filePath: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?fit=crop&w=600&h=600',
            licenseType: 'COPYRIGHT'
        });

        // 3. Crear Post 2 (A la venta)
        const post2 = await db.Post.create({
            userId: user.id,
            title: 'Retrato urbano en HD',
            descriptionText: 'Explorando las calles de la ciudad y encontrando arte en cada esquina y mirada.',
            postStatus: 'ACTIVE',
            forSale: true,
            price: 1500.50
        });

        await db.Image.create({
            postId: post2.id,
            title: post2.title,
            filePath: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?fit=crop&w=600&h=600',
            licenseType: 'COPYRIGHT'
        });

        console.log('✅ Publicaciones e imágenes creadas con éxito!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        process.exit(1);
    }
}

seedDatabase();