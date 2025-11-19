import axios from 'axios';
import { getTwitchToken } from './twitchAuth.js';

async function twitchRequest(endpoint, params = {}, retry = true) {
    const token = await getTwitchToken();

    try {
        const res = await axios.get(
            `https://api.twitch.tv/helix/${endpoint}`,
            {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Client-ID': process.env.TWITCH_CLIENT_ID
                }
            }
        );

        return res.data;
    }
    catch (err) {

        if (err.response?.status === 401 && retry) {
            console.log("Twitch token expired or invalid. Fetching new token...");
            await getTwitchToken(true); 
            return twitchRequest(endpoint, params, false);
        }


        if (err.response){
            throw err;
        }

        const e = new Error("Internal server error");
        e.status = 500;
        throw e;
    }
}

export function getTwitchUserData(user_id) {
    return twitchRequest('users', { id: user_id });
}

export function getTwitchStreamsData() {
    return twitchRequest('streams');
}
