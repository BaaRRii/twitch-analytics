import express from 'express';
import dotenv from 'dotenv';

import analyticsRouter from './routes/analytics.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'healthy' });
});

app.use('/analytics', analyticsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port:${PORT}`));
