import express from 'express';

import { getTwitchUserData, getTwitchStreamsData } from '../twitch/twitchApi.js';

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

router.get('/streams', async(req, res) => {
    try {
        const twitchRes = await getTwitchStreamsData();

        const filteredData = twitchRes.data?.map(stream => ({
            title: stream.title,
            user_name: stream.user_name,
        })) || [];


        res.json(filteredData);
    } 
    
    catch (error) {
        console.error("Error fetching streams data:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;