const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileService = require('./file-upload-service');
const { auth } = require('../../util/router-util');
const { findQuery } = require('../../core/model');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload file to project
router.post('/:projectId', auth, upload.single('file'), async (req, res) => {
    try {
        // Verificar si el proyecto existe
        const [project] = await findQuery(
            'SELECT project_id FROM PROJECTS WHERE project_id = ?',
            [req.params.projectId]
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const file = await fileService.uploadFile(req.file, req.params.projectId);
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            file
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// Get project files
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const files = await fileService.getProjectFiles(req.params.projectId);
        res.json({
            success: true,
            files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting files',
            error: error.message
        });
    }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
    try {
        await fileService.deleteFile(req.params.fileId);
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
});

// Añadir esta nueva ruta
router.get('/download/:fileId', auth, async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.fileId);
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        res.download(file.filePath, file.originalName);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: error.message
        });
    }
});
module.exports = router;