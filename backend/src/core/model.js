const mysql = require('serverless-mysql')({
  config: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  }
});

exports.type = {
    number: { entity: Number, db: Number },
    string: { entity: String, db: String },
    boolean: { entity: Boolean, db: Boolean },
    json: { entity: JSON.parse, db: JSON.stringify },
    enum: obj => ({ entity: obj, db: obj }),
    entity: entity => ({ entity: { entity }, db: { entity } }),
    date: { entity: Date, db: Date },
    array: { entity: Array, db: String },
    optional: {
        number: (value) => value === undefined || typeof value === 'number',
        date: (value) => value === undefined || value instanceof Date
      },
    transient: { entity: 'transient', db: 'transient' } // field will not be inserted in the database
    
}

//Format
exports.dbObjectToEntityObject = obj => obj ? Object.keys(obj).reduce((c, k) => (c[k.toLowerCase().replace(/(_)([^_]?)/g, (_, prep, letter) => (prep && '') + letter.toUpperCase())] = obj[k], c), {}) : null;

exports.entityObjectToDbObject = obj => obj ? Object.keys(obj).reduce((c, k) => (c[k.replace(/([A-Z0-9]+)/g, letter => '_' + letter).toUpperCase()] = obj[k], c), {}) : null;

//Map
exports.convertToEntityAttribute = (obj, entity, isRootEntity = true, parentObj = null) => {
    const convertToEntityAttributeF = obj => Object.keys(entity).forEach(k => {
        const fieldType = entity[k].entity
        let fieldValue = obj[k]
        if (fieldType !== undefined) {
            if (fieldValue !== undefined) {
                if (fieldType === Boolean) {
                    fieldValue = fieldValue !== null ? Boolean(fieldValue).valueOf() : null
                } else if (fieldType === Array) {
                    fieldValue = (typeof fieldValue === 'string' && fieldValue) ? fieldValue.split(',') : []
                } else if (fieldType === Number) {
                    const parseValue = parseInt(fieldValue)
                    fieldValue = isNaN(parseValue) ? null : parseValue
                } else if (fieldType === Date) {
                    const date = require('moment')(fieldValue)
                    fieldValue = date && date.isValid() ? date.toISOString() : null
                } else if (fieldType === JSON.parse) {
                    if (fieldValue) {
                        try {
                            fieldValue = JSON.parse(fieldValue)
                        } catch (e) {
                            fieldValue = null
                        }
                    }
                } else if (fieldType === String) {
                    fieldValue = fieldValue !== null ? String(fieldValue).valueOf() : null
                } else if (typeof fieldType === 'object' && fieldType.entity) {
                    if (fieldValue) {
                        try {
                            fieldValue = this.convertToEntityAttribute(isRootEntity ? JSON.parse(fieldValue) : fieldValue, fieldType.entity, false, obj)
                        } catch (e) {
                            fieldValue = null
                        }
                    }
                } else if (typeof fieldType === 'object') {
                    fieldValue = Object.keys(fieldType).find(key => fieldType[key] === fieldValue)
                }
            }
            if (typeof fieldType === 'function' && !fieldType.toString().includes('[native code]')) {
                try {
                    fieldValue = fieldType(obj, parentObj)
                } catch (e) {
                    fieldValue = null
                }
            } else if (typeof fieldType === 'string' && fieldType !== 'transient') {
                fieldValue = fieldType
            }
        }
        if (fieldValue !== undefined) {
            obj[k] = fieldValue
        }
    })
    if (Array.isArray(obj)) {
        obj.forEach(convertToEntityAttributeF)
    } else if (obj) {
        convertToEntityAttributeF(obj)
    }
    return obj
}

