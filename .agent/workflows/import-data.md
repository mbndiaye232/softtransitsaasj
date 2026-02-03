---
description: Importer les données de référence (devises, taxes, etc.)
---

# Importation des données de référence

// turbo-all

Ce workflow importe automatiquement les données de référence dans la base de données.

## Étapes

1. **Importer les devises**
   ```bash
   cd c:\softtransitsaasantigravity\backend
   node scripts/import_devises.js
   ```

2. **Enrichir les données**
   ```bash
   cd c:\softtransitsaasantigravity\backend
   node scripts/enrich_data.js
   ```

3. **Vérifier la table des taxes**
   ```bash
   cd c:\softtransitsaasantigravity\backend
   node scripts/check_taxes_table.js
   ```

## Résultat attendu

- Les données de devises sont importées
- Les données sont enrichies avec les informations complémentaires
- La table des taxes est vérifiée et validée
