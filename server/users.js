// Store users in memory
const users = [];

// Add a new user to the chat
function addUser({ id, username }) {
    // Clean the data
    username = username.trim();

    // Validate the data
    if (!username) {
        return { error: 'Username is required' };
    }

    // Store user
    const user = { id, username };
    users.push(user);
    return { user };
}

// Remove a user by their socket ID
function removeUser(id) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get a specific user by their socket ID
function getUser(id) {
    return users.find((user) => user.id === id);
}

// Get all currently connected users
function getUsers() {
    return users;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsers
};
