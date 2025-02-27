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
            .json({errors});
    }

    const existingUser = await User.findOne({where: {username}});
    if (existingUser) {
        return res
            .status(409)
            .json({error: "Specified username already exists"});
    }

    try {
        const newUser = await User.create({username, firstname, lastname});
        return res
            .status(200)
            .json(newUser);
    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while creating the user: ${err}`});
    }

})

router.get('/user', async (req, res) => {
    const eventID = req.query.eventID;

    if (eventID) {
        const errors = validateNumber(eventID);

        if (errors.length > 0) {
            return res
                .status(422)
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
        .json(usersJson);

})

router.get('/user/:id', async (req, res) => {
    const {id} = req.params;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    try {
        const foundUser = await User.findOne({
            where: {id: id}
        });

        if (foundUser) {
            return res
                .status(200)
                .json({user: foundUser});
        } else {
            return res
                .status(404)
                .json({error: `User with ID ${id} was not found`});
        }

    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while retrieving the user: ${err}`});
    }
});

router.delete('/user/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundUser = await User.findOne({where: {id: id}});

        if (!foundUser) {
            return res
                .status(404)
                .json({error: `User with ID ${id} was not found`});
        }
        const reservationCount = await Reservation.count({where: {userId: id}});
        if (reservationCount > 0) {
            return res
                .status(422)
                .json({error: `User with ID ${id} could not be deleted`});
        }
        await User.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
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
            .json({errors});
    }

    try {
        const foundUser = await User.findOne({where: {id: id}});

        if (!foundUser) {
            return res
                .status(404)
                .json({error: `User with ID ${id} was not found`});
        }
        const foundUsername = await User.findOne({where: {username: username, id: {[Op.ne]: id}}});

        if (foundUsername) {
            return res
                .status(404)
                .json({error: `Username ${username} already exists`});
        }

        await User.update(
            {username, firstname, lastname},
            {where: {id: id}}
        );
        const updatedUser = await User.findOne({where: {id: id}});

        return res
            .status(200)
            .json({user: updatedUser});
    } catch (error) {
        return res
            .status(500)
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
            .json({errors});
    }
    const existingOrganizer = await Organizer.findOne({where: {name}});
    if (existingOrganizer) {
        return res
            .status(409)
            .json({error: "Specified organizer name already exists"});
    }

    try {
        const newOrganizer = await Organizer.create({name});
        return res
            .status(200)
            .json(newOrganizer);
    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while creating the organizer: ${err}`});
    }

})

router.delete('/organizer/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundUser = await Organizer.findOne({where: {id: id}});

        if (!foundUser) {
            return res
                .status(404)
                .json({error: `Organizer with ID ${id} was not found`});
        }
        const eventCount = await Event.count({where: {organizerID: id}});

        if (eventCount > 0) {
            return res
                .status(422)
                .json({error: `Organizer with ID ${id} could not be deleted`});
        }
        await Organizer.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
            .json({error: `An error occurred while deleting the Organizer: ${error}`});
    }

});

router.get('/organizer', async (req, res) => {
    const hasEvents = req.query.hasEvents;


    if (hasEvents !== undefined && hasEvents !== 'true' && hasEvents !== 'false') {
        return res
            .status(422)
            .json({errors: "The parameter hasEvents must be either 'true' or 'false'"});
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
            .json({errors});
    }

    try {
        const foundEventType = await EventType.findOne({where: {name}});
        if (foundEventType) {
            return res
                .status(409)
                .json({error: "Specified event type already exists"});
        }

        const newEventType = await EventType.create({name});
        return res
            .status(200)
            .json(newEventType);
    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while creating the organizer: ${err}`});
    }

})

router.delete('/event-type/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundEventType = await EventType.findOne({where: {id: id}});

        if (!foundEventType) {
            return res
                .status(404)
                .json({error: `EventType with ID ${id} was not found`});
        }
        const eventCount = await Event.count({where: {eventTypeID: id}});

        if (eventCount > 0) {
            return res
                .status(422)
                .json({error: `EventType with ID ${id} could not be deleted`});
        }
        await EventType.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
            .json({error: `An error occurred while deleting the Organizer: ${error}`});
    }

});

router.get('/event-type', async (req, res) => {

    const eventTypes = await EventType.findAll();

    const usersJson = eventTypes.map(eventType => eventType.toJSON());

    return res
        .status(200)
        .json(usersJson);

})


