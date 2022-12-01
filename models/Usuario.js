const db = require('./db')

const Usuario = db.sequelize.define('usuario', {
    nome:{
        type: db.Sequelize.STRING(60),
        allowNull: false
    },
    telefone: {
        type: db.Sequelize.STRING(11),
        allowNull: false
    },
    email:{
        type: db.Sequelize.STRING(60),
        allowNull: false,
        primaryKey: true
    },
    senha: {
        type: db.Sequelize.STRING(8),
        allowNull: false
    }
}) 

Usuario.sync()

module.exports = Usuario