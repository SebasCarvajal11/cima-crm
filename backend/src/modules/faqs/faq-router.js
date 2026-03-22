// modules/faqs/faq-router.js
const express = require('express');
const router = express.Router();
const { 
    createFaq,
    updateFaq,
    getFaqById,
    deleteFaq,
    listFaqs,
    getAllFaqs,
    searchFaqs
} = require('./faq-service');

const { auth } = require('../../util/router-util');
const yup = require('yup');

// Endpoint para crear una nueva FAQ
router.post('/', auth, async (req, res) => {
    try {
        const schema = yup.object().shape({
            question: yup.string().required('Question is required'),
            answer: yup.string().required('Answer is required')
        });
        
        await schema.validate(req.body);
        const newFaq = await createFaq(req.body);
        
        res.status(201).json({
            success: true,
            message: 'FAQ created successfully',
            faq: newFaq
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating FAQ',
            error: error.message
        });
    }
});

// Endpoint para obtener todas las FAQs
router.get('/all', async (req, res) => {
    try {
        const faqs = await getAllFaqs();
        
        res.status(200).json({
            success: true,
            count: faqs.length,
            faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting all FAQs',
            error: error.message
        });
    }
});

// Endpoint para buscar FAQs
router.get('/search/:term', async (req, res) => {
    try {
        const searchTerm = req.params.term;
        const faqs = await searchFaqs(searchTerm);
        
        res.status(200).json({
            success: true,
            count: faqs.length,
            faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching FAQs',
            error: error.message
        });
    }
});

// Endpoint para actualizar una FAQ
router.put('/:id', auth, async (req, res) => {
    try {
        const faqId = req.params.id;
        const schema = yup.object().shape({
            question: yup.string(),
            answer: yup.string()
        });
        
        await schema.validate(req.body);
        const updatedFaq = await updateFaq(faqId, req.body);
        
        res.status(200).json({
            success: true,
            message: 'FAQ updated successfully',
            faq: updatedFaq
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating FAQ',
            error: error.message
        });
    }
});

// Endpoint para obtener una FAQ por su ID
router.get('/:id', async (req, res) => {
    try {
        const faq = await getFaqById(req.params.id);
        
        res.status(200).json({
            success: true,
            faq
        });
    } catch (error) {
        if (error.message === 'FAQ not found') {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found',
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching FAQ',
            error: error.message
        });
    }
});

// Endpoint para eliminar una FAQ
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await deleteFaq(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting FAQ',
            error: error.message
        });
    }
});

// Endpoint para listar todas las FAQs
router.get('/', async (req, res) => {
    try {
        const faqs = await listFaqs();
        
        res.status(200).json({
            success: true,
            count: faqs.length,
            faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error listing FAQs',
            error: error.message
        });
    }
});

module.exports = router;