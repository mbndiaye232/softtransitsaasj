const pool = require('../config/database');

async function checkSpecificColumns() {
    const columnsToCheck = [
        'IDDossiers', 'IDCLIENTS', 'Libelle', 'CodeDossier',
        'CodeDossierCourt', 'NatureDossier', 'ModeExpedition',
        'TypeDossier', 'Typedocument', 'DescriptionDossiers',
        'NumeroDPI', 'EtapeCotation', 'PersonneContact',
        'TelPersonneContact', 'EmailPersonneContact',
        'Observations', 'cheminfiche', 'IdAgentValidation',
        'Facturable', 'SaisiLe', 'Cloture', 'structur_id'
    ];

    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM dossiers");
        const existingColumns = rows.map(r => r.Field);

        console.log("Existing columns:", existingColumns);

        const missing = columnsToCheck.filter(c => !existingColumns.includes(c));

        if (missing.length > 0) {
            console.log("\nMISSING COLUMNS:", missing);
        } else {
            console.log("\nAll columns exist.");
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSpecificColumns();