exports.convertToDBAttribute = (obj, entity, isRootEntity = true) => {
    obj = JSON.parse(JSON.stringify(obj));
    obj = this.strictObjectToEntity(obj, entity);
    const convertToEntityAttributeF = obj => Object.keys(entity).forEach(k => {
        const fieldType = entity[k].db
        let fieldValue = obj[k]
        if (fieldType !== undefined) {
            if (fieldValue !== undefined) {
                if (fieldType === Boolean) {
                    fieldValue = null !== fieldValue ? Boolean(fieldValue).valueOf() : null
                } else if (fieldType === Number) {
                    const parseValue = parseInt(fieldValue)
                    fieldValue = isNaN(parseValue) ? null : parseValue
                } else if (fieldType === Date) {
                    const date = require('moment')(fieldValue)
                    fieldValue = date && date.isValid() ? date.toISOString() : null
                } else if (fieldType === JSON.stringify) {
                    if (fieldValue) {
                        try {
                            fieldValue = JSON.stringify(fieldValue)
                        } catch (e) {
                            fieldValue = null
                        }
                    }
                } else if (fieldType === String) {
                    if (Array.isArray(fieldValue)) {
                        fieldValue = fieldValue.join()
                    }
                } else if (typeof fieldType === 'object' && fieldType.entity) {
                    if (fieldValue) {
                        try {
                            const entityResponse = this.convertToDBAttribute(fieldValue, fieldType.entity, false);
                            fieldValue = isRootEntity ? JSON.stringify(entityResponse) : entityResponse
                        } catch (e) {
                            fieldValue = null
                        }
                    }
                } else if (typeof fieldType === 'object') {
                    fieldValue = fieldType[fieldValue] ? fieldType[fieldValue] : fieldValue
                } else if (fieldType === 'transient') {
                    fieldValue = undefined
                    delete obj[k]
                } else if (typeof fieldType === 'string') {
                    fieldValue = fieldType
                }
            }
            if (typeof fieldType === 'function' && !fieldType.toString().includes('[native code]')) {
                fieldValue = fieldType(obj)
            }
        }
        // if entity is a function and db is not defined not insert the value in the database
        else if (entity[k].entity && typeof entity[k].entity === 'function' && !entity[k].entity.toString().includes('[native code]')) {
            fieldValue = undefined
            delete obj[k]
        }
        if (fieldValue !== undefined) {
            obj[k] = fieldValue
        }
    })
    if (Array.isArray(obj)) {
        obj.forEach(convertToEntityAttributeF)
    } else if (obj) {
        convertToEntityAttributeF(obj)
    }
    return obj
}

exports.strictObjectToEntity = (obj, entity) => {
    if (Array.isArray(obj)) {
        for (let index = 0; index < obj.length; index++) {
            obj[index] = this.strictObjectToEntity(obj[index], entity);
        }
    } else {
        const newObj = {};
        Object.keys(entity).forEach(k => {
            if (entity[k].entity && entity[k].entity.entity) {
                newObj[k] = this.strictObjectToEntity(obj[k], entity[k].entity.entity);
            } else {
                undefined !== obj[k] && (newObj[k] = obj[k]);
            }
        });
        return newObj;
    }
    return null;
}

exports.getQuery = async (query, params = [], entity = null) => {
    let result = this.dbObjectToEntityObject((await mysql.query(query, params))[0])
    if (entity !== null) {
        result = this.convertToEntityAttribute(result, entity)
    }
    await mysql.end()
    return result;
}

exports.findQuery = async (query, params = [], entity = null) => {
    const result = (await mysql.query(query, params)).map(r => entity !== null ? this.convertToEntityAttribute(this.dbObjectToEntityObject(r), entity) : this.dbObjectToEntityObject(r))
    await mysql.end()
    return result
}

exports.valueQuery = async (query, params = []) => {
    const result = await this.getQuery(query, params)
    return result !== null ? Object.values(result)[0] : null
}

exports.existsQuery = async (query, params = []) => {
    const result = await this.getQuery(query, params)
    return result !== null
}

exports.saveQuery = async (query, params = []) => {
    const result = await mysql.transaction()
        .query(query, params)
        .rollback(e => { console.error(e) })
        .commit()
    await mysql.end()
    return result
}

