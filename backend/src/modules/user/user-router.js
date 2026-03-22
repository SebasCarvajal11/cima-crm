// module/user/user-router.js
    const express = require('express');
    const router = express.Router();
    const { 
    getAllUsers, 
    getUserByUserId, 
    saveUser, 
    getUserByEmail, 
    updateUserById,
    deleteUserById,
    getAllWorkers,
    getAllAdmins,
    getAllWorkersAndAdmins } = require('./user-service');
    const yup = require('yup');
    const { auth } = require('../../util/router-util');
    const bcrypt = require('bcryptjs');

    
    // Get all workers
    router.get('/workers', auth, async (req, res) => {
      try {
          const workers = await getAllWorkers();
          res.json({
              success: true,
              workers,
              count: workers.length
          });
      } catch (error) {
          console.error('Error getting workers:', error);
          res.status(500).json({
              success: false,
              message: 'Error getting workers',
              error: error.message
          });
      }
    });

    // Add this new endpoint to get all workers and admins - MOVED UP before /:id routes
    router.get('/staff', auth, async (req, res) => {
      try {
        const users = await getAllWorkersAndAdmins();
        res.json({
          success: true,
          users,
          count: users.length
        });
      } catch (error) {
        console.error('Error getting workers and admins:', error);
        res.status(500).json({
          success: false,
          message: 'Error al obtener trabajadores y administradores',
          error: error.message
        });
      }
    });
    
    // Add this endpoint to get all admins - MOVED UP before /:id routes
    router.get('/admins', auth, async (req, res) => {
      try {
        const admins = await getAllAdmins();
        res.json({
          success: true,
          admins,
          count: admins.length
        });
      } catch (error) {
        console.error('Error getting admins:', error);
        res.status(500).json({
          success: false,
          message: 'Error al obtener administradores',
          error: error.message
        });
      }
    });

    router.put('/:id', auth, async (req, res) => {
        try {
          const userId = req.params.id;
          const { name, email, password, role } = req.body;
      
          const updatedUserData = {};
          if (name) updatedUserData.name = name;
          if (email) updatedUserData.email = email;
          if (password) {
            updatedUserData.passwordHash = await bcrypt.hash(password, 10);
          }
          if (role) updatedUserData.role = role;
      
          const result = await updateUserById(userId, updatedUserData);
          if (result) {
            res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUserData });
          } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
          }
        } catch (error) {
          res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
        }
      });
    // Ruta para registrar un usuario
    router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Validación de datos de entrada
        yup.object({
        name: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().required(),
        role: yup.string().oneOf(['Admin', 'Client', 'Worker']).required()
        }).validateSync(req.body);

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = {
        name,
        email,
        passwordHash,
        role
        };
        console.log(newUser);
        
        const result = await saveUser(newUser);
        res.status(201).json({ message: 'Usuario registrado exitosamente', newUser: result });
    } catch (error) {
        res.status(400).json({ error: error.message, message: 'Error en el registro' });
    }
    });

    // Ruta de login
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {
        yup.object({
            email: yup.string().email().required(),
            password: yup.string().required()
        }).validateSync(req.body);
    
        const user = await getUserByEmail(email);
        console.log(user);
    
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
    
        // Convertir el valor numérico del rol a su correspondiente cadena
        const roleMapping = {
            "0": "Admin",
            "1": "Client",
            "2": "Worker"
        };
    
        // Si user.role es un número o una cadena que representa un número, se convierte.
        if (user.role !== undefined) {
            const roleVal = user.role.toString();
            user.role = roleMapping[roleVal] || user.role;
        }
    
        // Validar la contraseña (usamos user.passwordHash en lugar de user.password_hash)
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        const claims = { sub: user.userId, email: user.email, role: user.role };
        const jwt = require('njwt').create(claims, 'secret', 'HS256');
        jwt.setExpiration(new Date().getTime() + 294537600000); // Aproximadamente 1 año
        res.json({ accessToken: jwt.compact(), user });
        } catch (error) {
        res.status(401).json({ error: error.message, message: 'Error en la autenticación' });
        }
    });
    
    // **Nueva ruta para eliminar un usuario por ID**
    router.delete('/:id', auth, async (req, res) => {
        const userId = req.params.id;
        try {
          await deleteUserById(userId);
          res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
          res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
        }
    });
    
    // Ruta para obtener un usuario por su ID
    router.get('/:id', auth, async (req, res) => {
        try {
            const user = await getUserByUserId(req.params.id);
            
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }
    
            if (user.created_at) {
                user.created_at = new Date(user.created_at).toLocaleString();
            }
            if (user.updated_at) {
                user.updated_at = new Date(user.updated_at).toLocaleString();
            }
            
            res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    });

    // Ruta para obtener todos los usuarios
    router.get('/', auth, async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });
    module.exports = router;

    