//Event API
router.post('/event/create', async (req, res) => {
    let {
        eventTypeID,
        organizerID,
        name,
        price,
        dateTime,
        locationLatitude,
        locationLongitude,
        maxParticipants
    } = req.body;
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
    if (/[^a-zA-Z0-9 ]/.test(name)) {
        const pos = name.search(/[^a-zA-Z0-9 ]/);
        errors.push(`Name should only contain alphanumeric characters and spaces. Wrong char '${name[pos]}' was found at position ${pos + 1}`);
    }


    if (price === 0) {
        errors.push('price should be non-zero')
    }
    if (maxParticipants === 0) {
        errors.push('maxParticipants should be non-zero')
    }
    if (dateTime <= Date.now()) {
        errors.push("dateTime must be in the future.");
    }

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    try {
        const foundEventType = await EventType.findOne({where: {id: eventTypeID}});
        const foundOrganizer = await Organizer.findOne({where: {id: organizerID}});

        if (!foundEventType) {
            return res
                .status(409)
                .json({error: "Specified event type does not exist"});
        }
        if (!foundOrganizer) {
            return res
                .status(409)
                .json({error: "Specified organizer does not exist"});
        }

        const foundNewEvent = await Event.create(newEvent);
        return res
            .status(200)
            .json(foundNewEvent);
    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while creating the organizer: ${err}`});
    }

})

router.delete('/event/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundEvent = await Event.findOne({where: {id: id}});

        if (!foundEvent) {
            return res
                .status(404)
                .json({error: `Event with ID ${id} was not found`});
        }
        const reservationCount = await Reservation.count({where: {eventID: id}});

        if (reservationCount > 0) {
            return res
                .status(422)
                .json({error: `Event with ID ${id} could not be deleted`});
        }
        await Event.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
            .json({error: `An error occurred while deleting the Event: ${error}`});
    }
});

router.get('/event/:id', async (req, res) => {
    const {id} = req.params;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    try {
        const foundEvent = await Event.findOne({
            where: {id: id}
        });

        if (foundEvent) {
            return res
                .status(200)
                .json({event: foundEvent});
        } else {
            return res
                .status(404)
                .json({error: `Event with ID ${id} was not found`});
        }

    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while retrieving the event: ${err}`});
    }
});

router.put('/event/update', async (req, res) => {
    let {
        id,
        eventTypeID,
        organizerID,
        name,
        price,
        dateTime,
        locationLatitude,
        locationLongitude,
        maxParticipants
    } = req.body;
    //Pre-processing
    dateTime = Number(dateTime);
    if (dateTime.toString().length === 10) {
        dateTime *= 1000; // Convert seconds to milliseconds if the stamp is in seconds (10 digits)
    }
    console.log(id)
    let errors = [];
    errors.push(...validateNumber(id));
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

    if (price === 0) {
        errors.push('price should be non-zero')
    }
    if (maxParticipants === 0) {
        errors.push('maxParticipants should be non-zero')
    }
    if (dateTime <= Date.now()) {
        errors.push("dateTime must be in the future.");
    }

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    try {
        const foundEvent = await Event.findOne({where: {id: id}});

        if (!foundEvent) {
            return res
                .status(404)
                .json({error: `Event with ID ${id} was not found`});
        }
        let newUpdatedEvent = {
            eventTypeID: Number(eventTypeID),
            organizerID: Number(organizerID),
            name,
            price: Number(price),
            dateTime,
            locationLatitude: Number(locationLatitude),
            locationLongitude: Number(locationLongitude),
            maxParticipants: Number(maxParticipants)
        };
        await Event.update(
            newUpdatedEvent,
            {where: {id: id}}
        );
        const updatedEvent = await Event.findOne({where: {id: id}});

        return res
            .status(200)
            .json(updatedEvent);
    } catch (error) {
        return res
            .status(500)
            .json({error: `An error occurred while updating the event: ${error}`});
    }

})

router.get('/event', async (req, res) => {
    const organizerID = req.query.organizerID;
    const eventTypeID = req.query.eventTypeID;
    let dateTime = req.query.dateTime;
    const userIDs = req.query.userIDs ? req.query.userIDs.split(',').map(id => id.trim()) : null;

    dateTime = Number(dateTime);

    if (dateTime.toString().length === 10) {
        dateTime *= 1000; // Convert seconds to milliseconds if the stamp is in seconds (10 digits)
    }

    const queryOptions = {
        where: {},
    };
    const validationErrors = [];
    const databaseErrors = [];

    if (organizerID) {
        queryOptions.where.organizerID = organizerID;
        const existingOrganizer = await Organizer.findOne({where: {id: organizerID}});
        if (!existingOrganizer) {
            databaseErrors.push(`Organizer with ID ${organizerID} was not found`)
        }
        validationErrors.push(...validateNumber(organizerID, "organizerID"));
    }

    if (eventTypeID) {
        queryOptions.where.eventTypeID = eventTypeID;
        const existingEventType = await EventType.findOne({where: {id: eventTypeID}});
        if (!existingEventType) {
            databaseErrors.push(`Event Type with ID ${eventTypeID} was not found`)
        }
        validationErrors.push(...validateNumber(eventTypeID, "eventTypeID"));
    }

    if (dateTime) {
        queryOptions.where.dateTime = {[Op.gte]: dateTime};
        validationErrors.push(...validateNumber(dateTime, "dateTime"));
    }
    if (userIDs) {
        for (let userID of userIDs) {
            validationErrors.push(...validateNumber(userID, `User ID '${userID}'`));
            const existingUser = await User.findOne({where: {id: userID}});
            if (!existingUser) {
                databaseErrors.push(`User with ID ${userID} was not found`)
            }
        }
    }

    if (validationErrors.length > 0) {
        return res
            .status(422)
            .json({errors: validationErrors});
    } else if (databaseErrors.length > 0) {
        return res
            .status(404)
            .json({errors: databaseErrors});
    }

    const events = await Event.findAll(queryOptions);


    const eventsJson = events.map(event => event.toJSON());

    return res
        .status(200)
        .json(eventsJson);
})


