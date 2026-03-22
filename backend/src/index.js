// index.js

const serverless = require('serverless-http');
const express = require('express');
const app = express();
const userRouter = require('./modules/user/user-router');
const clientRouter= require('./modules/client/client-router')
const projectRouter=require('./modules/project/project-router')
const taskRouter = require('./modules/task/task-router');
const faqRouter = require('./modules/faqs/faq-router');
const fileRouter = require('./modules/file-upload/file-upload-router'); // Updated path

app.use(express.json());

app.use('/users', userRouter);
app.use('/clients', clientRouter);
app.use('/projects', projectRouter)
app.use('/tasks', taskRouter)
app.use('/faqs', faqRouter);
app.use('/files', fileRouter);
app.use((req, res, next) => {
    return res.status(404).json({
        error: 'Not Found'
    });
});

module.exports.handler = serverless(app);