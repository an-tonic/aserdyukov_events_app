const express = require('express');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', apiRoutes);



sequelize.sync({force: true})
    .then(() => {
        console.log('Database connected');
        app.listen(PORT, () => {
            console.log('Server is running on port http://localhost:' + PORT);
        });
    })
    .catch(err => console.error('Unable to connect to the database:', err));