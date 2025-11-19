import express from 'express';
import dotenv from 'dotenv';

import analyticsRouter from './routes/analytics.js';

dotenv.config();

const app = express();
app.use(express.json());

// logger middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
})

app.get('/', (req, res) => {
    res.json({ message: 'healthy' });
});

app.use('/analytics', analyticsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port:${PORT}`));
