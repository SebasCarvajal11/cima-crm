// modules/faqs/faq-model.js
const { getQuery, update, remove, insert, type, findQuery } = require('../../core/model');

exports.faqEntity = {
    faqId: type.number,
    question: type.string,
    answer: type.string,
    createdAt: type.date
};

module.exports.createFaq = async (faq) => {
    if (!faq.question) {
        throw new Error("Question cannot be empty");
    }
    if (!faq.answer) {
        throw new Error("Answer cannot be empty");
    }
    
    const dataObj = {
        question: faq.question,
        answer: faq.answer
    };
    
    try {
        const insertId = await insert('FAQS', dataObj, this.faqEntity);
        return { ...dataObj, faqId: insertId };
    } catch (error) {
        throw new Error('Error creating FAQ: ' + error.message);
    }
};

module.exports.updateFaq = async (faqId, updatedData) => {
    try {
        if (!faqId) {
            throw new Error('FAQ ID is required for update');
        }
        if (!updatedData || Object.keys(updatedData).length === 0) {
            throw new Error('No data provided for update');
        }
        
        // Verify FAQ exists before attempting update
        const existingFaq = await this.getFaqById(faqId).catch(() => null);
        if (!existingFaq) {
            throw new Error('FAQ with the specified ID does not exist');
        }
        
        const faqIdNum = Number(faqId);
        
        // Build the SET clause dynamically
        const setClauses = [];
        const params = [];
        
        if (updatedData.question) {
            setClauses.push('question = ?');
            params.push(updatedData.question);
        }
        
        if (updatedData.answer) {
            setClauses.push('answer = ?');
            params.push(updatedData.answer);
        }
        
        // Only proceed if there are fields to update
        if (setClauses.length === 0) {
            throw new Error('No valid fields provided for update');
        }
        
        const query = `
            UPDATE FAQS 
            SET ${setClauses.join(', ')} 
            WHERE faq_id = ?
        `;
        
        params.push(faqIdNum);
        
        // Execute the update query
        await getQuery(query, params);
        
        // Return the updated FAQ
        return await this.getFaqById(faqIdNum);
    } catch (error) {
        console.error('Error in updateFaq:', error);
        throw new Error('Error updating FAQ: ' + error.message);
    }
};

module.exports.getFaqById = async (faqId) => {
    try {
        const faq = await getQuery('SELECT * FROM FAQS WHERE faq_id = ?', [faqId], this.faqEntity);
        if (!faq) {
            throw new Error('FAQ not found');
        }
        return faq;
    } catch (error) {
        if (error.message === 'FAQ not found') {
            throw error;
        }
        throw new Error('Error retrieving FAQ from database');
    }
};

module.exports.deleteFaq = async (faqId) => {
    try {
        if (!faqId) {
            throw new Error('FAQ ID is required for deletion');
        }
        
        const faqIdNum = Number(faqId);
        
        // First check if the FAQ exists without throwing an error
        const faqExists = await getQuery('SELECT faq_id FROM FAQS WHERE faq_id = ?', [faqIdNum])
            .catch(() => null);
        
        // If no FAQ found, return a success message
        if (!faqExists) {
            return { 
                success: true, 
                message: 'No action needed - FAQ does not exist or was already deleted' 
            };
        }
        
        // FAQ exists, proceed with deletion using a direct SQL query
        const deleteQuery = 'DELETE FROM FAQS WHERE faq_id = ?';
        await getQuery(deleteQuery, [faqIdNum]);
        
        return { success: true, message: 'FAQ deleted successfully' };
    } catch (error) {
        console.error('Error in deleteFaq:', error);
        throw new Error('Error deleting FAQ: ' + error.message);
    }
};

module.exports.listFaqs = async () => {
    try {
        const query = 'SELECT * FROM FAQS ORDER BY created_at DESC';
        const faqs = await findQuery(query, [], this.faqEntity);
        return faqs || [];
    } catch (error) {
        console.error('Error in listFaqs:', error);
        throw new Error('Error listing FAQs: ' + error.message);
    }
};

module.exports.getAllFaqs = async () => {
    try {
        const query = 'SELECT * FROM FAQS ORDER BY created_at DESC';
        const faqs = await findQuery(query, [], this.faqEntity);
        return faqs || [];
    } catch (error) {
        throw new Error('Error getting all FAQs: ' + error.message);
    }
};

module.exports.searchFaqs = async (searchTerm) => {
    try {
        if (!searchTerm) {
            throw new Error('Search term is required');
        }
        
        const query = `
            SELECT * FROM FAQS 
            WHERE question LIKE ? OR answer LIKE ? 
            ORDER BY created_at DESC
        `;
        const searchPattern = `%${searchTerm}%`;
        const faqs = await findQuery(query, [searchPattern, searchPattern], this.faqEntity);
        return faqs || [];
    } catch (error) {
        throw new Error('Error searching FAQs: ' + error.message);
    }
};