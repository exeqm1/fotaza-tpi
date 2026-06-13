# Fotaza — Trabajo Práctico Integrador (TPI)

Repositorio de **Fotaza**. Una plataforma web de gestión y publicación de fotografías que corresponden al Trabajo Práctico Integrador de la materia Programacion Web 2 para la carrera Tecnicatura Universitaria en Desarrollo de Software

## Link a la web

https://fotaza-tpi-web.onrender.com/

---

## Despliegue e Infraestructura (Railway)

La arquitectura de la aplicación fue migrada con éxito a **Railway**, implementando una infraestructura moderna dividida en servicios independientes:
1. **Servidor Backend:** Node.js + Express configurado con escucha de puertos dinámicos (`process.env.PORT`) y mapeado global `0.0.0.0` 
2. **Base de Datos:** Instancia administrada de MySQL en la nube con persistencia relacional mediante el ORM **Sequelize**.
3. **Almacenamiento Persistente (Volúmenes):** Para evitar la pérdida de imágenes (posts, avatares, portadas) por el sistema de archivos efímero de los contenedores, se acopló un volumen de disco rígido dedicado en la ruta de montaje `/app/src/public/uploads`.

---

## NOTA IMPORTANTE !!!

> **NO ES NECESARIO EJECUTAR EL COMANDO DE INICIALIZACIÓN DE LA BASE DE DATOS (`npm run db:init` o similares).**
> 
> La base de datos de producción en Railway ya se encuentra **completamente migrada, inicializada y con todos sus datos y relaciones estructurales intactos**. Al arrancar el servidor Express, el ORM Sequelize realiza un `.sync()` automático que valida el esquema actual sin alterar los registros existentes. Ejecutar scripts de borrado manual o forzar inicializaciones locales podría romper la conexión y consistencia del entorno en vivo.

---

## Tecnologías Utilizadas

* **Backend:** Node.js, Express.js
* **ORM / Base de Datos:** Sequelize, MySQL (Hosting en Railway)
* **Autenticación:** Criptografía y Hash de contraseñas mediante `Bcrypt`
* **Subida de Archivos:** `Multer` para la gestión de uploads multimedia
* **Frontend:** HTML5, CSS3 (con diseño adaptivo), JavaScript (Vanilla)

---

## Estructura Principal del Proyecto

```text
├── config/                    # Configuración de Sequelize y variables de entorno
├── controllers/               # (authController, postsController, etc)
├── info/                      # Esquemas y diagramas del proyecto
      └── class_diagrams/      # Diagrama de clases en varios formatos
      └── db_diagrams/         # Diagrama entidad-relacion para la DB
├── models/                    # Modelos de Sequelize (User, Post, Image, Comment, etc.)
├── routes/                    # Enrutadores de Express protegidos por sesión
└── public/                    # Contenido estático (CSS, JS, Imágenes)
      └── uploads/             # <-- PUNTO DE MONTAJE DEL VOLUMEN PERSISTENTE
├── app.js                     # Archivo central de inicialización del servidor
├── package.json               # Dependencias y scripts del proyecto
└── README.md                  # Documentación del sistema
