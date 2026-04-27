const admin = require('firebase-admin');
const path = require('path');

// Assuming the service account file is in the root directory
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase initialized successfully.');
} catch (error) {
    console.error('Error initializing Firebase:', error.message);
    console.log('Falling back to default credentials or environment variables.');
    // Fallback for environments where service account is provided via env
    if (!admin.apps.length) {
        admin.initializeApp();
    }
}

const db = admin.firestore();

module.exports = { db };
