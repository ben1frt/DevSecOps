# TP DevSecOps : Sécurisation Cyber du Cycle de Vie des Secrets

Ce dépôt contient la mise en œuvre pratique d'une architecture de haute sécurité protégeant le cycle de vie des secrets au sein d'un backend Node.js et de son pipeline CI/CD GitHub Actions. 

L'approche adoptée s'inscrit dans la philosophie **Shift-Left** (interception locale au plus tôt via des hooks Git) combinée à un **chiffrement par enveloppe** (Mozilla SOPS & Age) garantissant le principe de **Séparation des Tâches (SoD)** entre les environnements de Dev et de Prod.

---

## Architecture & Objectifs Réalisés

1. **Analyse Statique et Audit Gitleaks**
   - Remplacement de la clé AWS factice et détection d'historique complète.
   - Création de règles sur-mesure (`gitleaks.toml`) pour la détection des jetons d'entreprise (`mycorp_`).
   - Gestion avancée des faux positifs avec exclusion propre via `.gitleaksignore`.

2. **Verrouillage Local via Hook Git (`pre-commit`)**
   - Mise en œuvre d'un bouclier de sécurité local empêchant tout commit contenant un secret en clair en staged.
   - Contrôle d'accès et annulation automatique du commit (`exit 1`) en cas de non-conformité.

3. **Chiffrement par Enveloppe & Ségrégation (Mozilla SOPS + Age)**
   - Génération de paires de clés asymétriques Age distinctes pour le rôle Développeur (`dev.txt`) et Ingénieur Ops (`ops.txt`).
   - Extraction des variables d' `app.js` vers `secrets-dev.yaml` et `secrets-prod.yaml`.
   - Application d'une politique stricte `.sops.yaml` : un développeur avec `dev.txt` peut déchiffrer la Dev mais se trouve techniquement incapable de déchiffrer la Prod.

4. **Industrialisation Hermétique dans GitHub Actions (`ci.yml`)**
   - Installation à la volée de SOPS et Age sur le runner Linux.
   - Déchiffrement dynamique de `secrets-prod.yaml` en mémoire via la variable secrète GitHub `SOPS_AGE_KEY`.
   - Injection sécurisée au runtime et masquage actif des secrets en console (`::add-mask::`) pour une étanchéité absolue des logs.

---

## Instructions de Déploiement & Configuration CI/CD

### 1. Configuration du Secret GitHub (`SOPS_AGE_KEY`)

Pour que le pipeline GitHub Actions puisse déchiffrer dynamiquement les secrets de production lors du déploiement, vous devez ajouter la clé privée de l'Ingénieur Ops dans les paramètres de votre dépôt GitHub.

1. Accédez à votre dépôt sur GitHub : `Settings` > `Secrets and variables` > `Actions`.
2. Cliquez sur **New repository secret**.
3. Dans le champ **Name**, saisissez exactement :
   ```text
   SOPS_AGE_KEY
   ```
4. Dans le champ **Secret**, collez l'intégralité du contenu de votre fichier `ops.txt` (clé privée) :
   ```text
   AGE-SECRET-KEY-[collez_ici_la_cle_privee_de_ops.txt]
   ```
5. Cliquez sur **Add secret**.

### 2. Vérification Locale du Cloisonnement (SoD)

Pour prouver l'efficacité du cloisonnement, exécutez la commande suivante en local :

```bash
# Tentative de déchiffrement de la Prod avec la clé du Dev (ÉCHEC ATTENDU ET REQUI)
SOPS_AGE_KEY_FILE=dev.txt sops -d secrets-prod.yaml
```
*Le système renvoie une erreur confirmant qu'aucune identité ne correspond, validant la séparation des rôles.*

---

## Structure du Projet

```text
├── .git/hooks/pre-commit     # Hook local de blocage Gitleaks
├── .github/workflows/ci.yml  # Pipeline CI/CD de déploiement hermétique
├── .gitleaksignore           # Fichier d'exclusion des faux positifs (app.test.js)
├── .gitignore                # Exclusion des clés privées et dépendances
├── .sops.yaml                # Règles de ciblage de chiffrement SOPS
├── app.js                    # Backend Node.js sécurisé (variables d'environnement)
├── app.test.js               # Fichier de test unitaire (simulation de fausse alerte)
├── dev.txt                   # Clé asymétrique Age du Développeur
├── ops.txt                   # Clé asymétrique Age de l'Ingénieur Ops
├── package.json              # Dépendances et scripts Node.js
├── README.md                 # Compte-rendu et documentation du TP
├── secrets-dev.yaml          # Secrets de Dev chiffrés (Dev + Ops)
└── secrets-prod.yaml         # Secrets de Prod chiffrés (Ops uniquement)
```

---
*TP réalisé avec succès dans le cadre de la formation DevSecOps.*