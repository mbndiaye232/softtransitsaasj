---
description: Vérifier le statut du projet (serveurs, dépendances, base de données)
---

# Vérification du statut du projet

// turbo-all

Ce workflow vérifie automatiquement l'état du projet et de ses composants.

## Étapes

1. **Vérifier les dépendances backend**
   ```bash
   cd c:\softtransitsaasantigravity\backend
   npm list --depth=0
   ```

2. **Vérifier les dépendances frontend**
   ```bash
   cd c:\softtransitsaasantigravity\frontend
   npm list --depth=0
   ```

3. **Vérifier les processus en cours**
   ```bash
   Get-Process node -ErrorAction SilentlyContinue
   ```

## Résultat attendu

- Liste des dépendances installées
- Liste des processus Node.js en cours d'exécution
- Identification des serveurs actifs
