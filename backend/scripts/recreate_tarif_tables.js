require('dotenv').config({ path: './backend/.env' });
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function recreateTables() {
    const connection = await pool.getConnection();

    try {
        console.log('🔧 Disabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('🗑️  Dropping existing tables...');
        await connection.query('DROP TABLE IF EXISTS tarifs');
        await connection.query('DROP TABLE IF EXISTS taxes');
        console.log('✓ Tables dropped');

        console.log('\n📋 Creating taxes table...');
        const taxesSql = fs.readFileSync(
            path.join(__dirname, '../migrations/012_create_taxes_table.sql'),
            'utf8'
        );
        await connection.query(taxesSql);
        console.log('✓ taxes table created');

        console.log('\n📋 Creating tarifs table...');
        const tarifsSql = fs.readFileSync(
            path.join(__dirname, '../migrations/013_create_tarifs_table.sql'),
            'utf8'
        );
        await connection.query(tarifsSql);
        console.log('✓ tarifs table created');

        console.log('\n🔧 Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('\n✅ All tables recreated successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        await connection.query('SET FOREIGN_KEY_CHECKS = 1'); // Re-enable on error
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

recreateTables();
