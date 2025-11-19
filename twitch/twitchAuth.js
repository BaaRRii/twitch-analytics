import axios from 'axios';

let accessToken = null;
let expiresAt = null;

export async function getTwitchToken() {
    const now = Date.now();

    // si token existe y no ha expirado
    if (accessToken && now < expiresAt){
        return accessToken;
    }

    try {
        const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
    
        // cachear token
        accessToken = res.data.access_token;
        expiresAt = now + res.data.expires_in * 1000;

        console.log("access token:", accessToken, expiresAt);

        return accessToken;
    }
    catch(err) {
        console.error("Error fetching Twitch access token:", err.message);
        return null;
    }
}