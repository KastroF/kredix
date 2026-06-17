const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const DeviceToken = require("../models/DeviceToken");
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
    const errData = error.response?.data;
    console.error("❌ Erreur lors de l’envoi de la notification :", errData || error.message);

    // Supprimer le token invalide pour éviter de le réutiliser
    const errorCode = errData?.error?.details?.[0]?.errorCode || errData?.error?.status;
    if (errorCode === "UNREGISTERED" || errorCode === "INVALID_ARGUMENT") {
      await DeviceToken.deleteOne({ token }).catch(() => {});
      console.log("🗑️ Token FCM invalide supprimé :", token);
    }

    return { success: false, error: errData || error.message };
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
