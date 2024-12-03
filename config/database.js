const { Sequelize} = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/events.db'
});

module.exports = sequelize;