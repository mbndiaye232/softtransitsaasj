require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');

async function checkSchema() {
    const connection = await pool.getConnection();

    try {
        console.log('🔍 Checking existing schema...\n');

        // Check if taxes table exists
        const [taxesTables] = await connection.query(`
            SHOW TABLES LIKE 'taxes'
        `);

        if (taxesTables.length > 0) {
            console.log('✓ taxes table exists');
            const [taxesSchema] = await connection.query(`DESCRIBE taxes`);
            console.log('\ntaxes table structure:');
            console.table(taxesSchema);
        } else {
            console.log('❌ taxes table does NOT exist');
        }

        // Check complementstaxes table
        const [compTables] = await connection.query(`
            SHOW TABLES LIKE 'complementstaxes'
        `);

        if (compTables.length > 0) {
            console.log('\n✓ complementstaxes table exists');
            const [compSchema] = await connection.query(`DESCRIBE complementstaxes`);
            console.log('\ncomplementstaxes table structure:');
            console.table(compSchema);

            // Check foreign keys
            const [fks] = await connection.query(`
                SELECT 
                    CONSTRAINT_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complementstaxes'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `, [process.env.DB_NAME]);

            console.log('\nForeign keys on complementstaxes:');
            console.table(fks);
        }

        // Check tarifs table
        const [tarifsTables] = await connection.query(`
            SHOW TABLES LIKE 'tarifs'
        `);

        if (tarifsTables.length > 0) {
            console.log('\n✓ tarifs table exists');
            const [tarifsSchema] = await connection.query(`DESCRIBE tarifs`);
            console.log('\ntarifs table structure:');
            console.table(tarifsSchema);
        } else {
            console.log('\n❌ tarifs table does NOT exist');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

checkSchema();
