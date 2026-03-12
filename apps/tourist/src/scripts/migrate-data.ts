import 'dotenv/config';
import { adminDb } from '@danligairi1978/shared/server';
import { tourCompanies, masterEvents } from '@danligairi1978/shared';

async function migrate() {
    console.log('--- Vualiku XP Data Migration ---');

    try {
        // Migrate Operators
        console.log('\nMigrating Operators...');
        const operatorsCol = adminDb.collection('operators');
        for (const operator of tourCompanies) {
            await operatorsCol.doc(operator.id).set({
                ...operator,
                updatedAt: new Date(),
            }, { merge: true });
            console.log(`✅ ${operator.name}`);
        }

        // Migrate Activities
        console.log('\nMigrating Activities...');
        const activitiesCol = adminDb.collection('activities');
        for (const activity of masterEvents) {
            await activitiesCol.doc(activity.id).set({
                ...activity,
                updatedAt: new Date(),
            }, { merge: true });
            console.log(`✅ ${activity.name}`);
        }

        console.log('\n✨ Migration successfully completed!');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Migration failed:');
        console.error(error.message);
        if (error.stack) console.error(error.stack);

        // Also write to a log file for debugging
        const fs = require('fs');
        fs.writeFileSync('migration-error.log', `${error.message}\n${error.stack}`);

        process.exit(1);
    }
}

migrate();
