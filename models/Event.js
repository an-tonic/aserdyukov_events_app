const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const EventType = require('./eventType');
const Organizer = require('./organizer');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    eventTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: EventType,
            key: 'id',
        },
    },
    organizerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Organizer,
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    dateTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    locationLatitude: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    locationLongitude: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
});

module.exports = Event;