exports.insert = async (table, dataObj = null, entity = null) => {
    const dbDataObject = entity ? this.entityObjectToDbObject(this.convertToDBAttribute(dataObj, entity)) : this.entityObjectToDbObject(dataObj)

    if (!dbDataObject || Object.keys(dbDataObject).length === 0) {
        throw new Error('can not insert empty object')
    }
    const fieldNames = Object.keys(dbDataObject)
    const result = await mysql.transaction()
        .query(`INSERT INTO \`${table}\` (${fieldNames.map(fn => `\`${fn}\``).join()}) VALUES(${fieldNames.map(() => '?').join()})`, fieldNames.map(key => dbDataObject[key]))
        .rollback(e => { console.error(e) })
        .commit()
    await mysql.end()
    return result[0].insertId
}   
exports.inserts = async (table, dataObj = null, entity = null) => {
    // Convertir el objeto de datos al formato adecuado para la base de datos
    const dbDataObject = entity 
        ? this.entityObjectToDbObject(this.convertToDBAttribute(dataObj, entity)) 
        : this.entityObjectToDbObject(dataObj);

    // Validar que el objeto no esté vacío
    if (!dbDataObject || Object.keys(dbDataObject).length === 0) {
        throw new Error('No se puede insertar un objeto vacío.');
    }

    // Remover clientId del objeto, ya que es autoincremental
    delete dbDataObject.clientId;

    const fieldNames = Object.keys(dbDataObject);

    // Realizar la inserción en la base de datos
    const result = await mysql.transaction()
        .query(`INSERT INTO \`${table}\` (${fieldNames.map(fn => `\`${fn}\``).join(', ')}) VALUES(${fieldNames.map(() => '?').join(', ')})`, 
            fieldNames.map(key => dbDataObject[key]))
        .rollback(e => { console.error('Error en la transacción:', e); throw e; })
        .commit();

    await mysql.end();

    // Verificar si la inserción fue exitosa y devolver el insertId
    if (result && result.insertId) {
        return { insertId: result.insertId };
    } else {
        throw new Error('No se devolvió un insertId después de la inserción.');
    }
};

// Función save simplificada y robusta
exports.save = async (table, dataObj = null, whereObj = null, entity = null) => {
  try {
    console.log(`Iniciando save en tabla ${table}`);
    
    // Si no hay datos para guardar, lanzar error
    if (!dataObj || Object.keys(dataObj).length === 0) {
      throw new Error('No se puede insertar un objeto vacío');
    }
    
    // Convertir a formato de base de datos si es necesario
    const dbDataObject = entity ? 
      this.entityObjectToDbObject(this.convertToDBAttribute(dataObj, entity)) : 
      this.entityObjectToDbObject(dataObj);
    
    console.log(`Datos convertidos para inserción:`, dbDataObject);
    
    // Preparar la consulta de inserción
    const fieldNames = Object.keys(dbDataObject);
    const placeholders = fieldNames.map(() => '?').join(', ');
    const values = fieldNames.map(key => dbDataObject[key]);
    
    const insertQuery = `INSERT INTO \`${table}\` (${fieldNames.map(fn => `\`${fn}\``).join(', ')}) 
                        VALUES (${placeholders})`;
    
    console.log(`Query de inserción: ${insertQuery}`);
    console.log(`Valores: ${JSON.stringify(values)}`);
    
    // Ejecutar la inserción
    let result;
    try {
      result = await mysql.query(insertQuery, values);
      console.log(`Resultado de inserción:`, result);
    } catch (insertError) {
      console.error(`Error en la inserción:`, insertError);
      throw insertError;
    }
    
    // Verificar el resultado
    if (!result || !result.insertId) {
      console.error(`No se obtuvo insertId. Resultado:`, result);
      throw new Error('No se obtuvo un ID de inserción válido');
    }
    
    const insertId = result.insertId;
    console.log(`ID insertado: ${insertId}`);
    
    // Cerrar la conexión
    await mysql.end();
    
    // Devolver el ID insertado
    return { insertId };
  } catch (error) {
    console.error(`Error en save:`, error);
    // Asegurar que la conexión se cierre incluso en caso de error
    try {
      await mysql.end();
    } catch (endError) {
      console.error(`Error al cerrar la conexión:`, endError);
    }
    throw error;
  }
};
    
    exports.remove = async function(table, whereObj = null, entity = null) {
        const dbWhereObject = entity 
          ? exports.entityObjectToDbObject(exports.convertToDBAttribute(whereObj, entity))
          : exports.entityObjectToDbObject(whereObj);
        
        if (!dbWhereObject || Object.keys(dbWhereObject).length === 0) {
          throw new Error('can not delete empty object');
        }
        
        const whereNames = Object.keys(dbWhereObject);
        
        await mysql.transaction()
          .query(
            `DELETE FROM \`${table}\` WHERE ${whereNames.map(wn => `\`${wn}\`=?`).join(' AND ')}`,
            whereNames.map(wn => dbWhereObject[wn])
          )
          .commit();
        
        await mysql.end();
        return whereObj;
      };
      
// Función para actualizar un registro en la base de datos
exports.update = async (table, dataObj, whereObj, entity) => {
    try {
        // Convertir los objetos a formato de base de datos
        const dbDataObject = entity ? 
            this.entityObjectToDbObject(this.convertToDBAttribute(dataObj, entity)) : 
            this.entityObjectToDbObject(dataObj);

        const dbWhereObject = entity ? 
            this.entityObjectToDbObject(this.convertToDBAttribute(whereObj, entity)) : 
            this.entityObjectToDbObject(whereObj);

        // Verificar que los objetos no estén vacíos
        if (!dbDataObject || Object.keys(dbDataObject).length === 0) {
            throw new Error('No se puede actualizar un objeto vacío.');
        }
        if (!dbWhereObject || Object.keys(dbWhereObject).length === 0) {
            throw new Error('No se puede actualizar sin condiciones.');
        }

        // Construir la consulta SQL
        const setClause = Object.keys(dbDataObject).map(key => `\`${key}\` = ?`).join(', ');
        const whereClause = Object.keys(dbWhereObject).map(key => `\`${key}\` = ?`).join(' AND ');

        const query = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
        const values = [...Object.values(dbDataObject), ...Object.values(dbWhereObject)];

        console.log("Query de actualización:", query);
        console.log("Valores:", values);

        // Ejecutar la consulta
        const result = await mysql.query(query, values);

        // Verificar si la actualización fue exitosa
        if (result.affectedRows === 0) {
            throw new Error('No se actualizó ningún registro.');
        }

        return result;
    } catch (error) {
        console.error("Error en update:", error);
        throw error;
    }
};
