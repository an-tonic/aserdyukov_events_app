const express = require('express');
const {User, Reservation, Organizer, Event, sequelize, EventType} = require('../models');
const {Op} = require("sequelize");

const router = express.Router();


//Users API
router.post('/user/create', async (req, res) => {
    const {username, firstname, lastname} = req.body;

    const errors = [];


    if (!username) errors.push('Username is missing.');
    else if (typeof username !== 'string') errors.push('Username must be a string.');
    else if (username.trim() === '') errors.push('Username should contain characters.');

    else if (/\W/.test(username)) {
        const pos = username.search(/\W/);
        errors.push(`Username should only contain alphanumeric characters. Wrong char '${username[pos]}' was found at position ${pos + 1}`);
    }
    if (!firstname) errors.push('Firstname is missing.');
    else if (typeof firstname !== 'string') errors.push('Firstname must be a string.');
    else if (firstname.trim() === '') errors.push('Firstname should contain characters.');
    else if (firstname.trim().length < 2) errors.push('Firstname should contain at least two characters.');


    if (!lastname) errors.push('Lastname is missing.');
    else if (typeof lastname !== 'string') errors.push('Lastname must be a string.');
    else if (lastname.trim() === '') errors.push('Lastname should contain characters.');
    else if (lastname.trim().length < 2) errors.push('Lastname should contain at least two characters.');


    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    const existingUser = await User.findOne({where: {username}});
    if (existingUser) {
        return res
            .status(409)
            .setHeader('content-type', 'application/json')
            .json({error: "Specified username already exists"});
    }

    try {
        const newUser = await User.create({username, firstname, lastname});
        return res
            .status(200)
            .setHeader('content-type', 'application/json')
            .json(newUser);
    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while creating the user: ${err}`});
    }

})

//TODO test with events
router.get('/user', async (req, res) => {
    const eventID = req.query.eventID;

    if (eventID) {
        const errors = validateNumber(eventID);

        if (errors.length > 0) {
            return res
                .status(422)
                .setHeader('content-type', 'application/json')
                .json({errors});
        }
    }

    let queryOptions = {
        include: {
            model: Reservation,
            required: !!eventID,
            where: eventID ? {eventID: eventID} : {},
        },
    };

    const users = await User.findAll(queryOptions);

    const usersJson = users.map(user => user.toJSON());

    return res
        .status(200)
        .setHeader('content-type', 'application/json')
        .json(usersJson);

})

router.get('/user/:id', async (req, res) => {
    const {id} = req.params;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    try {
        const foundUser = await User.findOne({
            where: {id: id}
        });

        if (foundUser) {
            return res
                .status(200)
                .setHeader('content-type', 'application/json')
                .json({user: foundUser});
        } else {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({error: `User with ID ${id} was not found`});
        }

    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while retrieving the user: ${err}`});
    }
});

//todo test this method
router.delete('/user/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundUser = await User.findOne({where: {id: id}});

        if (!foundUser) {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({error: `User with ID ${id} was not found`});
        }
        const reservationCount = await Reservation.count({where: {userId: id}});
        if (reservationCount > 0) {
            return res
                .status(422)
                .setHeader('content-type', 'application/json')
                .json({error: `User with ID ${id} could not be deleted`});
        }
//TODO Check that transactions here work
        await User.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .setHeader('content-type', 'application/text')
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while deleting the user: ${error}`});
    }


});

router.put('/user/update', async (req, res) => {
    const {id, username, firstname, lastname} = req.body;

    const errors = validateNumber(id);

    if (!username) errors.push('Username is missing.');
    else if (typeof username !== 'string') errors.push('Username must be a string.');
    else if (username.trim() === '') errors.push('Username should contain characters.');

    else if (/\W/.test(username)) {
        const pos = username.search(/\W/);
        errors.push(`Username should only contain alphanumeric characters. Wrong char '${username[pos]}' was found at position ${pos + 1}`);
    }
    if (!firstname) errors.push('Firstname is missing.');
    else if (typeof firstname !== 'string') errors.push('Firstname must be a string.');
    else if (firstname.trim() === '') errors.push('Firstname should contain characters.');
    else if (firstname.trim().length < 2) errors.push('Firstname should contain at least two characters.');


    if (!lastname) errors.push('Lastname is missing.');
    else if (typeof lastname !== 'string') errors.push('Lastname must be a string.');
    else if (lastname.trim() === '') errors.push('Lastname should contain characters.');
    else if (lastname.trim().length < 2) errors.push('Lastname should contain at least two characters.');


    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    try {
        const foundUser = await User.findOne({where: {id: id}});

        if (!foundUser) {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({error: `User with ID ${id} was not found`});
        }
        const foundUsername = await User.findOne({where: {username: username, id: {[Op.ne]: id}}});

        if (foundUsername) {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({error: `Username ${username} already exists`});
        }

        await User.update(
            {username, firstname, lastname},
            {where: {id: id}}
        );
        const updatedUser = await User.findOne({where: {id: id}});

        return res
            .status(200)
            .setHeader('content-type', 'application/json')
            .json({user: updatedUser});
    } catch (error) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while updating the user: ${error}`});
    }

})


