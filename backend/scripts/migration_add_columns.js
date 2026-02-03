const pool = require('../config/database');

async function runMigration() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        console.log("Checking for missing columns in articles table...");

        const [existingColumns] = await connection.query("SHOW COLUMNS FROM articles");
        const existingColumnNames = existingColumns.map(col => col.Field);

        const requiredColumns = [
            { name: 'Provenance', type: 'VARCHAR(255) NULL' },
            { name: 'Libelle', type: 'VARCHAR(255) NULL' },
            // Add any others if needed, using the logic "ADD COLUMN IF NOT EXISTS"
        ];

        for (const col of requiredColumns) {
            if (!existingColumnNames.includes(col.name)) {
                console.log(`Adding missing column: ${col.name}`);
                await connection.query(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.type}`);
            } else {
                console.log(`Column ${col.name} already exists.`);
            }
        }

        await connection.commit();
        console.log("Migration completed successfully.");

    } catch (error) {
        await connection.rollback();
        console.error("Migration failed:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

runMigration();
