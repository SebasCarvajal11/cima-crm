// module/user/user-model.js
const { getQuery, type, findQuery, update, save, remove } = require("../../core/model");

// Define la entidad en una variable sin usar `this`
const userEntity = {
  userId: type.number,
  name: type.string,
  email: type.string,
  password_hash: type.string,
  role: type.enum(['Admin', 'Client', 'Worker']),
  createdAt: type.date,
  updatedAt: type.date
};

exports.userEntity = userEntity;

// Obtener todos los usuarios
exports.getAllUsers = async () =>
  await findQuery("SELECT * FROM USERS", [], userEntity);

// Obtener un usuario por su ID
exports.getUserByUserId = async (userId) =>
  await getQuery('SELECT * FROM USERS WHERE user_id = ?', [userId], userEntity);

// Obtener un usuario por su email  
// NOTA: No se aplica conversión extra al campo role porque la BD ya devuelve el string
exports.getUserByEmail = async (email) =>
  await getQuery('SELECT * FROM USERS WHERE email = ?', [email], userEntity);

// función para eliminar un usuario por su ID**
exports.deleteUserById = async (userId) =>
  await remove("USERS", { userId: userId }, userEntity);

// Guardar un nuevo usuario
exports.saveUser = async (user) => {
  try {
    if (!user.email) {
      throw new Error("El email del usuario no puede estar vacío");
    }
    if (!user.passwordHash) {
      throw new Error("La contraseña del usuario no puede estar vacía");
    }

    // Verificar si el usuario ya existe
    const existingUser = await exports.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("Ya existe un usuario con este email");
    }

    // Preparar datos para inserción
    const dataObj = {
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      role: user.role
    };

    console.log("Datos que se guardan:", dataObj);

    // Insertar el usuario
    const result = await save('USERS', dataObj, null, userEntity);
    console.log("Resultado de la inserción:", result);
    
    if (!result || !result.insertId) {
      throw new Error("No se pudo obtener el ID del usuario insertado");
    }
    
    // Obtener el usuario recién insertado
    const insertedUser = await exports.getUserByUserId(result.insertId);
    if (!insertedUser) {
      throw new Error("No se pudo recuperar el usuario insertado");
    }
    
    return insertedUser;
  } catch (error) {
    console.error("Error en saveUser:", error);
    throw error;
  }
};

exports.updateUserById = async (userId, updatedUserData) => {
  const table = 'USERS';
  const whereObj = { userId: userId }; // <-- Clave corregida
  return await update(table, updatedUserData, whereObj, userEntity);
};
exports.getUsersByRoles = async (roles) => {
  try {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error("Se requiere un array de roles válido");
    }
    
    // Create placeholders for the SQL query
    const placeholders = roles.map(() => '?').join(', ');
    
    const query = `SELECT * FROM USERS WHERE role IN (${placeholders})`;
    console.log('Query for getUsersByRoles:', query);
    console.log('Roles to filter:', roles);
    
    const users = await findQuery(query, roles, userEntity);
    return users;
  } catch (error) {
    console.error("Error getting users by roles:", error);
    throw new Error('Error al obtener usuarios por roles: ' + error.message);
  }
};

// Get all admins
exports.getAllAdmins = async () => {
  try {
    return await findQuery("SELECT * FROM USERS WHERE role = 'Admin'", [], userEntity);
  } catch (error) {
    console.error("Error getting all admins:", error);
    throw new Error('Error al obtener administradores: ' + error.message);
  }
};

// Get all workers and admins
exports.getAllWorkersAndAdmins = async () => {
  try {
    return await this.getUsersByRoles(['Worker', 'Admin']);
  } catch (error) {
    console.error("Error getting workers and admins:", error);
    throw new Error('Error al obtener trabajadores y administradores: ' + error.message);
  }
};
// Get all workers
exports.getAllWorkers = async () => {
    try {
        const query = `
            SELECT 
                user_id,
                name,
                email,
                role,
                created_at,
                updated_at
            FROM USERS 
            WHERE role = 'Worker'
            ORDER BY name ASC`;
        
        return await findQuery(query, [], userEntity);
    } catch (error) {
        throw new Error('Error getting workers: ' + error.message);
    }
};
