const pool = require('./config/database');

async function checkDb() {
    try {
        const [structures] = await pool.query('SELECT IDSociete, NomSociete, Emailstructur FROM structur');
        console.log('Structures:');
        console.table(structures);

        const [agents] = await pool.query('SELECT IDAgents, NomAgent, role, structur_id FROM Agents');
        console.log('Agents:');
        console.table(agents);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkDb();
