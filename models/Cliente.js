const db = require('./db')

const Cliente = db.sequelize.define('cliente', {
    idCliente: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
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
        allowNull: false
    },
    data_nasc: {
        type: db.Sequelize.DATE,
        allowNull: false
    }
}) 

Cliente.sync()

module.exports = Cliente