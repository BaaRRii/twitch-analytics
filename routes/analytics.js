import express from 'express';

import { getTwitchUserData } from '../twitch/twitchApi.js';

const router = express.Router();

router.get('/user', async (req, res) => {
    const userId = req.query.id;

    if (!userId) {
        return res.status(400).json({ 
            error: "Invalid or missing 'id' parameter" 
        });
    }

    try {
        const twitchRes = await getTwitchUserData(userId);
        res.json(twitchRes.data);
    } 
    
    catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/streams', (req, res) => {
    res.json({ message: 'Streams analytics endpoint' });
});

export default router;