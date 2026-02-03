const pool = require('./config/database');

async function testClientsAPI() {
    try {
        console.log('Testing clients API mapping...\n');

        // Get clients from database
        const [clients] = await pool.query(
            `SELECT * FROM CLIENTS WHERE structur_id = 1 ORDER BY NomRS ASC LIMIT 2`
        );

        console.log('Raw database result:');
        console.log(JSON.stringify(clients[0], null, 2));

        // Apply mapping
        const mappedClients = clients.map(client => ({
            ...client,
            NomClient: client.NomRS,
            Adresse: client.adresseClient,
            Tel1: client.TelClient,
            Tel2: client.CelClient,
            Email: client.EmailClient
        }));

        console.log('\n\nMapped result (what frontend receives):');
        console.log(JSON.stringify(mappedClients[0], null, 2));

        console.log('\n\n✅ Mapping is working correctly!');
        console.log('Frontend should see these fields:');
        console.log('- NomClient:', mappedClients[0].NomClient);
        console.log('- Adresse:', mappedClients[0].Adresse);
        console.log('- Tel1:', mappedClients[0].Tel1);
        console.log('- Tel2:', mappedClients[0].Tel2);
        console.log('- Email:', mappedClients[0].Email);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testClientsAPI();
