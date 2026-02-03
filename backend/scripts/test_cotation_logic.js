const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testCotation() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Testing Dossier Cotation Feature ---');

        // 1. Get a sample dossier and agent
        const [dossiers] = await pool.query('SELECT IDDossiers FROM dossiers LIMIT 1');
        const [agents] = await pool.query('SELECT IDAgents FROM Agents LIMIT 2');

        if (dossiers.length === 0 || agents.length < 2) {
            console.error('Missing test data (dossiers or agents)');
            return;
        }

        const dossierId = dossiers[0].IDDossiers;
        const agent1 = agents[0].IDAgents;
        const agent2 = agents[1].IDAgents;

        console.log(`Using Dossier ID: ${dossierId}, Agent 1: ${agent1}, Agent 2: ${agent2}`);

        // 2. Clear existing cotations for this dossier (to start fresh)
        await pool.query('DELETE FROM dossier_cotations WHERE dossier_id = ?', [dossierId]);

        // 3. First Assignment
        console.log('Performing first assignment...');
        const [res1] = await pool.query(
            'INSERT INTO dossier_cotations (dossier_id, agent_id, date_effet, is_active) VALUES (?, ?, ?, 1)',
            [dossierId, agent1, '2026-01-01']
        );
        const cot1Id = res1.insertId;

        // 4. Reassignment
        console.log('Performing reassignment...');
        // Close agent 1
        await pool.query(
            'UPDATE dossier_cotations SET is_active = 0, date_fin = ?, motif_fin = ? WHERE id = ?',
            ['2026-02-01', 'Test Change', cot1Id]
        );
        // Add agent 2
        await pool.query(
            'INSERT INTO dossier_cotations (dossier_id, agent_id, date_effet, is_active) VALUES (?, ?, ?, 1)',
            [dossierId, agent2, '2026-02-01']
        );

        // 5. Verify
        const [results] = await pool.query(
            'SELECT * FROM dossier_cotations WHERE dossier_id = ? ORDER BY date_effet DESC',
            [dossierId]
        );

        console.log('\nVerification Results:');
        console.table(results);

        if (results.length === 2 && results[0].is_active === 1 && results[1].is_active === 0) {
            console.log('\n✅ TEST PASSED: History and active status correctly managed.');
        } else {
            console.log('\n❌ TEST FAILED: Verification failed.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await pool.end();
    }
}

testCotation();
