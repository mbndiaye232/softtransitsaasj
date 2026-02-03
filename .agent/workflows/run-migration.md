---
description: Exécuter une migration de base de données
---

# Exécution d'une migration de base de données

// turbo-all

Ce workflow exécute automatiquement un script de migration de base de données.

## Étapes

1. **Exécuter le script de migration**
   ```bash
   cd c:\softtransitsaasantigravity\backend
   node scripts/run_migration.js
   ```

## Résultat attendu

- La migration est appliquée à la base de données
- Les tables/colonnes sont créées ou modifiées selon le script
- Un message de confirmation est affiché
