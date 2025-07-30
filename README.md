
# W2P Client – React Frontend

Ce projet constitue la partie frontend React de l'intégration W2P, un plugin qui synchronise les données entre WooCommerce et Pipedrive. Il communique avec un backend local où le plugin W2P est activé.

⚠️ **Ce projet nécessite un backend fonctionnel avec le plugin W2P activé pour fonctionner correctement. Assure-toi d'avoir l'accès à ce backend local avant de démarrer.**

## 🚀 Démarrage rapide

### 1. Clone le repo

```bash
git clone https://github.com/W2P-connect/W2P_client_react.git
cd W2P_client_react
```

### 2. Installe les dépendances

```bash
npm install
```

### 3. Démarre l'application

Le frontend nécessite un backend local avec le plugin W2P activé pour fonctionner. Une fois que tout est configuré :

```bash
npm start
```

L'application sera accessible par défaut à http://localhost:3000.

## 🛠 Stack technique

- **React**
- **MobX** pour la gestion d'état
- **Typescript**
- **Tailwind CSS** pour la gestion des styles

## 📁 Structure du projet

Le projet suit une structure simple et modulaire, facilitant la gestion de l'état, des composants et des fonctions :

- **public/** : Contient les fichiers statiques accessibles depuis le navigateur.
- **src/** : Contient tout le code source de l'application.
  - **src/helpers/** : Fonctions utilitaires et helpers.
  - **src/_COMPONENTS/** : Composants réutilisables dans toute l'application.
  - **src/_CONTEXT/** : Contextes pour partager des données entre composants.
  - **src/_STORES/** : Gestion de l'état avec MobX.
  - **src/_CONTAINERS/** : Contient les sections rangées par page (containers).

## 📩 Feedback ou bugs

Si tu rencontres des problèmes ou souhaites contribuer à ce projet, tu peux ouvrir un ticket ici : https://woocommerce-to-pipedrive.com/contact.
