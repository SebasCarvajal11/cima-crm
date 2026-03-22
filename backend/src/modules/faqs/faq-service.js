// modules/faqs/faq-service.js
const { 
    createFaq,
    updateFaq,
    getFaqById,
    deleteFaq,
    listFaqs,
    getAllFaqs,
    searchFaqs
} = require('./faq-model');

module.exports.createFaq = async (faqData) => {
    try {
        return await createFaq(faqData);
    } catch (error) {
        throw new Error('Error creating FAQ: ' + error.message);
    }
};

module.exports.updateFaq = async (faqId, updatedData) => {
    try {
        return await updateFaq(faqId, updatedData);
    } catch (error) {
        throw new Error('Error updating FAQ: ' + error.message);
    }
};

module.exports.getFaqById = async (faqId) => {
    try {
        return await getFaqById(faqId);
    } catch (error) {
        throw error;
    }
};

module.exports.deleteFaq = async (faqId) => {
    try {
        return await deleteFaq(faqId);
    } catch (error) {
        throw new Error('Error deleting FAQ: ' + error.message);
    }
};

module.exports.listFaqs = async () => {
    try {
        return await listFaqs();
    } catch (error) {
        throw new Error('Error listing FAQs: ' + error.message);
    }
};

module.exports.getAllFaqs = async () => {
    try {
        return await getAllFaqs();
    } catch (error) {
        throw new Error('Error getting all FAQs: ' + error.message);
    }
};

module.exports.searchFaqs = async (searchTerm) => {
    try {
        return await searchFaqs(searchTerm);
    } catch (error) {
        throw new Error('Error searching FAQs: ' + error.message);
    }
};