import express from 'express';

import { getTwitchUserData, getTwitchStreamsData } from '../twitch/twitchApi.js';

const router = express.Router();


router.get('/user', async (req, res) => {

    const userId = req.query.id;

    // userId existe y es un número
    if (!userId || !/^\d+$/.test(userId)) {
        return res.status(400).json({
            error: "Invalid or missing 'id' parameter."
        });
    }

    try{
        const twitchRes = await getTwitchUserData(userId);

        const user = twitchRes.data?.[0];
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.json(user);

    } catch (err) {
        if (err.response) {
            const { status, data } = err.response;

            if (status === 401) {
                return res.status(401).json({
                    error: "Unauthorized. Twitch access token is invalid or has expired."
                });
            }

            if (status === 400){
                return res.status(400).json({
                    error: "Invalid or missing 'id' parameter."
                });
            }

            return res.status(status).json({
                error: data?.error || "Twitch API error."
            });
        }

        return res.status(500).json({
            error: "Internal server error."
        });
    }


});

router.get('/streams', async(req, res) => {
    try {
        const twitchRes = await getTwitchStreamsData();

        const filteredData = twitchRes.data?.map(stream => ({
            title: stream.title,
            user_name: stream.user_name,
        })) || [];

        return res.json(filteredData);
    }
    catch (err) {
        if (err.response) {
            const { status, data } = err.response;
            
            if (status === 401) {
                return res.status(401).json({
                    error: "Unauthorized. Twitch access token is invalid or has expired."
                });
            }

            return res.status(status).json({
                error: data?.error || "Twitch API error."
            });
        }

        return res.status(500).json({
            error: "Internal server error."
        });
    }
})

export default router;