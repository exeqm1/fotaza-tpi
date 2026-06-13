const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const requireAdmin = (req, res, next) => { 
    if (!req.session.user || req.session.user.role !== 'ADMIN') {
        return res.status(403).send('Acceso denegado. Se requieren permisos de administrador.');
    }
    next();
};

module.exports = { requireAuth, requireAdmin };
