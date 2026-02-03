# Guide de démarrage - Soft Transit SaaS

## Étape 1: Créer la base de données

Ouvrez MySQL et exécutez :

```sql
CREATE DATABASE soft_transit_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Étape 2: Importer le schéma de base

```bash
mysql -u root -p soft_transit_saas < docs/bd.txt
```

Ou depuis MySQL:
```sql
USE soft_transit_saas;
SOURCE c:/softtransitsaasantigravity/docs/bd.txt;
```

## Étape 3: Appliquer la migration SaaS

```bash
mysql -u root -p soft_transit_saas < backend/migrations/001_add_saas_fields.sql
```

Ou depuis MySQL:
```sql
USE soft_transit_saas;
SOURCE c:/softtransitsaasantigravity/backend/migrations/001_add_saas_fields.sql;
```

## Étape 4: Configurer le mot de passe MySQL

Éditez `backend/.env` et ajoutez votre mot de passe MySQL:

```env
DB_PASSWORD=votre_mot_de_passe_mysql
```

## Étape 5: Redémarrer le backend

Le serveur backend est déjà en cours d'exécution avec nodemon.
Il redémarrera automatiquement après la modification du .env.

## Étape 6: Démarrer le frontend

Dans un nouveau terminal:

```bash
cd frontend
npm run dev
```

## Étape 7: Tester l'application

1. Ouvrir http://localhost:5173
2. Cliquer sur "Créer un compte"
3. Remplir le formulaire d'inscription
4. Se connecter

## Vérification

- Backend: http://localhost:3001/api/health
- Frontend: http://localhost:5173

## Dépannage

### Erreur "Base inconnue"
→ Créer la base de données (Étape 1)

### Erreur "Access denied"
→ Vérifier DB_PASSWORD dans backend/.env

### Erreur "Table doesn't exist"
→ Importer le schéma (Étapes 2 et 3)

### Port déjà utilisé
→ Modifier PORT dans backend/.env ou frontend/vite.config.js
