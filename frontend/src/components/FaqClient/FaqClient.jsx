import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Box,
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const FaqClient = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/faqs/all`,
          {
            headers: { 'accesstoken': accessToken }
          }
        );
        setFaqs(response.data.faqs);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las preguntas frecuentes: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [accessToken]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
          }}
        >
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg,rgb(0, 0, 0) 30%,rgb(0, 0, 0) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Preguntas Frecuentes
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma
            </Typography>
            <Divider sx={{ mt: 3 }} />
          </Box>

          <Box sx={{ mt: 4 }}>
            {faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <motion.div
                  key={faq.faqId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Accordion 
                    expanded={expanded === `panel${faq.faqId}`} 
                    onChange={handleChange(`panel${faq.faqId}`)}
                    sx={{
                      mb: 2,
                      borderRadius: '8px',
                      '&:before': { display: 'none' },
                      boxShadow: expanded === `panel${faq.faqId}` ? 3 : 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 3,
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${faq.faqId}-content`}
                      id={`panel${faq.faqId}-header`}
                      sx={{
                        backgroundColor: expanded === `panel${faq.faqId}` ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                        borderRadius: '8px',
                        '&.Mui-expanded': {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <QuestionIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {faq.question}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 2, pb: 3, px: 4 }}>
                      <Typography variant="body1" paragraph>
                        {faq.answer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 2 }}>
                        Actualizado: {formatDate(faq.createdAt)}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">
                  No hay preguntas frecuentes disponibles en este momento.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default FaqClient;
