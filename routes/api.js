const express = require('express');
const {User} = require('../models');

const router = express.Router();


//Users API
router.post('/user/create', async (req, res) => {
    const { username, firstname, lastname } = req.body;

    const errors = [];


    if (!username) errors.push('Username is missing.');
    else if (typeof username !== 'string') errors.push('Username must be a string.');
    else if (username.trim() === '') errors.push('Username should contain characters.');

    else if (/\W/.test(username)) {
        const pos = username.search(/\W/);
        errors.push(`Username should only contain alphanumeric characters. Wrong char '${username[pos]}' was found at position ${pos+1}`);
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
            .json({ errors });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
        return res
            .status(409)
            .setHeader('content-type', 'application/json')
            .json({ error: "Specified username already exists" });
    }

    try {
        const newUser = await User.create({username, firstname, lastname });
        return res
            .status(200)
            .setHeader('content-type', 'application/json')
            .json({ user: newUser });
    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({ error: `An error occurred while creating the user: ${err}` });
    }

})

router.get('/user/:id', async (req, res) => {
    const { id } = req.params;

    const errors = validateId(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({ errors });
    }

    try {
        const foundUser = await User.findOne({ id });
        if(foundUser) {
            return res
                .status(200)
                .setHeader('content-type', 'application/json')
                .json({ user: foundUser });
        } else {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({ error: `User with ID ${id} was not found` });
        }

    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({ error: `An error occurred while retrieving the user: ${err}` });
    }
});

router.get('/user/delete', async (req, res) => {
    const id = req.query.id;

    const errors = validateId(id);

    if (errors.length > 0) {
        return res
            .status(422)
            .setHeader('content-type', 'application/json')
            .json({ errors });
    }

    try {
        const foundUser = await User.findOne({ id });
        if(foundUser) {
            return res
                .status(200)
                .setHeader('content-type', 'application/json')
                .json({ user: foundUser });
        } else {
            return res
                .status(404)
                .setHeader('content-type', 'application/json')
                .json({ error: `User with ID ${id} was not found` });
        }

    } catch (err) {
        return res
            .status(500)
            .setHeader('content-type', 'application/json')
            .json({ error: `An error occurred while retrieving the user: ${err}` });
    }
});

function validateId(id) {
    const errors = [];

    if (!id) errors.push('ID is missing.');
    if (id.trim().length === 0) errors.push('ID must be non-empty.');
    if (isNaN(Number(id))) errors.push('ID must be a valid number.');
    else if (!Number.isInteger(Number(id))) errors.push('ID must be an integer.');
    if (Number(id) < 0) errors.push('ID must be positive.');

    return errors;
}

module.exports = router;