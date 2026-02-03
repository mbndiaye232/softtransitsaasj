require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkAllSchemas() {
    const connection = await pool.getConnection();

    try {
        console.log('🔍 Checking all related table schemas...\n');

        // Check taux table
        const [tauxSchema] = await connection.query(`DESCRIBE taux`);
        console.log('taux table structure:');
        console.table(tauxSchema);

        // Check produits table
        const [produitsSchema] = await connection.query(`DESCRIBE produits`);
        console.log('\nproduits table structure:');
        console.table(produitsSchema);

        // Check taxes table if exists
        const [taxesTables] = await connection.query(`SHOW TABLES LIKE 'taxes'`);
        if (taxesTables.length > 0) {
            const [taxesSchema] = await connection.query(`DESCRIBE taxes`);
            console.log('\ntaxes table structure:');
            console.table(taxesSchema);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

checkAllSchemas();
