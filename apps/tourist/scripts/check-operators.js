const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vualiku-xp';
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (admin.apps.length === 0) {
    if (clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n')
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
