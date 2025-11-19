import axios from 'axios';
import { getTwitchToken } from './twitchAuth.js';

export async function getTwitchUserData(user_id) {

    const token = await getTwitchToken();
    
    try {
        const res = await axios.get(
            `https://api.twitch.tv/helix/users?id=${user_id}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Client-ID': process.env.TWITCH_CLIENT_ID
                }
            }
        );

        return res.data;
    }
    catch (err) {
        if (err.response) {
            throw err;
        }

        const e = new Error("Internal server error");
        e.status = 500;
        throw e;
    }
}