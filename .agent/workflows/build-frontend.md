---
description: Construire le frontend pour la production
---

# Construction du frontend pour la production

// turbo-all

Ce workflow construit automatiquement le frontend pour le déploiement en production.

## Étapes

1. **Construire le frontend**
   ```bash
   cd c:\softtransitsaasantigravity\frontend
   npm run build
   ```

2. **Vérifier le dossier de build**
   ```bash
   cd c:\softtransitsaasantigravity\frontend
   Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum
   ```

## Résultat attendu

- Le dossier `dist` est créé avec les fichiers optimisés
- Les assets sont minifiés et optimisés
- La taille totale du build est affichée
