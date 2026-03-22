const { getQuery, update, remove, save, type, findQuery } = require('../../core/model');

    // Definir la entidad del cliente
    exports.clientEntity = {
        clientId: type.number,
        userId: type.number,
        contactInfo: type.string,
        address: type.string,
        additionalInfo: type.string,
        plan: type.enum(['Oro', 'Esmeralda', 'Premium']), // Added plan field
        createdAt: type.date,
        updatedAt: type.date
    };  
    
    // Get all clients with user information
    module.exports.getAllClients = async () => {
        try {
            const query = `
                SELECT 
                    c.client_id,
                    c.user_id,
                    c.contact_info,
                    c.address,
                    c.additional_info,
                    c.plan,
                    c.created_at,
                    c.updated_at,
                    u.name,
                    u.email,
                    u.role
                FROM CLIENTS c
                INNER JOIN USERS u ON c.user_id = u.user_id
                ORDER BY c.created_at DESC
            `;
            
            console.log('SQL Query:', query);
            
            const clients = await findQuery(query, [], null);
            
            // Log the raw database results
            if (clients.length > 0) {
                console.log('First raw client from database:', clients[0]);
            }
            
            return clients.map(client => {
                // Log the raw client object to debug
                console.log('Raw client object:', client);
                
                // The issue is here - we need to access the properties directly as they appear in the database result
                // The database returns properties with their original column names, not the camelCase versions
                const mappedClient = {
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
                };
                
                console.log('Mapped client with correct field names:', mappedClient);
                
                return mappedClient;
            });
        } catch (error) {
            console.error("Error getting all clients:", error);
            throw new Error('Error al obtener todos los clientes: ' + error.message);
        }
    };

    module.exports.saveClient = async (client) => {
        if (!client.userId) {
            throw new Error("El userId del cliente no puede estar vacío");
        }

        if (!client.contactInfo) {
            throw new Error("La información de contacto no puede estar vacía");
        }

        const whereObj = { userId: client.userId };

        const dataObj = {
            userId: client.userId,
            contactInfo: client.contactInfo,
            address: client.address,
            additionalInfo: client.additionalInfo,
            plan: client.plan || 'Oro' // Default to Oro if not provided
        };

        try {
            const result = await save('CLIENTS', dataObj, whereObj, this.clientEntity);

            // Modificación aquí: Verificar el resultado de manera diferente
            // El resultado de la inserción contiene insertId, no clientId
            if (!result || !result.insertId) {
                throw new Error('El cliente no fue creado correctamente.');
            }

            // Crear un objeto con el formato esperado
            return {
                clientId: result.insertId,
                userId: client.userId,
                contactInfo: client.contactInfo,
                address: client.address,
                additionalInfo: client.additionalInfo,
                plan: client.plan || 'Oro'
            };
        } catch (error) {
            console.error("Error en la operación de guardar cliente:", error.message);
            throw new Error('Error al guardar el cliente: ' + error.message);
        }
    };


    // Actualizar un cliente por su ID
    module.exports.updateClientById = async (clientId, updatedData) => {
        try {
            // Validate clientId
            if (!clientId) {
                throw new Error('El ID del cliente es requerido');
            }
            
            // Convert to number if it's a string
            const id = parseInt(clientId);
            
            if (isNaN(id)) {
                throw new Error('El ID del cliente debe ser un número');
            }
            
            console.log(`Attempting to update client with ID: ${id}`);
            
            // Use the correct property name for the where clause that matches the entity definition
            const whereClause = { clientId: id };
            
            console.log('Update where clause:', whereClause);
            
            // Check if the client exists before updating
            const client = await this.getClientById(id);
            if (!client) {
                throw new Error('Cliente no encontrado');
            }
            
            // Actualizar el cliente en la base de datos
            const result = await update('CLIENTS', updatedData, whereClause, this.clientEntity);

            if (!result) {
                throw new Error('No se pudo actualizar el cliente.');
            }

            // Return the updated client
            return {
                ...client,
                ...updatedData
            };
        } catch (error) {
            console.error("Error en update:", error);
            throw new Error('Error al actualizar el cliente: ' + error.message);
        }
    };

    // Obtener un cliente por su ID
    module.exports.getClientById = async (clientId) => {
        try {
            const client = await getQuery('SELECT * FROM CLIENTS WHERE client_id = ?', [clientId], this.clientEntity);

            if (!client) {
                throw new Error('Cliente no encontrado.');
            }

            return client;
        } catch (error) {
            throw new Error('Error al obtener el cliente: ' + error.message);
        }
    };

    // Eliminar un cliente por su ID
    module.exports.deleteClientById = async (clientId) => {
        try {
            // Validate clientId
            if (!clientId) {
                throw new Error('El ID del cliente es requerido');
            }
            
            // Convert to number if it's a string
            const id = parseInt(clientId);
            
            if (isNaN(id)) {
                throw new Error('El ID del cliente debe ser un número');
            }
            
            console.log(`Attempting to delete client with ID: ${id}`);
            
            // First, get the client to retrieve the userId
            const client = await this.getClientById(id);
            if (!client) {
                throw new Error('Cliente no encontrado');
            }
            
            console.log(`Found client with userId: ${client.userId}`);
            
            // Use the correct property name for the where clause
            const whereClause = { clientId: id };
            
            console.log('Delete client where clause:', whereClause);
            
            // 1. Delete from CLIENTS table
            const clientResult = await remove('CLIENTS', whereClause, this.clientEntity);
            
            if (!clientResult) {
                throw new Error('No se pudo eliminar el cliente.');
            }
            
            // 2. Now delete the corresponding user
            if (client.userId) {
                console.log(`Now deleting user with ID: ${client.userId}`);
                
                const userModel = require('../user/user-model');
                const userWhereClause = { userId: client.userId };
                
                console.log('Delete user where clause:', userWhereClause);
                
                const userResult = await remove('USERS', userWhereClause, userModel.userEntity);
                
                if (!userResult) {
                    console.warn(`No se pudo eliminar el usuario con ID ${client.userId} asociado al cliente.`);
                } else {
                    console.log(`Usuario con ID ${client.userId} eliminado correctamente.`);
                }
            }
            
            return { 
                success: true, 
                message: 'Cliente y usuario asociado eliminados correctamente' 
            };
        } catch (error) {
            console.error('Error in deleteClientById:', error);
            throw new Error('Error al eliminar el cliente: ' + error.message);
        }
    };

    // New function to create user and client in a single transaction
    module.exports.createUserAndClient = async (userData, clientData) => {
        try {
            // 1. Primero creamos el usuario usando el modelo de usuario
            const userModel = require('../user/user-model');
            
            // Check if user with this email already exists
            try {
                const existingUser = await userModel.getUserByEmail(userData.email);
                if (existingUser) {
                    throw new Error('Ya existe un usuario con este email. Por favor utilice otro email o inicie sesión.');
                }
            } catch (error) {
                // If error is not about existing user, rethrow it
                if (!error.message.includes('no encontrado')) {
                    throw error;
                }
                // Otherwise continue - user doesn't exist which is what we want
            }
            
            // Preparar datos del usuario
            const userToCreate = {
                name: userData.name,
                email: userData.email,
                passwordHash: userData.passwordHash, // Ya debe venir hasheado del servicio
                role: userData.role || 'Client'
            };
            
            // Crear el usuario
            const newUser = await userModel.saveUser(userToCreate);
            
            if (!newUser || !newUser.userId) {
                throw new Error('No se pudo crear el usuario');
            }
            
            // 2. Ahora creamos el cliente con el ID del usuario
            const clientToCreate = {
                userId: newUser.userId,
                contactInfo: clientData.contactInfo,
                address: clientData.address || null,
                additionalInfo: clientData.additionalInfo || null,
                plan: clientData.plan || 'Oro'
            };
            
            // Crear el cliente
            const newClient = await this.saveClient(clientToCreate);
            
            if (!newClient || !newClient.clientId) {
                // Si falla la creación del cliente, deberíamos eliminar el usuario
                // pero como no tenemos transacción, solo registramos el error
                console.error('Error al crear el cliente después de crear el usuario:', newUser.userId);
                throw new Error('No se pudo crear el cliente');
            }
            
            // Devolver los datos creados
            return {
                user: {
                    userId: newUser.userId,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role || 'Client'
                },
                client: {
                    clientId: newClient.clientId,
                    userId: newUser.userId,
                    contactInfo: clientData.contactInfo,
                    address: clientData.address,
                    additionalInfo: clientData.additionalInfo,
                    plan: clientData.plan || 'Oro'
                }
            };
        } catch (error) {
            console.error("Error creating user and client:", error);
            throw new Error('Error al crear usuario y cliente: ' + error.message);
        }
    };

    // Check if a client exists by ID
    module.exports.clientExists = async (clientId) => {
        try {
            // Validate clientId
            if (!clientId) {
                return false;
            }
            
            // Convert to number if it's a string
            const id = parseInt(clientId);
            
            if (isNaN(id)) {
                return false;
            }
            
            // Query to check if client exists
            const query = 'SELECT 1 FROM CLIENTS WHERE client_id = ? LIMIT 1';
            const result = await findQuery(query, [id], null);
            
            // If we got a result, the client exists
            return result && result.length > 0;
        } catch (error) {
            console.error("Error checking if client exists:", error);
            return false;
        }
    };
