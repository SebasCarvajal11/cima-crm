const { getAllUsers, getUserByUserId, saveUser, getUserByEmail, updateUserById, deleteUserById } = require("./user-model");
const { getAllWorkers,getAllWorkersAndAdmins } = require("./user-model");

module.exports.getAllUsers = async () => await getAllUsers();

module.exports.getUserByUserId = async (userId) =>
    await getUserByUserId(userId);

module.exports.saveUser = async (user) => {
    try {
        return await saveUser(user);
    } catch (error) {
        throw new Error('Error al guardar el usuario: ' + error.message);
    }
};

module.exports.deleteUserById = async (userId) => {
    try {
        return await deleteUserById(userId);
    } catch (error) {
        throw new Error('Error al eliminar el usuario: ' + error.message);
    }
};

module.exports.updateUserById = async (userId, updatedUserData) => {
    try {
        return await updateUserById(userId, updatedUserData);
    } catch (error) {
        throw new Error('Error al actualizar el usuario: ' + error.message);
    }
};

module.exports.getUserByEmail = async (email) =>
    await getUserByEmail(email);

// Get all workers
module.exports.getAllWorkers = async () => {
    try {
        const workers = await getAllWorkers();
        
        // Map numeric roles to string representations
        return workers.map(worker => {
            // Create a new object with all the worker properties
            const mappedWorker = { ...worker };
            
            // Map role values if they're numeric or numeric strings
            if (worker.role !== undefined) {
                const roleMapping = {
                    "0": "Admin",
                    "1": "Client",
                    "2": "Worker"
                };
                
                // Convert role to string in case it's a number
                const roleVal = worker.role.toString();
                mappedWorker.role = roleMapping[roleVal] || worker.role;
            }
            
            return mappedWorker;
        });
    } catch (error) {
        throw new Error('Error getting workers: ' + error.message);
    }
};

// Get all admins
module.exports.getAllAdmins = async () => {
  try {
    const admins = await getAllAdmins();
    
    // Map numeric roles to string representations
    return admins.map(admin => {
        const mappedAdmin = { ...admin };
        
        if (admin.role !== undefined) {
            const roleMapping = {
                "0": "Admin",
                "1": "Client",
                "2": "Worker"
            };
            
            const roleVal = admin.role.toString();
            mappedAdmin.role = roleMapping[roleVal] || admin.role;
        }
        
        return mappedAdmin;
    });
  } catch (error) {
    throw new Error('Error al obtener administradores: ' + error.message);
  }
};

// Get all workers and admins
module.exports.getAllWorkersAndAdmins = async () => {
  try {
    const users = await getAllWorkersAndAdmins();
    
    // Map numeric roles to string representations
    return users.map(user => {
        const mappedUser = { ...user };
        
        if (user.role !== undefined) {
            const roleMapping = {
                "0": "Admin",
                "1": "Client",
                "2": "Worker"
            };
            
            const roleVal = user.role.toString();
            mappedUser.role = roleMapping[roleVal] || user.role;
        }
        
        return mappedUser;
    });
  } catch (error) {
    throw new Error('Error al obtener trabajadores y administradores: ' + error.message);
  }
};
  
