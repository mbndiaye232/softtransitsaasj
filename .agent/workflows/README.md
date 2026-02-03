# Workflows Automatisés - SOFT TRANSIT

Ce dossier contient des workflows automatisés pour faciliter le développement et la gestion du projet SOFT TRANSIT.

## 🚀 Workflows Disponibles

Tous ces workflows sont configurés avec `// turbo-all`, ce qui signifie que toutes les commandes s'exécutent **automatiquement sans confirmation**.

### Développement

- **`/start-dev`** - Démarrer le serveur de développement (backend + frontend)
- **`/install-deps`** - Installer toutes les dépendances npm
- **`/check-status`** - Vérifier le statut du projet

### Base de données

- **`/run-migration`** - Exécuter une migration de base de données
- **`/import-data`** - Importer les données de référence (devises, taxes, etc.)

### Production

- **`/build-frontend`** - Construire le frontend pour la production

## 📝 Comment utiliser

Pour exécuter un workflow, utilisez simplement la commande slash correspondante :

```
/start-dev
```

L'assistant exécutera automatiquement toutes les étapes du workflow sans demander de confirmation.

## ⚙️ Configuration

Tous les workflows utilisent l'annotation `// turbo-all` qui active l'exécution automatique pour toutes les commandes `run_command`.

## 🔒 Sécurité

Les workflows sont conçus pour exécuter uniquement des commandes sûres :
- ✅ Lecture de fichiers
- ✅ Installation de dépendances
- ✅ Démarrage de serveurs de développement
- ✅ Exécution de scripts de migration/import
- ✅ Build de production

Les commandes destructives nécessiteront toujours une confirmation manuelle.
