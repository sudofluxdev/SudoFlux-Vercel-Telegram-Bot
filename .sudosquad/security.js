const admin = require('firebase-admin');
const { machineIdSync } = require('node-machine-id');
const chalk = require('chalk');

// IMPORTANT: In a production CLI, you would NOT bundle the service account JSON.
// You would either use a custom backend API or a limited-scope Firebase key.
// For this Elite Ops setup, we assume the Operator has the Admin SDK initialized.

async function validateAccess() {
    const hwid = machineIdSync();
    console.log(chalk.cyan(`[SudoSquad] Analyzing System Signature...`));
    console.log(chalk.dim(`Fingerprint: ${hwid}`));

    try {
        // 1. Check ALL operatives to see if this HWID is registered in any session
        const db = admin.firestore();

        // This is a specialized query: Find ANY session across all users that matches this HWID
        const sessionsQuery = await db.collectionGroup('sessions')
            .where('hwid', '==', hwid)
            .limit(1)
            .get();

        if (sessionsQuery.empty) {
            console.log(chalk.red.bold("\n[!] ACCESS DENIED: UNAUTHORIZED HARDWARE"));
            console.log(chalk.yellow("Your system is not registered in SudoSquad Studio."));
            console.log(chalk.white("Please login via the Launcher and authorize this machine."));
            process.exit(1);
        }

        const sessionDoc = sessionsQuery.docs[0];
        const operativeEmail = sessionDoc.ref.parent.parent.id;

        // 2. Verify if the Operative still has an 'active' license
        const operativeSnap = await db.collection('operatives').doc(operativeEmail).get();

        if (!operativeSnap.exists || operativeSnap.data().status !== 'active') {
            console.log(chalk.red.bold("\n[!] ACCESS DENIED: LICENSE EXPIRED OR REVOKED"));
            console.log(chalk.yellow(`Operative ${operativeEmail} no longer has active clearance.`));
            process.exit(1);
        }

        console.log(chalk.green.bold(`\n[✓] ACCESS GRANTED: Welcome back, Operative ${operativeEmail}`));
        return true;

    } catch (error) {
        console.log(chalk.red(`\n[!] GHOST_PROTOCOL_ERROR: Connection to Hive Mind failed.`));
        console.log(chalk.dim(error.message));
        process.exit(1);
    }
}

module.exports = { validateAccess };
