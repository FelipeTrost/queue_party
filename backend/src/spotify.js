const axios = require("axios");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const server_url = process.env.SERVER_URL;
const auth_string =
  "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64");

// returns access token, and refreshes tokens if needed
async function getToken(tokens) {
  const now = new Date();
  if (now < tokens.expires) return tokens.access_token;

  // need to refresh
  try {
    // We do this before, cause it's better to be safe than sorry
    const expires = new Date();

    const { data } = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      params: {
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      },
      headers: {
        Authorization: auth_string,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    expires.setSeconds(expires.getSeconds() + data.expires_in);

    tokens.access_token = data.access_token;
    tokens.expires = expires;

    return tokens.access_token;
  } catch (error) {
    console.log(error.response || error);
    return new Error("Couldn't refresh tokens, log in again");
  }
}

async function getIdentifier(token) {
  try {
    const { data } = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer  ${token}`,
      },
    });

    return data.display_name;
  } catch (err) {
    console.log(err.response || err);
    return null;
  }
}

async function codeToToken(code) {
  try {
    // We do this before, cause it's better to be safe than sorry
    const expires = new Date();

    const { data } = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      params: {
        grant_type: "authorization_code",
        redirect_uri: `${server_url}/spotify`,
        code,
      },
      headers: {
        Authorization: auth_string,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    expires.setSeconds(expires.getSeconds() + data.expires_in);

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires,
    };
  } catch (error) {
    console.log(error.response || error);
    return false;
  }
}

async function clientCredentials(callback) {
  let expires;
  try {
    const { data } = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      params: {
        grant_type: "client_credentials",
      },
      headers: {
        Authorization: auth_string,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, expires_in } = data;
    expires = expires_in;
    console.log("refresh got:", access_token);

    callback(access_token);
  } catch (error) {
    console.log(error.response || error);
  } finally {
    // call function again when the token expires
    setTimeout(() => clientCredentials(callback), expires * 1000);
  }
}

async function getTrack(token, track_id) {
  try {
    const { data } = await axios.get(
      `https://api.spotify.com/v1/tracks/${track_id.split(":")[2]}`,
      {
        headers: {
          Authorization: `Bearer  ${token}`,
        },
      }
    );

    return data;
  } catch (err) {
    console.log(err.response);
    throw new Error("Invalid token");
  }
}

async function pingToken(token) {
  try {
    await getTrack(token, "spotify:track:11dFghVXANMlKmJXsNCbNl");
    return true;
  } catch (error) {
    return false;
  }
}

async function putInQueue(token, track_id, device_id) {
  console.log("putting in queue");
  const deviceString = device_id ? `&device_id=${device_id}` : "";
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/me/player/queue?uri=${track_id}${deviceString}`,
      {},
      {
        headers: {
          Authorization: `Bearer  ${token}`,
        },
      }
    );

    return true;
  } catch (err) {
    console.log(err.response.data);
    throw new Error(err.response.data.error.message || "An error ocurred");
  }
}

async function getPlayingId(token) {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer  ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.data) return null;

    return response.data.item.id;
  } catch (err) {
    console.log(err.response.data);
    return null;
  }
}

module.exports = {
  getTrack,
  pingToken,
  putInQueue,
  clientCredentials,
  codeToToken,
  getIdentifier,
  getToken,
  getPlayingId,
};
