---
description: Installer les dépendances npm (backend + frontend)
---

# Installation des dépendances

// turbo-all

Ce workflow installe automatiquement toutes les dépendances npm pour le backend et le frontend.

## Étapes

1. **Installer les dépendances backend**
   ```bash
   cd c:\softtransitsaasantigravity\backend
   npm install
   ```

2. **Installer les dépendances frontend**
   ```bash
   cd c:\softtransitsaasantigravity\frontend
   npm install
   ```

## Résultat attendu

- Tous les packages npm sont installés
- Les fichiers `node_modules` sont créés dans les deux dossiers
- Les fichiers `package-lock.json` sont mis à jour
