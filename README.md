# Soft Transit SaaS

Application SaaS de gestion de transit douanier avec système de crédits.

## Structure du projet

```
softtransitsaasantigravity/
├── backend/          # API Node.js/Express
│   ├── config/       # Configuration (database)
│   ├── middleware/   # Middleware (auth, tenant)
│   ├── routes/       # Routes API
│   ├── utils/        # Utilitaires
│   ├── migrations/   # Scripts SQL
│   └── server.js     # Point d'entrée
├── frontend/         # Application React
│   ├── src/
│   │   ├── pages/    # Pages (Login, Register, Dashboard)
│   │   ├── context/  # Context API (Auth)
│   │   └── services/ # API client
│   └── vite.config.js
└── docs/             # Documentation
```

## Prérequis

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

## Installation

### 1. Base de données

Créez la base de données MySQL :

```sql
CREATE DATABASE soft_transit_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Exécutez le script de création de la base (depuis `docs/bd.txt`) puis le script de migration :

```bash
mysql -u root -p soft_transit_saas < docs/bd.txt
mysql -u root -p soft_transit_saas < backend/migrations/001_add_saas_fields.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Configurez `.env` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=soft_transit_saas
JWT_SECRET=votre-secret-jwt-tres-securise
```

Démarrez le serveur :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`

## Fonctionnalités implémentées

### Backend
- ✅ Authentification JWT
- ✅ Inscription de société avec admin
- ✅ Login/Logout
- ✅ Réinitialisation de mot de passe
- ✅ Multi-tenancy (isolation par `structur_id`)
- ✅ Middleware d'authentification
- ✅ Gestion des rôles (ADMIN, USER, AGENT)

### Frontend
- ✅ Page de connexion
- ✅ Page d'inscription
- ✅ Tableau de bord
- ✅ Mot de passe oublié
- ✅ Réinitialisation de mot de passe
- ✅ Context API pour l'authentification
- ✅ Design moderne et responsive

### Base de données
- ✅ Schéma complet (70+ tables)
- ✅ Tables SaaS (`credit_rules`, `credit_logs`)
- ✅ Champs d'authentification dans `Agents`
- ✅ Champs de crédits dans `structur`
- ✅ Multi-tenancy avec `structur_id`

## Prochaines étapes

- [ ] Système de crédits (achat, consommation)
- [ ] Gestion des utilisateurs
- [ ] Modules métier (Dossiers, Déclarations, etc.)
- [ ] 2FA (SMS)
- [ ] Intégration email (nodemailer)
- [ ] Tests automatisés
- [ ] Déploiement

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur connecté
- `POST /api/auth/forgot-password` - Demande de réinitialisation
- `POST /api/auth/reset-password` - Réinitialisation

## Technologies

- **Backend**: Node.js, Express, MySQL2, bcrypt, JWT
- **Frontend**: React 18, Vite, React Router, Axios
- **Database**: MySQL 8.0
- **Auth**: JWT, bcrypt

## Licence

Propriétaire
# softtransitsaasj
