const fileModel = require('./file-upload-model');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

const ensureUploadDir = async () => {
    try {
        await fs.access(UPLOAD_DIR);
    } catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
};

exports.uploadFile = async (file, projectId) => {
    if (!file) {
        throw new Error('No file provided or invalid file');
    }

    await ensureUploadDir();
    
    // Ya no necesitamos escribir el archivo porque multer lo hace
    const fileInfo = await fileModel.saveFileInfo({
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        projectId
    });

    return fileInfo;
};

exports.getProjectFiles = async (projectId) => {
    return await fileModel.getFilesByProject(projectId);
};

exports.deleteFile = async (fileId) => {
    return await fileModel.deleteFile(fileId);
};

exports.getFileById = async (fileId) => {
    const [file] = await fileModel.findFileById(fileId);
    if (!file) throw new Error('File not found');
    return file;
};