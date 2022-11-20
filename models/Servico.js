const db = require('./db')

const Servico = db.sequelize.define('servico', {
    idServico: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome:{
        type: db.Sequelize.STRING(60),
        allowNull: false
    },
    valor: {
        type: db.Sequelize.DECIMAL(5,2),
        allowNull: false
    }
}) 

Servico.sync()

module.exports = Servico