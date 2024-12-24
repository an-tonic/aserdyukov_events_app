const sequelize = require('../config/database');
const User = require('./user');
const Event = require('./event');
const Reservation = require('./reservation');
const EventType = require('./eventType');
const Organizer = require('./organizer');


Event.belongsTo(EventType, { foreignKey: 'eventTypeID' });

Event.belongsTo(Organizer, { foreignKey: 'organizerID' });
Organizer.hasMany(Event, { foreignKey: 'organizerID' });

Reservation.belongsTo(User, { foreignKey: 'userID' });
User.hasMany(Reservation, { foreignKey: 'userID' });


Event.hasMany(Reservation, { foreignKey: 'eventID' });
Reservation.belongsTo(Event, { foreignKey: 'eventID' });

module.exports = { sequelize, User, Event, Reservation, EventType, Organizer };
