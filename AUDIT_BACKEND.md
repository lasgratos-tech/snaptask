# 🔍 AUDIT BACKEND SNAPTASK — RAPPORT COMPLET

**Date**: 13 février 2026  
**Mode**: Audit strict — Aucune modification effectuée  
**Objectif**: Établir l'état actuel du backend avant stabilisation

---

## 📋 TABLE DES MATIÈRES

1. [Architecture générale](#architecture-générale)
2. [Routes Fastify existantes](#routes-fastify-existantes)
3. [Middleware d'authentification](#middleware-dauthentification)
4. [Utilisation de Prisma](#utilisation-de-prisma)
5. [Intégration Stripe](#intégration-stripe)
6. [Système Ledger](#système-ledger)
7. [Points fragiles détectés](#points-fragiles-détectés)
8. [Fichiers critiques](#fichiers-critiques)
9. [Modèles utilisés vs non utilisés](#modèles-utilisés-vs-non-utilisés)

---

## 🏗️ ARCHITECTURE GÉNÉRALE

### Structure du projet
- **Framework**: Fastify 4.27.0
- **Base de données**: PostgreSQL (via Prisma 5.22.0)
- **Type**: Monorepo (`apps/api/`)
- **Langage**: TypeScript (ESM modules)
- **Port par défaut**: 3000

### Points d'entrée
- **Fichier principal**: `apps/api/src/index.ts`
- **Bootstrap**: Fonction `bootstrap()` avec gestion d'erreurs globale
- **Démarrage**: `npm run dev` → `tsx src/index.ts`

---

## 🛣️ ROUTES FASTIFY EXISTANTES

### Routes publiques (sans authentification)

#### Health & Monitoring
- `GET /health` → Healthcheck simple
- `GET /metrics` → Prometheus metrics
- `GET /uploads/*` → Fichiers statiques (preuves uploadées)

#### Authentification publique
- `POST /v4/auth/register` → Enregistrement utilisateur
- `POST /v4/auth/login` → Login (API key ou email)
- `POST /auth/register` → Enregistrement simplifié (legacy)
- `POST /auth/login` → Login simplifié (legacy)
- `POST /auth/login-api-key` → Login avec API key uniquement

#### Webhooks externes
- `POST /v4/webhooks/stripe` → Webhook Stripe (signature vérifiée, pas d'API key)

### Routes protégées (API key requise)

#### Administration API Keys
- `POST /admin/bootstrap/founder` → Création première clé founder (dev only)
- `POST /admin/api-keys` → Créer une API key
- `GET /admin/api-keys` → Lister les API keys d'un owner
- `DELETE /admin/api-keys/:key` → Révoquer une API key

#### Billing
- `GET /billing/plans` → Lister les plans de facturation

#### Ledger (Comptabilité)
- `GET /ledger/me` → Historique utilisateur (ses propres transactions)
- `GET /admin/ledger` → Historique admin (toutes les transactions)
- `POST /admin/ledger/credit` → Créditer un owner (dev only)
- `GET /admin/ledger/balance` → Solde d'un owner (admin)

#### Routes V1 (Legacy)
- `POST /v1/tasks/execute` → Exécution de tâche (legacy)
- `POST /v1/tasks/text-summarize` → Résumé de texte
- `POST /v1/tasks/cv-instant` → Génération CV instantanée

#### Routes V4 (Production)

**Catalogue & Définitions**
- `GET /v4/catalogue` → **NOT_IMPLEMENTED** (retourne erreur)
- `GET /v4/tasks/:taskId/:version` → Définition d'une tâche

**Exécutions**
- `POST /v4/executions` → Créer une demande d'exécution
- `GET /v4/executions/:executionRequestId` → Récupérer une exécution

**Paiements**
- `POST /v4/payments/authorize` → Autoriser un paiement
- `GET /v4/payments/:paymentRef` → **NOT_IMPLEMENTED**

**Reçus**
- `GET /v4/receipts/:receiptRef` → Récupérer un reçu
- `GET /v4/receipts/:receiptRef/download` → Télécharger un reçu

**CV (Génération)**
- `POST /v4/cv/generate` → Génération CV simple (MVP)
- `POST /v4/tasks/cv-standard/execute` → CV standard avec Task Engine
- `POST /v4/tasks/cv-expert/execute` → CV expert avec Task Engine
- `POST /v4/tasks/cv-executive/execute` → CV executive avec Task Engine

**Lettres professionnelles**
- `POST /v4/tasks/lettre-avocat/execute`
- `POST /v4/tasks/lettre-banque/execute`
- `POST /v4/tasks/lettre-rh/execute`
- `POST /v4/tasks/lettre-business/execute`

**Airbnb / Immobilier**
- `POST /v4/tasks/airbnb-etat-lieux/execute`
- `POST /v4/tasks/airbnb-description/execute`
- `POST /v4/tasks/airbnb-welcome-pack/execute`
- `POST /v4/tasks/airbnb-fiche-voyageur/execute`
- `POST /v4/tasks/airbnb-acces-wifi-qr/execute`
- `POST /v4/tasks/airbnb-instructions-arrivee-depart/execute`
- `POST /v4/tasks/airbnb-plan-localisation/execute`
- `POST /v4/tasks/airbnb-pack-multi-logement/execute`

**Audit & Validation**
- `GET /v4/audit/logs` → Logs d'audit
- `GET /v4/audit/logs/:executionId` → Logs d'audit par exécution
- `GET /v4/tasks/executions/waiting-validation` → Exécutions en attente de validation
- `POST /v4/tasks/executions/:executionId/validate` → Valider une exécution
- `POST /v4/tasks/executions/:executionId/reject` → Rejeter une exécution
- `POST /v4/tasks/executions/:executionId/proof` → Uploader une preuve

---

## 🔐 MIDDLEWARE D'AUTHENTIFICATION

### Middleware principal
**Fichier**: `apps/api/src/auth/apiKey.middleware.ts`

**Fonction**: `apiKeyAuthMiddleware`
- Vérifie la présence de `x-api-key` ou `Authorization: Bearer <key>`
- Recherche la clé dans Prisma (`ApiKey`)
- Vérifie si la clé est révoquée (`revokedAt`)
- Ajoute `request.user` avec `{ apiKey, owner, role }`
- Gère le bootstrap founder en dev (`FOUNDER_BOOTSTRAP_KEY`)

**Utilisation**:
- Appliqué globalement via `protectedApp.addHook('preHandler', apiKeyAuthMiddleware)` sur toutes les routes protégées

### Middlewares alternatifs (non utilisés actuellement)

1. **`apps/api/src/http/middlewares/auth.middleware.ts`**
   - Fonction `authMiddleware` incomplète (ligne 33: commentaire "LedgerService not available")
   - **STATUS**: ⚠️ Code mort / non utilisé

2. **`apps/api/src/http/middlewares/apiKeyAuth.ts`**
   - Fonction `apiKeyAuth` similaire mais moins complète
   - **STATUS**: ⚠️ Code mort / non utilisé

3. **`apps/api/src/auth/apiKey.guard.ts`**
   - Fonction `requireApiKey` (alternative)
   - **STATUS**: ⚠️ Code mort / non utilisé

### Guards de rôle
**Fichier**: `apps/api/src/auth/role.guard.ts` et `apps/api/src/v4/guards/role.guard.ts`

**Fonctions**:
- `requireRole(allowedRoles)` → Vérifie que `request.user.role` est dans la liste
- `requireReviewer`, `requireOps`, `requireAdmin` → Helpers spécifiques
- `checkCanValidate`, `checkCanAccessAudit`, `checkCanUploadProof` → Vérifications métier

**RBAC Guards**:
- `requirePermission(permission)` → Vérification de permissions granulaires
- `requireAnyPermission(permissions[])` → Vérification de permissions multiples

---

## 🗄️ UTILISATION DE PRISMA

### Configuration
- **Provider**: PostgreSQL
- **Version**: 5.22.0
- **Client**: `apps/api/src/prisma/client.ts` (singleton PrismaClient)
- **Schéma**: `apps/api/prisma/schema.prisma`

### Modèles Prisma définis

#### ✅ Modèles utilisés activement

1. **`User`**
   - **Utilisation**: 
     - `apps/api/src/v4/data/auth.ts` (registerUser, loginWithApiKey, createSessionForUser)
     - `apps/api/src/seed.ts`
   - **Relations**: `apiKeys[]`, `ledger?`
   - **Champs**: `id`, `owner` (unique), `createdAt`, `updatedAt`

2. **`ApiKey`**
   - **Utilisation**: 
     - `apps/api/src/auth/apiKey.middleware.ts` (authentification)
     - `apps/api/src/auth/apiKey.store.ts` (CRUD)
     - `apps/api/src/modules/tasks/task.orchestrator.ts` (validation)
     - `apps/api/src/http/middlewares/*` (middlewares alternatifs)
   - **Relations**: `user` (via `owner`)
   - **Champs**: `id`, `key` (unique), `owner`, `role`, `revokedAt`, `createdAt`
   - **Index**: `owner`

3. **`LedgerAccount`**
   - **Utilisation**:
     - `apps/api/src/ledger/ledger.repository.ts` (getBalance)
     - `apps/api/src/ledger/ledger.store.ts` (getAccount, creditAccount, debitAccount)
   - **Relations**: `user` (via `owner`), `events[]`
   - **Champs**: `id`, `owner` (unique), `balance`, `updatedAt`

4. **`LedgerEvent`**
   - **Utilisation**:
     - `apps/api/src/ledger/ledger.repository.ts` (debit - création événement)
     - `apps/api/src/ledger/ledger.store.ts` (creditAccount, debitAccount - création événements)
     - `apps/api/src/ledger/ledger.routes.ts` (historique utilisateur/admin)
     - `apps/api/src/ledger/ledger.history.ts` (historique)
   - **Relations**: `account` (via `owner`)
   - **Champs**: `id`, `owner`, `amount`, `reason`, `type` (enum), `createdAt`
   - **Index**: `owner`

#### ⚠️ Modèles non présents dans Prisma mais référencés

1. **`TaskExecution`**
   - **Références trouvées**:
     - `apps/api/src/modules/tasks/task.orchestrator.ts` (lignes 26-31, 74-85: code commenté)
     - Migration supprimée: `20260212181756_sync_to_postgresql_schema/migration.sql` (DROP TABLE "TaskExecution")
   - **STATUS**: ❌ Modèle supprimé de Prisma mais référencé dans le code

2. **`Subscription`**
   - **Référence**: `apps/api/src/billing/billingStore.ts` (ligne 4: TODO comment)
   - **STATUS**: ⚠️ Modèle manquant pour la facturation

### Requêtes Prisma identifiées

**User**:
- `prisma.user.findUnique({ where: { owner } })`
- `prisma.user.findUnique({ where: { id } })`

**ApiKey**:
- `prisma.apiKey.findUnique({ where: { key } })`
- `prisma.apiKey.findFirst({ where: { owner, revokedAt: null } })`
- `prisma.apiKey.findMany({ where: { owner } })`
- `prisma.apiKey.count({ where: { role: 'founder' } })`
- `prisma.apiKey.updateMany({ where: { owner, key }, data: { revokedAt } })`

**LedgerAccount**:
- `prisma.ledgerAccount.findUnique({ where: { owner } })`
- `prisma.ledgerAccount.create({ data: { owner, balance } })`
- `prisma.ledgerAccount.upsert({ where: { owner }, ... })`
- `prisma.ledgerAccount.update({ where: { owner }, data: { balance: { increment/decrement } } })`

**LedgerEvent**:
- `prisma.ledgerEvent.create({ data: { owner, amount, reason, type } })`
- `prisma.ledgerEvent.findMany({ where: { owner }, orderBy: { createdAt: 'desc' }, take: 50 })`

---

## 💳 INTÉGRATION STRIPE

### Configuration
- **SDK**: `stripe@20.0.0`
- **Version API**: `2025-11-17.clover`
- **Fichier client**: `apps/api/src/v4/services/stripe.service.ts` et `apps/api/src/billing/stripe.client.ts`

### Services Stripe implémentés

#### ✅ Fonctions disponibles

1. **`createStripePaymentIntent`**
   - Crée un PaymentIntent en mode ESCROW (capture manuelle)
   - Simulation en dev si `STRIPE_SECRET_KEY` ne commence pas par `sk_live`
   - Utilisé dans: `apps/api/src/v4/engine/taskEngine.ts` (ligne 214)

2. **`captureStripePaymentIntent`**
   - Capture un PaymentIntent
   - Simulation en dev

3. **`cancelStripePaymentIntent`**
   - Annule un PaymentIntent
   - Simulation en dev

4. **`getStripePaymentIntent`**
   - Récupère un PaymentIntent
   - Simulation en dev

5. **`verifyStripeWebhookSignature`**
   - Vérifie la signature d'un webhook Stripe
   - Utilisé dans: `apps/api/src/v4/webhooks/stripe.webhook.ts`

### Webhook Stripe

**Route**: `POST /v4/webhooks/stripe`
**Fichier**: `apps/api/src/v4/webhooks/stripe.webhook.ts`

**Fonctionnalités**:
- Vérification de signature obligatoire (`stripe-signature` header)
- Vérification d'idempotence (évite le traitement en double)
- Gestion des événements Stripe:
  - `payment_intent.succeeded`
  - `payment_intent.canceled`
  - `payment_intent.payment_failed`
  - `charge.succeeded`
  - `charge.failed`

**Variables d'environnement requises**:
- `STRIPE_SECRET_KEY` → Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` → Secret pour vérifier les webhooks

### Intégration avec le système de paiement

**Flux identifié**:
1. Création d'exécution de tâche → `taskEngine.ts`
2. À la complétion → Création PaymentIntent Stripe (ESCROW)
3. Création PaymentIntent SnapTask (in-memory)
4. Autorisation du paiement
5. Webhook Stripe → Mise à jour du statut

**Points d'intégration**:
- `apps/api/src/v4/engine/taskEngine.ts` (ligne 212-258)
- `apps/api/src/v4/data/paymentIntents.ts` (gestion PaymentIntent SnapTask)
- `apps/api/src/v4/webhooks/stripe.webhook.ts` (traitement webhooks)

### Billing Service

**Fichier**: `apps/api/src/billing/billing.service.ts`

**Fonctionnalités**:
- `listPlans()` → Plans hardcodés (FREE, PRO)
- `getPriceForCommand()` → Prix par commande
- `createCheckoutSession()` → Session Stripe Checkout (implémentation minimale)

**STATUS**: ⚠️ Implémentation minimale, pas de modèle Subscription dans Prisma

---

## 💰 SYSTÈME LEDGER

### Architecture

**Modèles Prisma**:
- `LedgerAccount` → Compte avec solde (`balance`)
- `LedgerEvent` → Événements CREDIT/DEBIT (append-only)

### Services Ledger

#### 1. LedgerRepository
**Fichier**: `apps/api/src/ledger/ledger.repository.ts`

**Méthodes**:
- `getBalance(owner)` → Récupère le solde (retourne 0 si compte inexistant)
- `debit({ userId, amountCents, currency, idempotencyKey, reason })` → Débite le compte
  - Crée un `LedgerEvent` de type DEBIT
  - Met à jour `LedgerAccount.balance` (décrémente)

**⚠️ PROBLÈME DÉTECTÉ**: 
- `debit()` ne vérifie pas si le compte existe avant de créer l'événement
- Pas de transaction Prisma pour garantir la cohérence

#### 2. LedgerStore
**Fichier**: `apps/api/src/ledger/ledger.store.ts`

**Méthodes**:
- `getAccount(owner)` → Récupère ou crée le compte (balance = 0)
- `creditAccount(owner, amount, reason)` → Crédite le compte
  - Utilise `prisma.$transaction` ✅
  - Crée un `LedgerEvent` de type CREDIT
  - Met à jour `LedgerAccount.balance` (incrémente)
- `debitAccount(owner, amount, reason)` → Débite le compte
  - Utilise `prisma.$transaction` ✅
  - Vérifie le solde avant débit ✅
  - Crée un `LedgerEvent` de type DEBIT
  - Met à jour `LedgerAccount.balance` (décrémente)

**STATUS**: ✅ Implémentation robuste avec transactions

### Routes Ledger

**Fichier**: `apps/api/src/ledger/ledger.routes.ts`

**Routes**:
- `GET /ledger/me` → Historique utilisateur (50 derniers événements)
- `GET /admin/ledger` → Historique admin (filtrable par owner, limit 200)
- `POST /admin/ledger/credit` → Créditer un owner (dev only)
- `GET /admin/ledger/balance` → Solde d'un owner (admin)

### Utilisation dans le système

**Task Orchestrator**:
- `apps/api/src/modules/tasks/task.orchestrator.ts` (ligne 48-63)
- Vérifie le solde avant exécution
- Débite après exécution réussie

**⚠️ INCOHÉRENCE DÉTECTÉE**:
- `task.orchestrator.ts` utilise `ledgerRepository.debit()` (sans transaction)
- `ledger.routes.ts` utilise `creditAccount()` de `ledger.store.ts` (avec transaction)
- **Recommandation**: Unifier l'utilisation vers `ledger.store.ts` pour garantir la cohérence

---

## ⚠️ POINTS FRAGILES DÉTECTÉS

### 🔴 CRITIQUES

1. **Modèle TaskExecution supprimé mais référencé**
   - **Fichier**: `apps/api/src/modules/tasks/task.orchestrator.ts`
   - **Lignes**: 26-31, 74-85 (code commenté)
   - **Impact**: Idempotence désactivée, pas de persistance des exécutions
   - **Risque**: Exécutions dupliquées possibles

2. **LedgerRepository.debit() sans transaction**
   - **Fichier**: `apps/api/src/ledger/ledger.repository.ts`
   - **Ligne**: 22-48
   - **Impact**: Risque d'incohérence si création d'événement réussit mais mise à jour échoue
   - **Risque**: Solde incorrect possible

3. **Incohérence dans l'utilisation du Ledger**
   - `task.orchestrator.ts` utilise `ledgerRepository.debit()` (sans transaction)
   - `ledger.routes.ts` utilise `ledger.store.ts` (avec transaction)
   - **Impact**: Comportement différent selon le point d'entrée

4. **Middleware d'authentification dupliqué**
   - 3 fichiers avec des implémentations similaires:
     - `auth/apiKey.middleware.ts` (utilisé)
     - `http/middlewares/auth.middleware.ts` (non utilisé, incomplet)
     - `http/middlewares/apiKeyAuth.ts` (non utilisé)
   - **Impact**: Confusion, maintenance difficile

5. **Route catalogue non implémentée**
   - `GET /v4/catalogue` → Retourne `{ error: 'NOT_IMPLEMENTED' }`
   - **Impact**: Frontend ne peut pas récupérer le catalogue dynamique

### 🟡 MOYENS

6. **Billing Service minimal**
   - Pas de modèle Subscription dans Prisma
   - Plans hardcodés
   - `createCheckoutSession()` incomplet
   - **Impact**: Facturation limitée

7. **TODO dans taskEngine.ts**
   - Ligne 104: `// TODO: Appeler le service d'exécution IA générique basé sur definition.config`
   - **Impact**: Exécution IA peut être incomplète

8. **CORS hardcodé**
   - `apps/api/src/index.ts` ligne 77: `origin: process.env.CORS_ORIGIN || 'http://localhost:5173'`
   - Route protégée ligne 343: `origin: 'http://localhost:5173'` (hardcodé)
   - **Impact**: CORS ne fonctionnera pas en production sans modification

9. **Gestion d'erreurs incomplète**
   - `apps/api/src/http/middlewares/auth.middleware.ts` ligne 15: `prisma` non importé
   - **Impact**: Code mort mais peut causer confusion

10. **Raw body parser global**
    - `apps/api/src/index.ts` ligne 48-59: Parse tous les JSON en buffer
    - **Impact**: Peut causer des problèmes avec certaines routes qui attendent du JSON normal

### 🟢 MINEURS

11. **Commentaires de code mort**
    - Plusieurs fichiers avec du code commenté (task.orchestrator.ts, auth.middleware.ts)
    - **Impact**: Code difficile à maintenir

12. **Imports dynamiques**
    - Plusieurs `await import()` dans `index.ts` (lignes 103, 137, 179, 300, 327)
    - **Impact**: Performance légèrement dégradée, mais acceptable

13. **Validation de schéma manquante**
    - Routes V4 utilisent des validations manuelles au lieu de Zod (présent dans package.json)
    - **Impact**: Code répétitif, erreurs possibles

---

## 📁 FICHIERS CRITIQUES

### 🔴 Niveau 1 — Essentiels au démarrage

1. **`apps/api/src/index.ts`**
   - Point d'entrée principal
   - Bootstrap Fastify
   - Enregistrement des routes
   - Gestion d'erreurs globale

2. **`apps/api/src/prisma/client.ts`**
   - Instance PrismaClient unique
   - Utilisé partout dans l'application

3. **`apps/api/prisma/schema.prisma`**
   - Schéma de base de données
   - Modèles User, ApiKey, LedgerAccount, LedgerEvent

4. **`apps/api/src/auth/apiKey.middleware.ts`**
   - Middleware d'authentification principal
   - Utilisé sur toutes les routes protégées

### 🟡 Niveau 2 — Fonctionnalités principales

5. **`apps/api/src/v4/router.ts`**
   - Routes V4 (production)
   - 1900+ lignes, très dense

6. **`apps/api/src/v4/engine/taskEngine.ts`**
   - Moteur d'exécution de tâches
   - Intégration Stripe
   - Gestion des transitions d'état

7. **`apps/api/src/modules/tasks/task.orchestrator.ts`**
   - Orchestrateur de tâches V1
   - Utilisation du Ledger
   - ⚠️ Références à TaskExecution supprimé

8. **`apps/api/src/ledger/ledger.store.ts`**
   - Store Ledger avec transactions
   - Méthodes creditAccount, debitAccount

9. **`apps/api/src/ledger/ledger.repository.ts`**
   - Repository Ledger
   - ⚠️ debit() sans transaction

10. **`apps/api/src/v4/webhooks/stripe.webhook.ts`**
    - Webhook Stripe
    - Vérification de signature
    - Idempotence

### 🟢 Niveau 3 — Support

11. **`apps/api/src/v4/services/stripe.service.ts`**
    - Services Stripe
    - PaymentIntent, capture, cancel

12. **`apps/api/src/v4/data/auth.ts`**
    - Logique d'authentification V4
    - registerUser, loginWithApiKey, createSessionForUser

13. **`apps/api/src/auth/apiKey.store.ts`**
    - CRUD API keys
    - createApiKey, revokeApiKey, listApiKeys

14. **`apps/api/src/billing/billing.routes.ts`**
    - Routes de facturation
    - ⚠️ Implémentation minimale

---

## 📊 MODÈLES UTILISÉS VS NON UTILISÉS

### ✅ Modèles Prisma utilisés

| Modèle | Utilisation | Fichiers principaux |
|--------|-------------|---------------------|
| `User` | ✅ Actif | `v4/data/auth.ts`, `seed.ts` |
| `ApiKey` | ✅ Actif | `auth/apiKey.middleware.ts`, `auth/apiKey.store.ts` |
| `LedgerAccount` | ✅ Actif | `ledger/ledger.repository.ts`, `ledger/ledger.store.ts` |
| `LedgerEvent` | ✅ Actif | `ledger/ledger.routes.ts`, `ledger/ledger.store.ts` |

### ❌ Modèles référencés mais absents de Prisma

| Modèle | Références | Impact |
|--------|------------|--------|
| `TaskExecution` | `task.orchestrator.ts` (commenté) | Idempotence désactivée |
| `Subscription` | `billing/billingStore.ts` (TODO) | Facturation limitée |

### ⚠️ Modèles in-memory (non persistés)

Les modèles suivants sont définis en TypeScript mais ne sont pas persistés dans Prisma:

- `TaskExecution` (v4/models/taskExecution.ts)
- `ExecutionRequest` (v4/models/executionRequest.ts)
- `PaymentIntent` (v4/models/payment.ts)
- `PaymentAuthorization` (v4/models/paymentAuthorization.ts)
- `Receipt` (v4/models/receipt.ts)
- `TaskDefinition` (v4/models/taskDefinition.ts)
- `AuditLog` (v4/models/audit.ts)

**STATUS**: Ces modèles sont gérés en mémoire via des stores TypeScript (`v4/data/*.ts`)

---

## 📝 RÉSUMÉ EXÉCUTIF

### Points forts ✅

1. Architecture Fastify solide avec séparation claire des routes
2. Authentification API key fonctionnelle
3. Système Ledger avec événements append-only
4. Intégration Stripe avec webhooks sécurisés
5. Gestion d'erreurs globale au bootstrap

### Points à stabiliser ⚠️

1. **Ledger**: Unifier l'utilisation vers `ledger.store.ts` (transactions)
2. **Middleware auth**: Supprimer les fichiers dupliqués non utilisés
3. **TaskExecution**: Décider si réintroduire le modèle Prisma ou utiliser in-memory
4. **CORS**: Configurer via variables d'environnement partout
5. **Catalogue**: Implémenter la route `/v4/catalogue`

### Blocages potentiels 🔴

1. **TaskExecution supprimé**: Idempotence désactivée, risque de doublons
2. **LedgerRepository.debit()**: Pas de transaction, risque d'incohérence
3. **Billing incomplet**: Pas de modèle Subscription, facturation limitée

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

### Phase 1 — Stabilisation critique (priorité haute)

1. Corriger `LedgerRepository.debit()` pour utiliser une transaction
2. Unifier l'utilisation du Ledger (utiliser `ledger.store.ts` partout)
3. Nettoyer les middlewares d'authentification dupliqués
4. Configurer CORS via variables d'environnement

### Phase 2 — Fonctionnalités manquantes (priorité moyenne)

5. Implémenter la route `/v4/catalogue`
6. Décider du modèle TaskExecution (Prisma vs in-memory)
7. Compléter le Billing Service avec modèle Subscription

### Phase 3 — Améliorations (priorité basse)

8. Ajouter validation Zod sur les routes V4
9. Nettoyer le code commenté
10. Optimiser les imports dynamiques si nécessaire

---

**FIN DU RAPPORT D'AUDIT**

*Ce rapport est une photographie de l'état actuel du backend. Aucune modification n'a été effectuée. Toutes les recommandations sont à valider avant implémentation.*
