const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
require('dotenv').config();

const SERVICE_ACCOUNT_KEY_FILE = "./my-service-account.json"; // adapte le chemin si besoin
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASEPROJECTID}/messages:send`;

// Fonction principale à exporter
async function sendNotification({ token, title, body, badge = 1, data = {} }) {
  try {
    const accessToken = await getAccessToken();

    const messagePayload = {
      message: {
        token,
        notification: {
          title,
          body,
        },
        data,
        android: {
          notification: {
            title,
            body,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              badge,
            },
          },
        },
      },
    };

    const response = await axios.post(FCM_ENDPOINT, messagePayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Notification envoyée :", response.data);
    return { success: true, response: response.data };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l’envoi de la notification :",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
}

// Fonction pour obtenir un jeton d’accès OAuth
async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

module.exports = sendNotification;
