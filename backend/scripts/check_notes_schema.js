const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkNotesSchema() {
    console.log('Checking Note de Detail tables...');

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

    console.log(`Connecting to ${config.database} at ${config.host}...`);

    let pool;
    try {
        pool = mysql.createPool(config);

        const tables = [
            'notesdedetails',
            'articles',
            'taxes',
            'taxes_complements',
            'liquidations_articles'
        ];

        for (const table of tables) {
            try {
                const [desc] = await pool.query(`DESCRIBE ${table}`);
                console.log(`\n--- ${table} ---`);
                // Print a simplified version
                desc.forEach(col => {
                    console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : ''}`);
                });
            } catch (err) {
                console.error(`\nxxx Error describing ${table}: ${err.message}`);
            }
        }

    } catch (error) {
        console.error('Connection failed:', error.message);
    } finally {
        if (pool) await pool.end();
    }
}

checkNotesSchema();
