# Event Management API

This is an API designed to manage events, users, reservations, event types, and organizers. Built with **Node.js**, **Express**, and **Sequelize**, this API allows for easy creation, updating, and querying of event-related data.

## Features

- **User Management**: Register and manage users with basic details like username, first name, and last name.
- **Event Management**: Create and manage events with details such as date, location, price, and type.
- **Reservations**: Users can make reservations for events, subject to availability.
- **Event Types & Organizers**: Manage types of events and their organizers.

## Technologies Used

- **Node.js**: JavaScript runtime for building the API.
- **Express.js**: Web framework for routing and middleware handling.
- **Sequelize**: ORM for interacting with the database.
- **MySQL**: Database for storing event, user, and reservation data.

## API Endpoints

### Users

- **GET /api/users**: Fetch all users.
- **POST /api/users**: Register a new user.
- **GET /api/users/:id**: Get a specific user by ID.
- **PUT /api/users/:id**: Update user details by ID.
- **DELETE /api/users/:id**: Delete a user by ID.

### Events

- **GET /api/events**: Fetch all events.
- **POST /api/events**: Create a new event.
- **GET /api/events/:id**: Get event details by ID.
- **PUT /api/events/:id**: Update an event by ID.
- **DELETE /api/events/:id**: Delete an event by ID.

### Reservations

- **GET /api/reservations**: Fetch all reservations.
- **POST /api/reservations**: Make a new reservation.
- **GET /api/reservations/:id**: Get reservation details by ID.
- **DELETE /api/reservations/:id**: Cancel a reservation by ID.

### Event Types

- **GET /api/event-types**: Fetch all event types.
- **POST /api/event-types**: Add a new event type.

### Organizers

- **GET /api/organizers**: Fetch all organizers.
- **POST /api/organizers**: Add a new organizer.

## Database Models

- **User**: Stores user details (username, first name, last name).
- **Event**: Stores event details (name, price, location, date, type, organizer).
- **Reservation**: Stores reservation details (user, event, date).
- **EventType**: Stores types of events.
- **Organizer**: Stores details about event organizers.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/an-tonic/aserdyukov_events_app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd aserdyukov_events_app
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Run the server:
   ```bash
   npm start
   ```

The API will be accessible at `http://localhost:3000`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
