const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

const ucmUrl = 'https://192.168.0.90:8089/api';
const username = 'cdrapi';
const password = 'cdrapi123';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const authenticate = async () => {
  const challengeResponse = await axios.post(
    ucmUrl,
    {
      request: {
        action: 'challenge',
        user: username,
        version: '1.0',
      },
    },
    { httpsAgent }
  );

  const challenge = challengeResponse.data.response.challenge;
  const token = crypto.createHash('md5').update(challenge + password).digest('hex');

  const loginResponse = await axios.post(
    ucmUrl,
    {
      request: {
        action: 'login',
        user: username,
        token: token,
      },
    },
    { httpsAgent }
  );

  return loginResponse.data.response.cookie;
}

const handleUCM = async (req, res) => {
  const { action, extension, phoneNumber, callID, user_name } = req.body;

  try {
    const cookie = await authenticate();
    let response;

    switch (action) {
      case 'listAllChannels': {
        const bridgedChannels = await axios.post(
          ucmUrl,
          {
            request: { action: 'listBridgedChannels', cookie },
          },
          { httpsAgent }
        );

        const unBridgedChannels = await axios.post(
          ucmUrl,
          {
            request: { action: 'listUnBridgedChannels', cookie },
          },
          { httpsAgent }
        );

        const allChannels = [
          ...(bridgedChannels.data.response.channel || []),
          ...(unBridgedChannels.data.response.channel || []),
        ];

        return res.json({ allChannels });
      }

      case 'hangUpCall':
        response = await axios.post(
          ucmUrl,
          {
            request: { action: 'hangUpCall', cookie, callID },
          },
          { httpsAgent }
        );
        return res.json(response.data);

      case 'makeCall':
        response = await axios.post(
          ucmUrl,
          {
            request: {
              action: 'dialOutbound',
              cookie,
              caller: extension,
              outbound: phoneNumber,
            },
          },
          { httpsAgent }
        );
        return res.json(response.data);

      case 'listUser':
        response = await axios.post(
          ucmUrl,
          {
            request: {
              action: 'listUser',
              options: 'department,user_name,email',
              cookie,
            },
          },
          { httpsAgent }
        );
        return res.json(response.data);

      case 'getUser':
        if (!user_name) {
          return res.status(400).json({ error: 'Parameter user_name is required' });
        }
        response = await axios.post(
          ucmUrl,
          {
            request: {
              action: 'getUser',
              user_name,
              cookie,
            },
          },
          { httpsAgent }
        );
        return res.json(response.data);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error en la API:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { handleUCM };
