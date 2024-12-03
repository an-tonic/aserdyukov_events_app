const { Sequelize, DataTypes } = require('sequelize'); // import sequelize

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/events.db'
});

module.exports = sequelize;