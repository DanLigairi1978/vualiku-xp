import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to find .env.local in tourist app as it seems to have the full credentials
const envPath = path.resolve(__dirname, '../../tourist/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const projectId = getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 'vualiku-xp';
const clientEmail = getEnvVar('FIREBASE_ADMIN_CLIENT_EMAIL');
let privateKey = getEnvVar('FIREBASE_ADMIN_PRIVATE_KEY');

if (privateKey) {
    // Handle quotes if any
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
}

if (admin.apps.length === 0) {
    if (clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey
            })
        });
    } else {
        admin.initializeApp({
            projectId
        });
    }
}

const db = admin.firestore();

async function listOperators() {
    console.log('--- OPERATOR IMAGE AUDIT ---');
    const snapshot = await db.collection('operators').get();

    if (snapshot.empty) {
        console.log('No operators found.');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        const heroImageUrl = data.heroImageUrl || 'MISSING';
        const isFirebase = heroImageUrl.startsWith('https://firebasestorage') || heroImageUrl.startsWith('https://storage.googleapis.com');

        console.log(`Operator: ${data.name || doc.id}`);
        console.log(`- ID: ${doc.id}`);
        console.log(`- heroImageUrl: ${heroImageUrl}`);
        console.log(`- Is Firebase Storage: ${isFirebase}`);
        console.log('---');
    });
}

listOperators().catch(err => {
    console.error('Error listing operators:', err);
    process.exit(1);
});
