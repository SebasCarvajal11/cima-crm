const { getClientById, saveClient, updateClientById, deleteClientById, getAllClients, createUserAndClient } = require('./client-model');
const bcrypt = require('bcryptjs');

// Obtener un cliente por su ID
module.exports.getClientById = async (clientId) => {
    try {
        const client = await getClientById(clientId);

        if (!client) {
            throw new Error('Cliente no encontrado.');
        }

        return client;
    } catch (error) {
        throw new Error('Error al obtener el cliente: ' + error.message);
    }
};

// Get all clients
// Add this at the beginning of the file to see what's happening
const clientModel = require('./client-model');

// Modify the getAllClients function to log the data at each step
exports.getAllClients = async () => {
    try {
        // Get clients from the model
        const clients = await clientModel.getAllClients();
        
        // Log what we're getting from the model
        console.log('Raw clients from model:', JSON.stringify(clients, null, 2));
        
        // Ensure we're returning all client data
        return clients.map(client => ({
            clientId: client.clientId,
            userId: client.userId,
            name: client.name,
            email: client.email,
            contactInfo: client.contactInfo,
            address: client.address,
            additionalInfo: client.additionalInfo,
            plan: client.plan,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            role: client.role
        }));
    } catch (error) {
        console.error('Error in getAllClients service:', error);
        throw error;
    }
};

module.exports.saveClient = async (client) => {
    try {
        // Llamar al modelo para crear el cliente
        const newClient = await saveClient(client);

        // Verificar que el cliente ha sido insertado correctamente y que contiene un clientId
        if (!newClient || !newClient.clientId) {
            throw new Error('El cliente no fue creado correctamente.');
        }

        return newClient; // Devolver el cliente con el clientId
    } catch (error) {
        throw new Error('Error al guardar el cliente: ' + error.message);
    }
};

// Actualizar un cliente por su ID
module.exports.updateClientById = async (clientId, updatedClientData) => {
    try {
        const updatedClient = await updateClientById(clientId, updatedClientData);

        if (!updatedClient) {
            throw new Error('No se pudo actualizar el cliente.');
        }

        return updatedClient;
    } catch (error) {
        throw new Error('Error al actualizar el cliente: ' + error.message);
    }
};

// Eliminar un cliente por su ID
module.exports.deleteClientById = async (clientId) => {
    try {
        const result = await deleteClientById(clientId);

        if (!result) {
            throw new Error('No se pudo eliminar el cliente.');
        }

        return result;
    } catch (error) {
        throw new Error('Error al eliminar el cliente: ' + error.message);
    }
};

// Create user and client in a single transaction
module.exports.createUserAndClient = async (userData, clientData) => {
    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);
        
        // Replace the plain password with the hash
        userData.passwordHash = passwordHash;
        
        // Call the model function to create both records
        const result = await createUserAndClient(userData, clientData);
        
        return result;
    } catch (error) {
        throw new Error('Error al crear usuario y cliente: ' + error.message);
    }
};
