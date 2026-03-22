const express = require('express');
const router = express.Router();
const { getClientById, saveClient, updateClientById, deleteClientById, getAllClients, createUserAndClient } = require('./client-service');
const yup = require('yup');
const { auth } = require('../../util/router-util');

// Get all clients
router.get('/', auth, async (req, res) => {
    try {
        console.log('Starting getAllClients request');
        const clients = await getAllClients();
        
        // Add more detailed logging to see what's happening
        console.log('Raw clients from service:', clients);
        console.log('Clients from service (stringified):', JSON.stringify(clients, null, 2));
        
        // Log the first client in detail if available
        if (clients && clients.length > 0) {
            console.log('First client details:');
            console.log('- clientId:', clients[0].clientId);
            console.log('- userId:', clients[0].userId);
            console.log('- name:', clients[0].name);
            console.log('- email:', clients[0].email);
            console.log('- contactInfo:', clients[0].contactInfo);
            console.log('- address:', clients[0].address);
            console.log('- additionalInfo:', clients[0].additionalInfo);
            console.log('- plan:', clients[0].plan);
            console.log('- createdAt:', clients[0].createdAt);
            console.log('- updatedAt:', clients[0].updatedAt);
            console.log('- role:', clients[0].role);
            
            // Return all client data without any filtering
            res.status(200).json({
                success: true,
                count: clients.length,
                clients: clients.map(client => ({
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
                }))
            });
        } else {
            console.log('No clients found');
            res.status(200).json({
                success: true,
                count: 0,
                clients: []
            });
        }
    } catch (error) {
        console.error('Error getting all clients:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener todos los clientes',
            error: error.message
        });
    }
});

// Crear un nuevo cliente
router.post('/', auth, async (req, res) => {
    try {
        const { userId, contactInfo, address, additionalInfo, plan } = req.body;

        // Llamar al servicio para guardar el cliente
        const newClient = await saveClient({ userId, contactInfo, address, additionalInfo, plan });

        // Enviar la respuesta con el cliente y el clientId
        res.status(201).json({ message: 'Cliente creado exitosamente', client: newClient });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
    }
});


// Actualizar un cliente por ID
router.put('/:id', auth, async (req, res) => {
    try {
        const clientId = req.params.id;

        // Validación de los datos de entrada
        const schema = yup.object().shape({
            userId: yup.number().nullable(),
            contactInfo: yup.string().nullable(),
            address: yup.string().nullable(),
            additionalInfo: yup.string().nullable(),
            plan: yup.string().oneOf(['Oro', 'Esmeralda', 'Premium']).nullable(),
        });

        await schema.validate(req.body);

        const { userId, contactInfo, address, additionalInfo, plan } = req.body;

        // Verificar si hay datos para actualizar
        const updatedClientData = {};
        if (userId) updatedClientData.userId = userId;
        if (contactInfo) updatedClientData.contactInfo = contactInfo;
        if (address) updatedClientData.address = address;
        if (additionalInfo) updatedClientData.additionalInfo = additionalInfo;
        if (plan) updatedClientData.plan = plan;

        // Llamar al servicio para actualizar el cliente
        const updatedClient = await updateClientById(clientId, updatedClientData);

        if (!updatedClient) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json({ message: 'Cliente actualizado exitosamente', client: updatedClient });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
    }
});

// Obtener un cliente por ID
router.get('/:id', auth, async (req, res) => {
    try {
        const clientId = req.params.id;

        // Llamar al servicio para obtener el cliente
        const client = await getClientById(clientId);

        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el cliente', error: error.message });
    }
});

// Eliminar un cliente por ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const clientId = req.params.id;
        
        // Validate that clientId is a number and not empty
        if (!clientId || isNaN(parseInt(clientId))) {
            return res.status(400).json({ 
                success: false,
                message: 'ID de cliente inválido' 
            });
        }
        
        // First check if the client exists
        const client = await getClientById(clientId);
        
        if (!client) {
            return res.status(404).json({ 
                success: false,
                message: 'Cliente no encontrado' 
            });
        }
        
        // Proceed with deletion if client exists
        const result = await deleteClientById(clientId);
        
        res.status(200).json({ 
            success: true,
            message: 'Cliente eliminado exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al eliminar el cliente', 
            error: error.message 
        });
    }
});

// Create user and client in a single transaction
router.post('/register', async (req, res) => {
    try {
        // Validación de datos simplificada
        const schema = yup.object().shape({
            name: yup.string().required('El nombre es requerido'),
            email: yup.string().email('Email inválido').required('El email es requerido'),
            password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
            contactInfo: yup.string().required('La información de contacto es requerida'),
            address: yup.string().nullable(),
            additionalInfo: yup.string().nullable(),
            plan: yup.string().oneOf(['Oro', 'Esmeralda', 'Premium']).default('Oro')
        });

        await schema.validate(req.body);

        const { name, email, password, contactInfo, address, additionalInfo, plan } = req.body;
        
        // Crear objeto de usuario a partir de los datos del cliente
        const user = {
            name,
            email,
            password,
            role: 'Client'
        };
        
        // Crear objeto de cliente
        const client = {
            contactInfo,
            address,
            additionalInfo,
            plan
        };
        
        // Crear usuario y cliente
        const result = await createUserAndClient(user, client);
        
        res.status(201).json({
            success: true,
            message: 'Usuario y cliente creados exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error al crear usuario y cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario y cliente',
            error: error.message
        });
    }
});

module.exports = router;
