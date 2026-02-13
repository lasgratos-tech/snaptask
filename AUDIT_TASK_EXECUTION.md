# 🔍 AUDIT TASK EXECUTION — RAPPORT DE STABILISATION IDEMPOTENCE

**Date**: 13 février 2026  
**Mode**: Audit strict — Aucune modification effectuée  
**Objectif**: Vérifier et stabiliser TaskExecution pour garantir idempotence transactionnelle

---

## 📋 TABLE DES MATIÈRES

1. [Résumé exécutif](#résumé-exécutif)
2. [État actuel de TaskExecution](#état-actuel-de-taskexecution)
3. [Références TaskExecution dans le codebase](#références-taskexecution-dans-le-codebase)
4. [Modèle Prisma](#modèle-prisma)
5. [Lien Payment → Execution](#lien-payment--execution)
6. [Risques de double exécution](#risques-de-double-exécution)
7. [Manque d'unicité](#manque-dunicité)
8. [Plan de stabilisation minimal](#plan-de-stabilisation-minimal)

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Problème principal
**TaskExecution n'existe pas dans Prisma** — Le modèle a été supprimé et remplacé par un store en mémoire, **sans garantie d'idempotence**.

### Impact
- 🔴 **Idempotence désactivée** → Risque de double exécution
- 🔴 **Pas de persistance** → Perte des exécutions au redémarrage
- 🔴 **Pas d'unicité garantie** → ID généré avec `Date.now()` + `Math.random()`
- 🟡 **Lien Payment → Execution fragile** → Référence en mémoire uniquement

### Solution proposée
**Option 1 (Recommandée)** : Réintroduire le modèle Prisma avec contrainte unique sur `idempotencyKey`  
**Option 2 (Alternative)** : Implémenter idempotence dans le store en mémoire avec Map

---

## 📊 ÉTAT ACTUEL DE TASK EXECUTION

### Modèle TypeScript (en mémoire)

**Fichier**: `apps/api/src/v4/data/taskExecutions.ts`

```typescript
export interface TaskExecution {
  id: string
  taskId: string
  userId: string
  status: TaskExecutionStatus
  proofUrl?: string
  proofUploadedAt?: string
  validatedAt?: string
  validatedBy?: 'admin' | null
  validationDecision?: ValidationDecision
  validationComment?: string
  rejectedReason?: string
  deliverableUrl?: string
  createdAt: string
  updatedAt: string
}

const executions: TaskExecution[] = [] // ⚠️ Store en mémoire
```

**Status**: ⚠️ **Non persistant** — Perdu au redémarrage du serveur

### Fonction de création

```typescript
export function createTaskExecution(params: {
  taskId: string
  userId: string
  status: TaskExecutionStatus
}): TaskExecution {
  const execution: TaskExecution = {
    id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ⚠️ Pas d'unicité garantie
    taskId: params.taskId,
    userId: params.userId,
    status: params.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  executions.push(execution) // ⚠️ Pas de vérification d'unicité
  return execution
}
```

**Problèmes identifiés**:
1. ❌ Pas de paramètre `idempotencyKey`
2. ❌ Pas de vérification d'existence avant création
3. ❌ ID généré avec timestamp + random → Collision possible (faible probabilité)
4. ❌ Pas de contrainte d'unicité

---

## 📁 RÉFÉRENCES TASK EXECUTION DANS LE CODEBASE

### Utilisation dans V4 (production)

| Fichier | Fonction | Ligne | Usage |
|---------|----------|-------|-------|
| `v4/router.ts` | `createTaskExecution()` | 299, 424, 527 | Création exécution CV/Lettres/Airbnb |
| `v4/router.ts` | `getExecutionById()` | 338, 463, 577 | Récupération exécution |
| `v4/router.ts` | `updateExecutionDeliverable()` | 327, 452, 823 | Mise à jour livrable |
| `v4/router.ts` | `updateExecutionProof()` | 328, 453 | Mise à jour preuve |
| `v4/router.ts` | `getAllExecutions()` | 604, 647, 1174, 1248 | Liste toutes les exécutions |
| `v4/router.ts` | `getExecutionsWaitingValidation()` | 823 | Exécutions en attente |
| `v4/router.ts` | `validateExecution()` | 968 | Validation admin |
| `v4/router.ts` | `rejectExecution()` | 1034 | Rejet admin |
| `v4/router.ts` | `uploadProof()` | 1116 | Upload preuve |
| `v4/engine/taskEngine.ts` | `runTaskExecution()` | 117 | Moteur d'exécution |
| `v4/engine/taskEngine.ts` | `getExecutionById()` | 118 | Récupération |
| `v4/engine/taskEngine.ts` | `updateExecutionStatus()` | 146 | Mise à jour statut |
| `v4/data/auditLog.ts` | `getAuditLogsByTaskExecutionId()` | 43 | Logs par exécution |
| `v4/data/disputes.ts` | `getDisputesByExecutionId()` | 30 | Disputes par exécution |
| `v4/webhooks/stripe.webhook.ts` | Référence `taskExecutionId` | 54, 75, 98, 117 | Webhook Stripe |

**Total**: **15+ fichiers** utilisent TaskExecution

### Utilisation dans V1 (legacy)

| Fichier | Fonction | Ligne | Usage |
|---------|----------|-------|-------|
| `modules/tasks/task.orchestrator.ts` | Code commenté | 26-31, 74-85 | **IDEMPOTENCE DÉSACTIVÉE** |

**Code commenté**:
```typescript
// 2️⃣ IDEMPOTENCE (TEMPORAIREMENT DÉSACTIVÉE)
// const existing = await prisma.taskExecution.findUnique({
//   where: { idempotencyKey },
// })
// if (existing) {
//   return existing.response
// }

// ...

// await prisma.taskExecution.create({
//   data: {
//     idempotencyKey,
//     taskCode,
//     taskVersion,
//     input,
//     output,
//     response,
//     userId: owner,
//     status: 'SUCCESS',
//   },
// })
```

**Impact**: V1 n'a **aucune idempotence** actuellement

---

## 🗄️ MODÈLE PRISMA

### État actuel

**Schéma Prisma**: `apps/api/prisma/schema.prisma`

```prisma
// ❌ AUCUN MODÈLE TaskExecution
// Seulement:
// - User
// - ApiKey
// - LedgerAccount
// - LedgerEvent
```

### Historique des migrations

**Migration**: `20260212181756_sync_to_postgresql_schema/migration.sql`

```sql
-- DropTable
DROP TABLE "TaskExecution";

-- DropEnum
DROP TYPE "TaskExecutionStatus";
```

**Status**: ✅ **Confirmé** — TaskExecution a été supprimé de Prisma

### Ancien modèle (supposé)

D'après le code commenté dans `task.orchestrator.ts`, l'ancien modèle devait ressembler à :

```prisma
model TaskExecution {
  id              String   @id @default(uuid())
  idempotencyKey  String   @unique  // ⚠️ Contrainte unique pour idempotence
  taskCode        String
  taskVersion     Int
  userId          String
  input           Json
  output          Json?
  response        Json?
  status          TaskExecutionStatus
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum TaskExecutionStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
}
```

**Note**: Ce modèle n'existe plus dans le schéma actuel.

---

## 💳 LIEN PAYMENT → EXECUTION

### Modèle PaymentIntent

**Fichier**: `apps/api/src/v4/models/payment.ts`

```typescript
export interface PaymentIntent {
  id: string
  taskExecutionId: string  // ⚠️ Référence en mémoire uniquement
  amount: number
  currency: string
  status: PaymentIntentStatus
  stripePaymentIntentId?: string
  // ...
}
```

### Store PaymentIntent

**Fichier**: `apps/api/src/v4/data/paymentIntents.ts`

```typescript
const paymentIntents: PaymentIntent[] = [] // ⚠️ Store en mémoire

export function createPaymentIntent(
  taskExecutionId: string,  // ⚠️ Pas de vérification d'existence
  amount: number,
  currency: string,
  stripePaymentIntentId?: string,
): PaymentIntent {
  const intent: PaymentIntent = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    taskExecutionId,  // ⚠️ Référence à une exécution qui peut ne pas exister
    // ...
  }
  paymentIntents.push(intent)
  return intent
}

export function getPaymentIntentByExecutionId(taskExecutionId: string): PaymentIntent | undefined {
  return paymentIntents.find((p) => p.taskExecutionId === taskExecutionId)
}
```

### Problèmes identifiés

1. ❌ **Pas de contrainte de clé étrangère** → `taskExecutionId` peut référencer une exécution inexistante
2. ❌ **Pas de vérification à la création** → `createPaymentIntent()` ne vérifie pas si l'exécution existe
3. ❌ **Orphelins possibles** → Si une exécution est supprimée (redémarrage), les PaymentIntent restent orphelins
4. ⚠️ **Cohérence fragile** → Dépend de la synchronisation en mémoire

### Utilisation dans le système

**Création PaymentIntent** (`v4/engine/taskEngine.ts` ligne 221):
```typescript
const paymentIntent = createPaymentIntent(
  execution.id,  // ⚠️ Référence à une exécution en mémoire
  pricing.amount,
  pricing.currency,
  stripeIntent.id,
)
```

**Récupération PaymentIntent** (`v4/engine/taskEngine.ts` ligne 290):
```typescript
const paymentIntent = getPaymentIntentByExecutionId(taskExecutionId)
if (paymentIntent && paymentIntent.status !== 'captured') {
  cancelPaymentIntent(paymentIntent.id, ...)
}
```

**Status**: ⚠️ **Fonctionnel mais fragile** — Pas de garantie de cohérence

---

## 🔴 RISQUES DE DOUBLE EXÉCUTION

### Scénario #1 : Double requête HTTP simultanée

**Fichier**: `apps/api/src/v4/router.ts` (ligne 299)

```typescript
// Route: POST /v4/tasks/cv-standard/execute
const execution = createTaskExecution({
  taskId,
  userId: user.owner,
  status: 'PENDING',
})

// ⚠️ Pas de vérification d'idempotence
// Deux requêtes identiques créent deux exécutions
```

**Scénario**:
```
Requête A: createTaskExecution() → exec-1234567890-abc
Requête B: createTaskExecution() → exec-1234567890-def  // ⚠️ Double exécution
```

**Impact**: 
- 🔴 **Double génération** de CV
- 🔴 **Double débit** possible (si débit avant création)
- 🔴 **Double PaymentIntent** créé

### Scénario #2 : Retry après timeout

**Fichier**: `apps/api/src/modules/tasks/task.orchestrator.ts` (ligne 25-31)

```typescript
// 2️⃣ IDEMPOTENCE (TEMPORAIREMENT DÉSACTIVÉE)
// const existing = await prisma.taskExecution.findUnique({
//   where: { idempotencyKey },
// })
// if (existing) {
//   return existing.response
// }
```

**Scénario**:
```
Requête 1: idempotencyKey="task-123" → Timeout réseau
Requête 2 (retry): idempotencyKey="task-123" → ⚠️ Nouvelle exécution au lieu de retourner la première
```

**Impact**:
- 🔴 **Exécution dupliquée** malgré même `idempotencyKey`
- 🔴 **Coût doublé** pour l'utilisateur

### Scénario #3 : Race condition sur création

**Fichier**: `apps/api/src/v4/data/taskExecutions.ts` (ligne 93-109)

```typescript
export function createTaskExecution(params: {
  taskId: string
  userId: string
  status: TaskExecutionStatus
}): TaskExecution {
  const execution: TaskExecution = {
    id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    // ⚠️ Pas de vérification d'existence
    // ⚠️ Pas de paramètre idempotencyKey
    // ...
  }
  executions.push(execution)  // ⚠️ Pas de vérification d'unicité
  return execution
}
```

**Scénario**:
```
Thread A: createTaskExecution({ taskId: 'cv-standard', userId: 'user-1' })
Thread B: createTaskExecution({ taskId: 'cv-standard', userId: 'user-1' })
// ⚠️ Deux exécutions créées pour la même tâche/utilisateur
```

**Impact**:
- 🔴 **Pas de protection** contre les doublons
- 🔴 **Pas de contrainte d'unicité**

### Scénario #4 : Perte de données au redémarrage

**Fichier**: `apps/api/src/v4/data/taskExecutions.ts` (ligne 28)

```typescript
const executions: TaskExecution[] = []  // ⚠️ Réinitialisé à chaque redémarrage
```

**Scénario**:
```
1. Exécution créée: exec-123
2. PaymentIntent créé avec taskExecutionId="exec-123"
3. Serveur redémarre
4. executions = [] (vide)
5. getExecutionById("exec-123") → undefined
6. PaymentIntent orphelin
```

**Impact**:
- 🔴 **Perte de traçabilité** des exécutions
- 🔴 **PaymentIntent orphelins**
- 🔴 **Impossible de récupérer** l'historique

---

## ⚠️ MANQUE D'UNICITÉ

### Problème #1 : ID généré sans garantie d'unicité

**Fichier**: `apps/api/src/v4/data/taskExecutions.ts` (ligne 99)

```typescript
id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

**Analyse**:
- `Date.now()` → Millisecondes depuis epoch
- `Math.random()` → Pseudo-aléatoire (pas cryptographique)
- **Collision possible** si deux créations dans la même milliseconde avec même seed

**Probabilité de collision**: Faible mais non nulle (~1/36^9 par milliseconde)

### Problème #2 : Pas de contrainte unique dans le store

**Fichier**: `apps/api/src/v4/data/taskExecutions.ts` (ligne 107)

```typescript
executions.push(execution)  // ⚠️ Pas de vérification avant push
```

**Problème**: 
- Pas de vérification si un ID existe déjà
- Pas de vérification si une combinaison `(taskId, userId, createdAt)` existe déjà
- Pas de contrainte d'unicité

### Problème #3 : Pas de paramètre idempotencyKey

**Fichier**: `apps/api/src/v4/data/taskExecutions.ts` (ligne 93)

```typescript
export function createTaskExecution(params: {
  taskId: string
  userId: string
  status: TaskExecutionStatus
  // ❌ Pas de idempotencyKey
}): TaskExecution
```

**Impact**:
- Impossible de garantir l'idempotence au niveau de l'appelant
- Pas de moyen de détecter les doublons

### Comparaison avec l'ancien modèle Prisma

**Ancien modèle (supposé)**:
```prisma
model TaskExecution {
  idempotencyKey  String   @unique  // ✅ Contrainte unique garantie par DB
  // ...
}
```

**Avantage**: 
- ✅ Contrainte unique garantie par PostgreSQL
- ✅ Détection automatique des doublons
- ✅ Idempotence native

---

## 🛠️ PLAN DE STABILISATION MINIMAL

### Option 1 : Réintroduire le modèle Prisma (RECOMMANDÉE)

#### Avantages
- ✅ **Idempotence garantie** par contrainte unique DB
- ✅ **Persistance** des exécutions
- ✅ **Cohérence** Payment → Execution via clé étrangère
- ✅ **Traçabilité** complète

#### Inconvénients
- ⚠️ Nécessite une migration Prisma
- ⚠️ Migration de données si exécutions en mémoire existantes

#### Schéma Prisma proposé

```prisma
model TaskExecution {
  id              String   @id @default(uuid())
  idempotencyKey  String?  @unique  // Optionnel mais recommandé
  taskId          String
  userId          String
  status          TaskExecutionStatus
  proofUrl        String?
  proofUploadedAt DateTime?
  validatedAt     DateTime?
  validatedBy     String?  // 'admin' | null
  validationDecision String?  // 'approved' | 'rejected' | null
  validationComment String?
  rejectedReason  String?
  deliverableUrl  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([taskId])
  @@index([status])
  @@map("TaskExecution")
}

enum TaskExecutionStatus {
  PENDING
  PROCESSING
  WAITING_PROOF
  WAITING_VALIDATION
  COMPLETED
  REJECTED
}
```

#### Migration Prisma

```sql
-- CreateEnum
CREATE TYPE "TaskExecutionStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'WAITING_PROOF',
  'WAITING_VALIDATION',
  'COMPLETED',
  'REJECTED'
);

-- CreateTable
CREATE TABLE "TaskExecution" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "idempotencyKey" TEXT UNIQUE,
  "taskId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "TaskExecutionStatus" NOT NULL,
  "proofUrl" TEXT,
  "proofUploadedAt" TIMESTAMP(3),
  "validatedAt" TIMESTAMP(3),
  "validatedBy" TEXT,
  "validationDecision" TEXT,
  "validationComment" TEXT,
  "rejectedReason" TEXT,
  "deliverableUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "TaskExecution_userId_idx" ON "TaskExecution"("userId");
CREATE INDEX "TaskExecution_taskId_idx" ON "TaskExecution"("taskId");
CREATE INDEX "TaskExecution_status_idx" ON "TaskExecution"("status");
```

#### Modifications de code requises

**1. `apps/api/src/v4/data/taskExecutions.ts`**

**Changement**: Remplacer le store en mémoire par Prisma

```diff
- const executions: TaskExecution[] = []
+ import prisma from '../../prisma/client.js'

- export function createTaskExecution(params: {
+ export async function createTaskExecution(params: {
    taskId: string
    userId: string
    status: TaskExecutionStatus
+   idempotencyKey?: string
  }): Promise<TaskExecution> {
-   const execution: TaskExecution = {
-     id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
-     taskId: params.taskId,
-     userId: params.userId,
-     status: params.status,
-     createdAt: new Date().toISOString(),
-     updatedAt: new Date().toISOString(),
-   }
-
-   executions.push(execution)
-   return execution
+   try {
+     const execution = await prisma.taskExecution.create({
+       data: {
+         id: crypto.randomUUID(),
+         idempotencyKey: params.idempotencyKey,
+         taskId: params.taskId,
+         userId: params.userId,
+         status: params.status,
+       },
+     })
+     return execution
+   } catch (err) {
+     // Si idempotencyKey existe déjà, retourner l'exécution existante
+     if (params.idempotencyKey && err.code === 'P2002') {
+       const existing = await prisma.taskExecution.findUnique({
+         where: { idempotencyKey: params.idempotencyKey },
+       })
+       if (existing) return existing
+     }
+     throw err
+   }
  }
```

**2. `apps/api/src/modules/tasks/task.orchestrator.ts`**

**Changement**: Réactiver l'idempotence

```diff
-   // 2️⃣ IDEMPOTENCE (TEMPORAIREMENT DÉSACTIVÉE)
- // const existing = await prisma.taskExecution.findUnique({
- //   where: { idempotencyKey },
- // })
- // if (existing) {
- //   return existing.response
- // }
+   // 2️⃣ IDEMPOTENCE
+   const existing = await prisma.taskExecution.findUnique({
+     where: { idempotencyKey },
+   })
+   if (existing && existing.status === 'COMPLETED') {
+     return JSON.parse(existing.response as string)
+   }
```

**3. `apps/api/src/v4/data/paymentIntents.ts`**

**Changement**: Ajouter vérification d'existence de TaskExecution

```diff
  export function createPaymentIntent(
    taskExecutionId: string,
    amount: number,
    currency: string,
    stripePaymentIntentId?: string,
  ): PaymentIntent {
+   // Vérifier que l'exécution existe
+   const execution = await prisma.taskExecution.findUnique({
+     where: { id: taskExecutionId },
+   })
+   if (!execution) {
+     throw new Error(`TASK_EXECUTION_NOT_FOUND: ${taskExecutionId}`)
+   }
+
    const intent: PaymentIntent = {
      // ...
    }
```

#### Fichiers à modifier

1. ✅ `apps/api/prisma/schema.prisma` → Ajouter modèle TaskExecution
2. ✅ `apps/api/src/v4/data/taskExecutions.ts` → Remplacer store mémoire par Prisma
3. ✅ `apps/api/src/modules/tasks/task.orchestrator.ts` → Réactiver idempotence
4. ✅ `apps/api/src/v4/data/paymentIntents.ts` → Ajouter vérification existence
5. ✅ `apps/api/src/v4/router.ts` → Adapter appels async
6. ✅ `apps/api/src/v4/engine/taskEngine.ts` → Adapter appels async

**Total**: **6 fichiers** à modifier

---

### Option 2 : Idempotence dans le store en mémoire (ALTERNATIVE)

#### Avantages
- ✅ Pas de migration Prisma
- ✅ Implémentation rapide

#### Inconvénients
- ❌ Pas de persistance (perte au redémarrage)
- ❌ Pas de cohérence Payment → Execution
- ❌ Idempotence limitée à la session serveur

#### Implémentation proposée

**Fichier**: `apps/api/src/v4/data/taskExecutions.ts`

```typescript
const executions: TaskExecution[] = []
const idempotencyMap = new Map<string, TaskExecution>() // ✅ Map pour idempotence

export function createTaskExecution(params: {
  taskId: string
  userId: string
  status: TaskExecutionStatus
  idempotencyKey?: string  // ✅ Ajout paramètre
}): TaskExecution {
  // ✅ Vérification idempotence
  if (params.idempotencyKey) {
    const existing = idempotencyMap.get(params.idempotencyKey)
    if (existing) {
      return existing
    }
  }

  const execution: TaskExecution = {
    id: crypto.randomUUID(), // ✅ UUID v4 pour unicité
    taskId: params.taskId,
    userId: params.userId,
    status: params.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  executions.push(execution)
  
  // ✅ Enregistrer dans la map d'idempotence
  if (params.idempotencyKey) {
    idempotencyMap.set(params.idempotencyKey, execution)
  }
  
  return execution
}
```

**Limitations**:
- ⚠️ Perdu au redémarrage
- ⚠️ Pas de partage entre instances (multi-instance)
- ⚠️ Pas de contrainte DB

---

## 📋 CHECKLIST DE VALIDATION

### Avant modification
- [x] Audit complet effectué
- [x] Références TaskExecution identifiées
- [x] Risques de double exécution documentés
- [x] Manque d'unicité identifié
- [x] Plan de correction défini

### Après modification (à valider)
- [ ] Modèle Prisma TaskExecution créé
- [ ] Migration Prisma appliquée
- [ ] `createTaskExecution()` utilise Prisma avec idempotence
- [ ] `task.orchestrator.ts` idempotence réactivée
- [ ] `paymentIntents.ts` vérifie existence TaskExecution
- [ ] Tous les appels async adaptés
- [ ] Tests de non-régression passés

### Tests recommandés
1. **Test idempotence** : Même `idempotencyKey` → même exécution retournée
2. **Test double requête** : Deux requêtes simultanées → une seule exécution créée
3. **Test PaymentIntent** : Vérifier que PaymentIntent ne peut pas référencer une exécution inexistante
4. **Test persistance** : Redémarrage serveur → exécutions toujours accessibles

---

## 🎯 RÉSUMÉ DU PLAN

### Option recommandée : Réintroduire Prisma

**Modifications requises**:
- **1 migration Prisma** → Créer modèle TaskExecution
- **6 fichiers** à modifier → Remplacer store mémoire par Prisma
- **~200 lignes** de code modifiées

**Bénéfices**:
- ✅ Idempotence garantie par DB
- ✅ Persistance des exécutions
- ✅ Cohérence Payment → Execution
- ✅ Traçabilité complète

**Risques**:
- ⚠️ Migration Prisma (réversible)
- ⚠️ Adaptation code async (non destructif)

### Option alternative : Store mémoire avec Map

**Modifications requises**:
- **1 fichier** à modifier → Ajouter Map d'idempotence
- **~30 lignes** de code modifiées

**Limitations**:
- ❌ Pas de persistance
- ❌ Pas de cohérence Payment → Execution
- ❌ Idempotence limitée

---

**FIN DU RAPPORT D'AUDIT TASK EXECUTION**

*Ce rapport identifie les problèmes d'idempotence et propose deux options de correction. Aucune modification n'a été effectuée. Attendre validation explicite avant implémentation.*