//Reservation API
router.post('/reservation/create', async (req, res) => {
    let {eventID, userID} = req.body;

    let errors = [];

    errors.push(...validateNumber(eventID, 'eventID'));
    errors.push(...validateNumber(userID, 'userID'));

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }


    const foundEvent = await Event.findOne({where: {id: eventID}});
    const foundUser = await User.findOne({where: {id: userID}});
    if (!foundEvent) {
        return res
            .status(409)
            .json({error: "Specified event does not exist"});
    }
    if (!foundUser) {
        return res
            .status(409)
            .json({error: "Specified user does not exist"});
    }

    const reservationCount = await Reservation.count({where: {userId: userID, eventId: eventID}});
    if (reservationCount > 0) {
        return res
            .status(422)
            .json({error: `User with ID ${userID} already has a reservation for event with ID ${eventID}.`});
    }

    const maxParticipants = foundEvent.maxParticipants;
    const numParticipants = await Reservation.count({where: {eventId: eventID}});
    if (numParticipants >= maxParticipants) {
        return res
            .status(422)
            .json({error: `event with ID ${eventID} has reached maximum capacity of ${maxParticipants} participants.`});
    }

    try {
        const newReservation = await Reservation.create({eventID, userID});
        return res
            .status(200)
            .json(newReservation);
    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while creating the reservation: ${err}`});
    }

})

router.get('/reservation/:id', async (req, res) => {
    const {id} = req.params;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    try {
        const foundReservation = await Reservation.findOne({
            where: {id: id}
        });

        if (foundReservation) {
            return res
                .status(200)
                .json({reservation: foundReservation});
        } else {
            return res
                .status(404)
                .json({error: `Reservation with ID ${id} was not found`});
        }

    } catch (err) {
        return res
            .status(500)
            .json({error: `An error occurred while retrieving the Reservation: ${err}`});
    }
});

router.delete('/reservation/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateNumber(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .json({errors});
    }

    const t = await sequelize.transaction();
    try {
        const foundReservation = await Reservation.findOne({where: {id: id}});

        if (!foundReservation) {
            return res
                .status(404)
                .json({error: `Reservation with ID ${id} was not found`});
        }

        await Reservation.destroy({where: {id: id}, transaction: t});
        await t.commit();
        return res
            .status(200)
            .send("OK");
    } catch (error) {
        await t.rollback();
        return res
            .status(500)
            .json({error: `An error occurred while deleting the Reservation: ${error}`});
    }
});

router.get('/reservation', async (req, res) => {
    const userIDs = req.query.userIDs ? req.query.userIDs.split(',') : null;
    const eventIDs = req.query.eventIDs ? req.query.eventIDs.split(',') : null;

    if (userIDs && eventIDs && userIDs.length > 0 && eventIDs.length > 0) {
        return res
            .status(422)
            .json("The eventID and userID parameters may not be used at the same time");
    }

    const queryOptions = {
        where: {},
    };
    const validationErrors = [];
    const databaseErrors = [];

    if (userIDs && userIDs.length > 0) {
        queryOptions.where.userID = userIDs;

        for (let userID of userIDs){
            const existingUser = await User.findOne({where: {id: userID}});
            if (!existingUser) {
                databaseErrors.push(`User with ID ${userID} was not found`)
            }
            const errors = validateNumber(userID, "userID");
            if(errors.length>0){
                validationErrors.push(userID + " : " + errors.toString().replace(",", " "));
            }
        }
    }

    if (eventIDs && eventIDs.length > 0) {
        queryOptions.where.eventID = eventIDs;
        for (let eventID of eventIDs){
            const existingEvent = await Event.findOne({where: {id: eventID}});
            if (!existingEvent) {
                databaseErrors.push(`Event with ID ${eventID} was not found`)
            }
            const errors = validateNumber(eventID, "eventID");
            if(errors.length>0){
                validationErrors.push(eventID + " : " + errors.toString().replace(",", " "));
            }
        }
    }


    if (validationErrors.length > 0) {
        return res
            .status(422)
            .json({errors: validationErrors});
    } else if (databaseErrors.length > 0) {
        return res
            .status(404)
            .json({errors: databaseErrors});
    }

    const reservation = await Reservation.findAll(queryOptions);
    const reservationsJson = reservation.map(reservation => reservation.toJSON());

    return res
        .status(200)
        .json(reservationsJson);
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

    if (type === "latitude") {
        if (Number(location) > 90) errors.push(type + ' must between values -90 and 90');
    } else if (type === "longitude") {
        if (Number(location) > 180) errors.push(type + ' must between values -180 and 180');
    }


    return errors;
}

module.exports = router;