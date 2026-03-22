const { save, findQuery, remove, type } = require('../../core/model');
const path = require('path');
const fs = require('fs').promises;

exports.fileEntity = {
    fileId: type.number,
    fileName: type.string,
    originalName: type.string,
    filePath: type.string,
    fileSize: type.number,
    mimeType: type.string,
    projectId: type.number,
    uploadedAt: type.date
};

exports.saveFileInfo = async (fileData) => {
    try {
        const result = await save('FILES', {
            ...fileData,
            uploadedAt: new Date()
        }, null, exports.fileEntity);
        return result;
    } catch (error) {
        throw new Error('Error saving file information: ' + error.message);
    }
};

exports.getFilesByProject = async (projectId) => {
    try {
        const query = `
            SELECT * FROM FILES 
            WHERE project_id = ? 
            ORDER BY uploaded_at DESC
        `;
        const files = await findQuery(query, [projectId], exports.fileEntity);
        return files || [];
    } catch (error) {
        throw new Error('Error getting project files: ' + error.message);
    }
};

exports.deleteFile = async (fileId) => {
    try {
        const [file] = await findQuery('SELECT * FROM FILES WHERE file_id = ?', [fileId], exports.fileEntity);
        if (!file) throw new Error('File not found');

        // Delete physical file
        await fs.unlink(file.filePath);
        
        // Delete database record
        await remove('FILES', { fileId }, exports.fileEntity);
        return true;
    } catch (error) {
        throw new Error('Error deleting file: ' + error.message);
    }
};

exports.findFileById = async (fileId) => {
    try {
        const query = 'SELECT * FROM FILES WHERE file_id = ?';
        const files = await findQuery(query, [fileId], exports.fileEntity);
        return files || [];
    } catch (error) {
        throw new Error('Error finding file: ' + error.message);
    }
};