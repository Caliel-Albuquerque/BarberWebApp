const db = require('./db');

const Atendimento = db.sequelize.define('atendimento', {

    idAtendimento: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }, 
    nome: {
        type: db.Sequelize.STRING(60),
        allowNull: false
    },
    valor: {
        type: db.Sequelize.DECIMAL(5, 2),
        allowNull: false
    },
    data_atendimento: {
        type: db.Sequelize.STRING(60),
        allowNull: false
    },
    forma_pag: {
        type: db.Sequelize.STRING(60),
        allowNull: false
    }


})

Atendimento.sync()

module.exports = Atendimento