//Organizer API
router.post('/organizer/create', async (req, res) => {
    const {name} = req.body;

    const errors = [];

    if (!name) errors.push('Name is missing.');
    else if (typeof name !== 'string') errors.push('Name must be a string.');
    else if (name.trim() === '') errors.push('Name should contain characters.');
    else if (name.length < 2 || name.length > 255) errors.push('The name must be between 2-255 characters long.');


    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }
    const existingOrganizer = await Organizer.findOne({where: {name}});
    if (existingOrganizer) {
        return res
            .status(409)
            .setHeader('content-type', 'application/json')
            .json({error: "Specified organizer name already exists"});
    }

    try {
        const newOrganizer = await Organizer.create({name});
        return res
            .status(200)
            .setHeader('content-type', 'application/json')
            .json(newOrganizer);
    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while creating the organizer: ${err}`});
    }

})

//TODO test with relationships present
router.delete('/organizer/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundUser = await Organizer.findOne({where: {id: id}});

        if (!foundUser) {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({error: `Organizer with ID ${id} was not found`});
        }
        const eventCount = await Event.count({where: {organizerID: id}});

        if (eventCount > 0) {
            return res
                .status(422)
                .setHeader('content-type', 'application/json')
                .json({error: `Organizer with ID ${id} could not be deleted`});
        }
//TODO Check that transactions here work
        await Organizer.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .setHeader('content-type', 'application/text')
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while deleting the Organizer: ${error}`});
    }

});

//TODO test with relations with an event
router.get('/organizer', async (req, res) => {
    const hasEvents = req.query.hasEvents;


    if(hasEvents !== undefined && hasEvents !== 'true' && hasEvents !== 'false'){
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors : "The parameter hasEvents must be either 'true' or 'false'"});
    }

    let queryOptions = {
        include: {
            model: Event,
            required: hasEvents === 'true'
        },
    };

    const organizers = await Organizer.findAll(queryOptions);

    const usersJson = organizers.map(organizer => organizer.toJSON());

    return res
        .status(200)
        .setHeader('content-type', 'application/json')
        .json(usersJson);

})

//EventType API
router.post('/event-type/create', async (req, res) => {
    const {name} = req.body;

    const errors = [];

    if (!name) errors.push('Name is missing.');
    else if (typeof name !== 'string') errors.push('Name must be a string.');
    else if (name.trim() === '') errors.push('Name should contain characters.');
    else if (name.length < 2 || name.length > 255) errors.push('The name must be between 2-255 characters long.');


    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    try {
        const foundEventType = await EventType.findOne({where: {name}});
        if (foundEventType) {
            return res
                .status(409)
                .setHeader('content-type', 'application/json')
                .json({error: "Specified event type already exists"});
        }

        const newEventType = await EventType.create({name});
        return res
            .status(200)
            .setHeader('content-type', 'application/json')
            .json(newEventType);
    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while creating the organizer: ${err}`});
    }

})

//TODO test with relationships present
router.delete('/event-type/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundEventType = await EventType.findOne({where: {id: id}});

        if (!foundEventType) {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({error: `EventType with ID ${id} was not found`});
        }
        const eventCount = await Event.count({where: {eventTypeID: id}});

        if (eventCount > 0) {
            return res
                .status(422)
                .setHeader('content-type', 'application/json')
                .json({error: `EventType with ID ${id} could not be deleted`});
        }
//TODO Check that transactions here work
        await EventType.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .setHeader('content-type', 'application/text')
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while deleting the Organizer: ${error}`});
    }

});

