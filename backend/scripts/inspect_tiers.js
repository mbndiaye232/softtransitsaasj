const pool = require('../config/database');

async function inspectSchema() {
    try {
        console.log('Connecting...');
        const [tiers] = await pool.query('DESCRIBE tiers');
        console.log('--- TIERS TABLE ---');
        console.table(tiers);

        const [types] = await pool.query('DESCRIBE typetiers');
        console.log('--- TYPETIERS TABLE ---');
        console.table(types);

        const [statuts] = await pool.query('DESCRIBE statuts');
        console.log('--- STATUTS TABLE ---');
        console.table(statuts);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

inspectSchema();
