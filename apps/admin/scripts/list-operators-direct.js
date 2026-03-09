const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

async function run() {
    const envPath = path.resolve(__dirname, '../../tourist/.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const getEnvVar = (name) => {
        const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
        let val = match ? match[1].trim() : null;
        if (val && val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        }
        return val;
    };

    const projectId = getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || 'vualiku-xp';
    const clientEmail = getEnvVar('FIREBASE_ADMIN_CLIENT_EMAIL');
    const privateKey = getEnvVar('FIREBASE_ADMIN_PRIVATE_KEY');

    if (!clientEmail || !privateKey) {
        console.error('Missing credentials in .env.local');
        process.exit(1);
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n')
        })
    });

    const db = admin.firestore();
    const snapshot = await db.collection('operators').get();

    console.log('--- OPERATORS LIST ---');
    snapshot.forEach(doc => {
        const data = doc.data();
        const heroImageUrl = data.heroImageUrl || 'null';
        const isFirebase = heroImageUrl.startsWith('https://firebasestorage') || heroImageUrl.startsWith('https://storage.googleapis.com');
        console.log(`- ${data.name || doc.id} (${doc.id}): ${heroImageUrl} [Firebase: ${isFirebase}]`);
    });
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
