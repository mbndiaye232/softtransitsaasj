---
description: Démarrer le serveur de développement (backend + frontend)
---

# Démarrage du serveur de développement

// turbo-all

Ce workflow démarre automatiquement le backend et le frontend en mode développement.

## Étapes

1. **Démarrer le backend**
   ```bash
   cd c:\softtransitsaasantigravity\backend
   node server.js
   ```

2. **Démarrer le frontend** (dans un nouveau terminal)
   ```bash
   cd c:\softtransitsaasantigravity\frontend
   npm run dev
   ```

## Résultat attendu

- Backend: serveur Node.js démarré sur le port configuré (généralement 3001)
- Frontend: serveur Vite démarré sur le port 5173