//TODO test with relations with an event
router.get('/event-type', async (req, res) => {

    const eventTypes = await EventType.findAll();

    const usersJson = eventTypes.map(eventType => eventType.toJSON());

    return res
        .status(200)
        .setHeader('content-type', 'application/json')
        .json(usersJson);

})


//Event API
router.post('/event/create', async (req, res) => {
    let {eventTypeID, organizerID, name, price, dateTime, locationLatitude, locationLongitude, maxParticipants} = req.body;
    //Pre-processing
    dateTime = Number(dateTime);
    if (dateTime.toString().length === 10) {
        dateTime *= 1000; // Convert seconds to milliseconds if the stamp is in seconds (10 digits)
    }

    let newEvent = {
        eventTypeID: Number(eventTypeID),
        organizerID: Number(organizerID),
        name,
        price: Number(price),
        dateTime,
        locationLatitude: Number(locationLatitude),
        locationLongitude: Number(locationLongitude),
        maxParticipants: Number(maxParticipants)
    };
    let errors = [];

    errors.push(...validateNumber(eventTypeID, 'eventTypeID'));
    errors.push(...validateNumber(organizerID, 'organizerID'));
    errors.push(...validateNumber(price, 'Price'));
    errors.push(...validateNumber(dateTime, 'dateTime'));
    errors.push(...validateLocation(locationLatitude, 'latitude'));
    errors.push(...validateLocation(locationLongitude, 'longitude'));
    errors.push(...validateNumber(maxParticipants, 'maxParticipants'));

    if (!name) errors.push('Name is missing.');
    else if (typeof name !== 'string') errors.push('Name must be a string.');
    else if (name.trim() === '') errors.push('Name should contain characters.');
    else if (name.length < 2 || name.length > 255) errors.push('The name must be between 2-255 characters long.');
    if (/\W/.test(name)) {
        const pos = name.search(/\W/);
        errors.push(`Name should only contain alphanumeric characters. Wrong char '${name[pos]}' was found at position ${pos + 1}`);
    }

    if(price === 0){
        errors.push('price should be non-zero')
    }
    if(maxParticipants === 0){
        errors.push('maxParticipants should be non-zero')
    }
    if (dateTime <= Date.now()) {
        errors.push("dateTime must be in the future.");
    }

    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({errors});
    }

    try {
        const foundEventType = await EventType.findOne({where: {id: eventTypeID}});
        const foundOrganizer = await Organizer.findOne({where: {id: organizerID}});

        if (!foundEventType) {
            return res
                .status(409)
                .setHeader('content-type', 'application/json')
                .json({error: "Specified event type does not exists"});
        }
        if (!foundOrganizer) {
            return res
                .status(409)
                .setHeader('content-type', 'application/json')
                .json({error: "Specified organizer does not exists"});
        }

        const newEventType = await Event.create(newEvent);
        return res
            .status(200)
            .setHeader('content-type', 'application/json')
            .json(newEventType);
    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({error: `An error occurred while creating the organizer: ${err}`});
    }

})


function validateNumber(id, idType = "ID") {
    const errors = [];

    if (id === null || id === undefined) {
        errors.push(idType + ' is missing.')
        return errors;
    }

    id = id.toString();
    if (id.trim().length === 0) errors.push(idType + ' must be non-empty.');
    if (isNaN(id)) errors.push(idType + ' must be a valid number.');
    else if (!Number.isInteger(Number(id))) errors.push(idType + ' must be an integer.');
    if (Number(id) < 0) errors.push(idType + ' must be positive.');

    return errors;
}

function validateLocation(location, type) {
    const errors = [];

    if (location === null || location === undefined) {
        errors.push(type + ' is missing.')
        return errors;
    }

    location = Math.abs(location).toString();
    if (location.trim().length === 0) errors.push(type + ' must be non-empty.');
    if (isNaN(location)) errors.push(type + ' must be a valid number.');

    if(type === "latitude"){
        if (Number(location) > 90) errors.push(type + ' must between values -90 and 90');
    } else if( type === "longitude"){
        if (Number(location) > 180) errors.push(type + ' must between values -180 and 180');
    }


    return errors;
}

module.exports = router;