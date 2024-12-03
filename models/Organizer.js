const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organizer = sequelize.define('Organizer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
});

module.exports = Organizer;
