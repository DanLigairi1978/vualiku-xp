import * as admin from 'firebase-admin';

async function run() {
    if (admin.apps.length === 0) {
        admin.initializeApp({
            projectId: 'vualiku-xp'
        });
    }

    const db = admin.firestore();
    console.log('Fetching operators...');
    const snapshot = await db.collection('operators').get();

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name || doc.id} [${doc.id}]: ${data.heroImageUrl || 'NONE'}`);
    });
}

run().catch(console.error);
