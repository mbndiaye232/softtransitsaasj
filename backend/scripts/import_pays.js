const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const xmlFilePath = path.join(__dirname, '../../docs/EXPORTPAYS.xml');

async function importCountries() {
    console.log('Starting country import...');

    if (!fs.existsSync(xmlFilePath)) {
        console.error(`XML file not found at: ${xmlFilePath}`);
        process.exit(1);
    }

    // Database connection
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        if (!result.WINDEV_TABLE || !result.WINDEV_TABLE.TABLE_CONTENU) {
            throw new Error('Invalid XML structure');
        }

        const countries = result.WINDEV_TABLE.TABLE_CONTENU;
        console.log(`Found ${countries.length} countries to import.`);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const country of countries) {
                const id = parseInt(country.IDPays[0]);
                const nom = country.NomPays ? country.NomPays[0] : '';
                const code3 = country.codePays3 ? country.codePays3[0] : null;
                const code2 = country.CodePays2 ? country.CodePays2[0] : null;
                const codeNum = country.CodeNumerique ? parseInt(country.CodeNumerique[0]) : null;
                const nomEng = country.NomPaysEng ? country.NomPaysEng[0] : null;

                // Insert or Update
                await connection.query(
                    `INSERT INTO Pays (IDPays, NomPays, codePays3, CodePays2, CodeNumerique, NomPaysEng)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     NomPays = VALUES(NomPays),
                     codePays3 = VALUES(codePays3),
                     CodePays2 = VALUES(CodePays2),
                     CodeNumerique = VALUES(CodeNumerique),
                     NomPaysEng = VALUES(NomPaysEng)`,
                    [id, nom, code3, code2, codeNum, nomEng]
                );
            }

            await connection.commit();
            console.log('Import completed successfully.');
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await pool.end();
    }
}

importCountries();
