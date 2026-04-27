const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        // Na Vercel: configure a env var FIREBASE_SERVICE_ACCOUNT com o JSON do service account
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase initialized via environment variable.');
    } catch (error) {
        console.error('Error initializing Firebase:', error.message);
    }
}

const db = admin.firestore();

module.exports = { db };
