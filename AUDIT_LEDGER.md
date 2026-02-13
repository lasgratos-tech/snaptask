# 🔍 AUDIT LEDGER — RAPPORT DE STABILISATION TRANSACTIONNELLE

**Date**: 13 février 2026  
**Mode**: Audit strict — Aucune modification effectuée  
**Objectif**: Stabiliser le Ledger transactionnel sans modifier le schéma Prisma

---

## 📋 TABLE DES MATIÈRES

1. [Résumé exécutif](#résumé-exécutif)
2. [Fichiers concernés](#fichiers-concernés)
3. [Implémentations Ledger identifiées](#implémentations-ledger-identifiées)
4. [Problèmes transactionnels](#problèmes-transactionnels)
5. [Risques d'incohérence](#risques-dincohérence)
6. [Utilisation actuelle](#utilisation-actuelle)
7. [Plan de correction minimal](#plan-de-correction-minimal)

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Problème principal
**Deux implémentations de débit coexistent** :
1. `ledgerRepository.debit()` → **SANS transaction Prisma** ⚠️
2. `debitAccount()` → **AVEC transaction Prisma** ✅

### Impact
- **Risque critique** : Incohérence de balance si `ledgerEvent.create()` réussit mais `ledgerAccount.update()` échoue
- **Utilisation incohérente** : 3 fichiers utilisent la version non transactionnelle
- **Race condition** : Possibilité de débits simultanés sans vérification atomique

### Solution proposée
**Unifier vers `ledger.store.ts`** (déjà transactionnel) en modifiant uniquement `ledger.repository.ts` pour utiliser `prisma.$transaction()`.

---

## 📁 FICHIERS CONCERNÉS

### Fichiers Ledger principaux

| Fichier | Rôle | Status |
|---------|------|--------|
| `apps/api/src/ledger/ledger.repository.ts` | Repository avec `debit()` **SANS transaction** | ⚠️ À corriger |
| `apps/api/src/ledger/ledger.store.ts` | Store avec `debitAccount()` **AVEC transaction** | ✅ Correct |
| `apps/api/src/ledger/ledger.routes.ts` | Routes HTTP Ledger | ✅ Utilise `ledger.store.ts` |
| `apps/api/src/ledger/ledger.service.ts` | Service wrapper (non utilisé) | ⚠️ Code mort |
| `apps/api/src/ledger/compensation.service.ts` | Service de compensation | ⚠️ Référence méthode inexistante |
| `apps/api/src/ledger/ledger.history.ts` | Historique (lecture seule) | ✅ OK |
| `apps/api/src/ledger/ledger.types.ts` | Types TypeScript | ✅ OK |

### Fichiers utilisant le Ledger

| Fichier | Méthode utilisée | Ligne | Status |
|---------|------------------|-------|--------|
| `modules/tasks/task.orchestrator.ts` | `ledgerRepository.debit()` | 57 | ⚠️ **NON transactionnel** |
| `http/routes/cvInstant.routes.ts` | `ledgerRepository.debit()` | 46 | ⚠️ **NON transactionnel** |
| `modules/tasks/tasks.controller.ts` | `debitAccount()` | 32 | ✅ Transactionnel |
| `ledger/ledger.routes.ts` | `creditAccount()` | 64 | ✅ Transactionnel |
| `ledger/ledger.routes.ts` | `ledgerRepository.getBalance()` | 24, 68, 84 | ✅ Lecture seule |

---

## 🔧 IMPLÉMENTATIONS LEDGER IDENTIFIÉES

### 1. LedgerRepository (`ledger.repository.ts`)

**Classe**: `LedgerRepository`  
**Export**: `ledgerRepository` (singleton)

#### Méthodes disponibles

**`getBalance(owner: string)`**
```typescript
async getBalance(owner: string): Promise<number> {
  const account = await prisma.ledgerAccount.findUnique({ where: { owner } })
  return account?.balance ?? 0
}
```
- ✅ **Status**: Lecture seule, pas de risque transactionnel

**`debit(params)`** ⚠️ **PROBLÈME**
```typescript
async debit(params: {
  userId: string
  amountCents: number
  currency: string
  idempotencyKey: string
  reason: string
}) {
  const { userId, amountCents } = params

  // ❌ ÉTAPE 1 : Création événement (sans transaction)
  await prisma.ledgerEvent.create({
    data: {
      owner: userId,
      amount: amountCents,
      reason: params.reason,
      type: 'DEBIT',
    },
  })

  // ❌ ÉTAPE 2 : Mise à jour balance (sans transaction)
  await prisma.ledgerAccount.update({
    where: { owner: userId },
    data: {
      balance: { decrement: amountCents },
    },
  })
}
```

**Problèmes identifiés**:
1. ❌ **Pas de transaction Prisma** → Risque d'incohérence
2. ❌ **Pas de vérification de solde** → Peut créer un solde négatif
3. ❌ **Pas de vérification d'existence du compte** → Peut échouer si compte inexistant
4. ❌ **Race condition** → Deux débits simultanés peuvent passer la vérification de solde

### 2. LedgerStore (`ledger.store.ts`)

**Fonctions exportées**: `getAccount()`, `creditAccount()`, `debitAccount()`

#### `creditAccount(owner, amount, reason)` ✅

```typescript
export async function creditAccount(
  owner: string,
  amount: number,
  reason: string
) {
  await prisma.$transaction(async (tx) => {
    // ✅ Upsert atomique
    const account = await tx.ledgerAccount.upsert({
      where: { owner },
      update: { balance: { increment: amount } },
      create: { owner, balance: amount },
    })

    // ✅ Création événement dans la même transaction
    await tx.ledgerEvent.create({
      data: { owner, amount, reason, type: 'CREDIT' },
    })

    return account
  })
}
```

**Status**: ✅ **Correct** — Transaction atomique, upsert sécurisé

#### `debitAccount(owner, amount, reason)` ✅

```typescript
export async function debitAccount(
  owner: string,
  amount: number,
  reason: string
) {
  await prisma.$transaction(async (tx) => {
    // ✅ Vérification solde dans la transaction
    const account = await tx.ledgerAccount.findUnique({
      where: { owner },
    })

    if (!account || account.balance < amount) {
      throw new Error('INSUFFICIENT_CREDITS')
    }

    // ✅ Mise à jour balance dans la transaction
    await tx.ledgerAccount.update({
      where: { owner },
      data: { balance: { decrement: amount } },
    })

    // ✅ Création événement dans la même transaction
    await tx.ledgerEvent.create({
      data: { owner, amount, reason, type: 'DEBIT' },
    })
  })
}
```

**Status**: ✅ **Correct** — Transaction atomique, vérification de solde, gestion d'erreur

### 3. LedgerService (`ledger.service.ts`) ⚠️

```typescript
export class LedgerService {
  private repo = new LedgerRepository()

  async write(input: Parameters<LedgerRepository['create']>[0]) {
    return this.repo.create(input) // ❌ Méthode 'create' n'existe pas
  }
}
```

**Status**: ⚠️ **Code mort** — Référence une méthode `create()` qui n'existe pas dans `LedgerRepository`

### 4. CompensationService (`compensation.service.ts`) ⚠️

```typescript
export class CompensationService {
  private ledger = new LedgerRepository()

  async compensate(...) {
    // ...
    return await this.ledger.create(input) // ❌ Méthode 'create' n'existe pas
  }
}
```

**Status**: ⚠️ **Code mort** — Référence une méthode `create()` qui n'existe pas

---

## ⚠️ PROBLÈMES TRANSACTIONNELS

### Problème #1 : `ledgerRepository.debit()` sans transaction

**Fichier**: `apps/api/src/ledger/ledger.repository.ts`  
**Lignes**: 22-48

**Scénario de corruption**:

```
Temps T1: ledgerEvent.create() → ✅ SUCCÈS (événement créé)
Temps T2: [CRASH SERVEUR / ERREUR DB / TIMEOUT]
Temps T3: ledgerAccount.update() → ❌ ÉCHEC (balance non mise à jour)
```

**Résultat**: 
- Événement DEBIT enregistré dans la DB
- Balance **non débitée**
- **Incohérence permanente** : `SUM(ledgerEvent.amount WHERE type='DEBIT')` ≠ `ledgerAccount.balance`

### Problème #2 : Pas de vérification de solde

**Fichier**: `apps/api/src/ledger/ledger.repository.ts`  
**Ligne**: 40-47

**Scénario**:
```typescript
// Balance actuelle = 100
await ledgerRepository.debit({ amountCents: 200, ... })
// Résultat: balance = -100 (solde négatif possible)
```

**Comparaison avec `debitAccount()`**:
```typescript
// ✅ Vérifie le solde AVANT le débit
if (!account || account.balance < amount) {
  throw new Error('INSUFFICIENT_CREDITS')
}
```

### Problème #3 : Pas de vérification d'existence du compte

**Fichier**: `apps/api/src/ledger/ledger.repository.ts`  
**Ligne**: 40

**Scénario**:
```typescript
// Compte n'existe pas encore
await ledgerRepository.debit({ userId: 'new-user', amountCents: 100, ... })
// ❌ ERREUR: Record to update not found
```

**Comparaison avec `creditAccount()`**:
```typescript
// ✅ Utilise upsert pour créer si inexistant
await tx.ledgerAccount.upsert({ ... })
```

### Problème #4 : Race condition sur vérification de solde

**Fichier**: `apps/api/src/modules/tasks/task.orchestrator.ts`  
**Lignes**: 47-63

**Scénario de race condition**:

```
Thread A: balance = await ledgerRepository.getBalance(user) → 100
Thread B: balance = await ledgerRepository.getBalance(user) → 100
Thread A: if (balance < 200) → ✅ PASS (100 < 200 = false)
Thread B: if (balance < 200) → ✅ PASS (100 < 200 = false)
Thread A: await ledgerRepository.debit({ amountCents: 200 }) → balance = -100
Thread B: await ledgerRepository.debit({ amountCents: 200 }) → balance = -300
```

**Résultat**: Deux débits simultanés passent la vérification, solde devient négatif

**Comparaison avec `debitAccount()`**:
```typescript
// ✅ Vérification ET débit dans la même transaction atomique
await prisma.$transaction(async (tx) => {
  const account = await tx.ledgerAccount.findUnique({ ... })
  if (account.balance < amount) throw Error(...)
  await tx.ledgerAccount.update({ ... })
})
```

---

## 🔴 RISQUES D'INCOHÉRENCE

### Risque #1 : Incohérence balance vs événements (CRITIQUE)

**Probabilité**: Moyenne  
**Impact**: Critique  
**Sévérité**: 🔴 **CRITIQUE**

**Description**:
Si `ledgerEvent.create()` réussit mais `ledgerAccount.update()` échoue, la balance ne reflète plus la somme des événements.

**Détection**:
```sql
-- Requête de vérification d'incohérence
SELECT 
  la.owner,
  la.balance as account_balance,
  COALESCE(SUM(CASE WHEN le.type = 'CREDIT' THEN le.amount ELSE -le.amount END), 0) as calculated_balance,
  la.balance - COALESCE(SUM(CASE WHEN le.type = 'CREDIT' THEN le.amount ELSE -le.amount END), 0) as discrepancy
FROM "LedgerAccount" la
LEFT JOIN "LedgerEvent" le ON le.owner = la.owner
GROUP BY la.owner, la.balance
HAVING la.balance != COALESCE(SUM(CASE WHEN le.type = 'CREDIT' THEN le.amount ELSE -le.amount END), 0);
```

**Correction manuelle requise** si incohérence détectée.

### Risque #2 : Solde négatif (MOYEN)

**Probabilité**: Faible (si vérification externe présente)  
**Impact**: Moyen  
**Sévérité**: 🟡 **MOYEN**

**Description**:
`ledgerRepository.debit()` ne vérifie pas le solde avant débit. Si la vérification externe échoue (race condition), solde peut devenir négatif.

**Impact**:
- Utilisateur avec solde négatif peut continuer à utiliser le service
- Problème comptable

### Risque #3 : Échec silencieux (MOYEN)

**Probabilité**: Faible  
**Impact**: Moyen  
**Sévérité**: 🟡 **MOYEN**

**Description**:
Si le compte n'existe pas, `ledgerAccount.update()` échoue avec erreur Prisma. L'événement est déjà créé, mais la balance n'est pas mise à jour.

**Impact**:
- Erreur non gérée peut causer un crash
- Événement orphelin dans la DB

---

## 📊 UTILISATION ACTUELLE

### Utilisation de `ledgerRepository.debit()` (NON transactionnel) ⚠️

| Fichier | Ligne | Contexte | Risque |
|---------|-------|----------|--------|
| `modules/tasks/task.orchestrator.ts` | 57 | Débit après exécution de tâche | 🔴 Critique (production) |
| `http/routes/cvInstant.routes.ts` | 46 | Débit après génération CV | 🔴 Critique (production) |

**Total**: 2 fichiers utilisent la version non transactionnelle

### Utilisation de `debitAccount()` (transactionnel) ✅

| Fichier | Ligne | Contexte | Status |
|---------|-------|----------|--------|
| `modules/tasks/tasks.controller.ts` | 32 | Débit avant exécution tâche | ✅ Correct |

**Total**: 1 fichier utilise la version transactionnelle

### Utilisation de `creditAccount()` (transactionnel) ✅

| Fichier | Ligne | Contexte | Status |
|---------|-------|----------|--------|
| `ledger/ledger.routes.ts` | 64 | Crédit admin (dev only) | ✅ Correct |

**Total**: 1 fichier utilise la version transactionnelle

### Utilisation de `getBalance()` (lecture seule) ✅

| Fichier | Ligne | Contexte | Status |
|---------|-------|----------|--------|
| `ledger/ledger.routes.ts` | 24, 68, 84 | Affichage balance | ✅ Correct |
| `modules/tasks/task.orchestrator.ts` | 48 | Vérification avant débit | ✅ Correct (mais race condition possible) |
| `http/routes/cvInstant.routes.ts` | 36 | Vérification avant débit | ✅ Correct (mais race condition possible) |

**Total**: 3 fichiers utilisent `getBalance()`

---

## 🛠️ PLAN DE CORRECTION MINIMAL

### Objectif
Rendre `ledgerRepository.debit()` transactionnel **sans modifier l'API existante**, pour que les fichiers qui l'utilisent bénéficient automatiquement de la transaction.

### Principe
**Modification minimale** : Ajouter `prisma.$transaction()` autour des opérations dans `ledgerRepository.debit()`.

### Fichiers à modifier

#### 1. `apps/api/src/ledger/ledger.repository.ts` ⚠️ **MODIFICATION REQUISE**

**Changement** : Ajouter transaction Prisma + vérification de solde

**Diff prévu** :

```diff
  async debit(params: {
    userId: string
    amountCents: number
    currency: string
    idempotencyKey: string
    reason: string
  }) {
-   const { userId, amountCents } = params
-
-   await prisma.ledgerEvent.create({
-     data: {
-       owner: userId,
-       amount: amountCents,
-       reason: params.reason,
-       type: 'DEBIT',
-     },
-   })
-
-   await prisma.ledgerAccount.update({
-     where: { owner: userId },
-     data: {
-       balance: {
-         decrement: amountCents,
-       },
-     },
-   })
+   const { userId, amountCents } = params
+
+   await prisma.$transaction(async (tx) => {
+     // Vérifier l'existence du compte et le solde
+     const account = await tx.ledgerAccount.findUnique({
+       where: { owner: userId },
+     })
+
+     if (!account) {
+       throw new Error('ACCOUNT_NOT_FOUND')
+     }
+
+     if (account.balance < amountCents) {
+       throw new Error('INSUFFICIENT_CREDITS')
+     }
+
+     // Mise à jour balance dans la transaction
+     await tx.ledgerAccount.update({
+       where: { owner: userId },
+       data: {
+         balance: {
+           decrement: amountCents,
+         },
+       },
+     })
+
+     // Création événement dans la même transaction
+     await tx.ledgerEvent.create({
+       data: {
+         owner: userId,
+         amount: amountCents,
+         reason: params.reason,
+         type: 'DEBIT',
+       },
+     })
+   })
  }
```

**Impact** :
- ✅ `task.orchestrator.ts` bénéficie automatiquement de la transaction
- ✅ `cvInstant.routes.ts` bénéficie automatiquement de la transaction
- ✅ API inchangée (même signature de méthode)
- ✅ Pas de modification des fichiers appelants

**Risques** :
- ⚠️ Nouvelle erreur `ACCOUNT_NOT_FOUND` peut casser le code existant si compte non créé
- ✅ Erreur `INSUFFICIENT_CREDITS` déjà gérée dans `tasks.controller.ts` (compatible)

**Alternative (plus sûre)** : Utiliser `upsert` pour créer le compte si inexistant :

```typescript
await prisma.$transaction(async (tx) => {
  // Créer le compte s'il n'existe pas (balance = 0)
  const account = await tx.ledgerAccount.upsert({
    where: { owner: userId },
    update: {},
    create: {
      owner: userId,
      balance: 0,
      updatedAt: new Date(),
    },
  })

  if (account.balance < amountCents) {
    throw new Error('INSUFFICIENT_CREDITS')
  }

  // ... reste identique
})
```

**Recommandation** : Utiliser `upsert` pour éviter `ACCOUNT_NOT_FOUND`.

### Fichiers à vérifier (pas de modification)

#### 2. `apps/api/src/modules/tasks/task.orchestrator.ts` ✅ **VÉRIFICATION**

**Lignes concernées**: 47-63

**Vérification** : S'assurer que l'erreur `INSUFFICIENT_CREDITS` est bien propagée (déjà le cas).

**Status actuel** :
```typescript
// Ligne 48-50: Vérification externe (race condition possible)
const balance = await ledgerRepository.getBalance(key.userId)
if (balance < pricing.amountCents) {
  throw new Error('INSUFFICIENT_FUNDS')
}

// Ligne 57: Débit (maintenant transactionnel après correction)
await ledgerRepository.debit({ ... })
```

**Note** : La vérification externe reste utile pour éviter l'appel inutile à `debit()`, mais la vérification finale dans `debit()` garantit l'atomicité.

#### 3. `apps/api/src/http/routes/cvInstant.routes.ts` ✅ **VÉRIFICATION**

**Lignes concernées**: 35-52

**Vérification** : S'assurer que l'erreur `INSUFFICIENT_CREDITS` est bien gérée (déjà le cas via vérification externe).

**Status actuel** :
```typescript
// Ligne 36-44: Vérification externe
const balance = await ledgerRepository.getBalance(user.owner)
if (balance < amountCents) {
  return reply.status(402).send({ error: 'INSUFFICIENT_FUNDS' })
}

// Ligne 46: Débit (maintenant transactionnel après correction)
await ledgerRepository.debit({ ... })
```

### Fichiers à nettoyer (optionnel, non critique)

#### 4. `apps/api/src/ledger/ledger.service.ts` ⚠️ **CODE MORT**

**Action recommandée** : Supprimer ou commenter (non critique pour la stabilisation transactionnelle).

#### 5. `apps/api/src/ledger/compensation.service.ts` ⚠️ **CODE MORT**

**Action recommandée** : Vérifier si utilisé, sinon supprimer ou corriger (non critique pour la stabilisation transactionnelle).

---

## 📋 CHECKLIST DE VALIDATION

### Avant modification
- [x] Audit complet effectué
- [x] Fichiers concernés identifiés
- [x] Risques évalués
- [x] Plan de correction défini
- [x] Diff prévu documenté

### Après modification (à valider)
- [ ] `ledgerRepository.debit()` utilise `prisma.$transaction()`
- [ ] Vérification de solde dans la transaction
- [ ] Gestion du compte inexistant (upsert ou erreur)
- [ ] Tests de non-régression sur `task.orchestrator.ts`
- [ ] Tests de non-régression sur `cvInstant.routes.ts`
- [ ] Vérification que `debitAccount()` reste fonctionnel
- [ ] Vérification que `creditAccount()` reste fonctionnel

### Tests recommandés
1. **Test transaction atomique** : Vérifier que si `ledgerEvent.create()` échoue, `ledgerAccount.update()` n'est pas exécuté
2. **Test solde insuffisant** : Vérifier que `INSUFFICIENT_CREDITS` est levé avant modification
3. **Test compte inexistant** : Vérifier le comportement (upsert ou erreur)
4. **Test race condition** : Vérifier que deux débits simultanés sont gérés correctement

---

## 🎯 RÉSUMÉ DU PLAN

### Modification minimale requise

**1 fichier à modifier** :
- `apps/api/src/ledger/ledger.repository.ts` → Ajouter `prisma.$transaction()` + vérification solde

### Bénéfices immédiats

✅ **2 fichiers** (`task.orchestrator.ts`, `cvInstant.routes.ts`) bénéficient automatiquement de la transaction  
✅ **API inchangée** → Pas de modification des fichiers appelants  
✅ **Cohérence garantie** → Balance et événements toujours synchronisés  
✅ **Protection race condition** → Vérification atomique dans la transaction  

### Risques minimaux

⚠️ Nouvelle erreur `ACCOUNT_NOT_FOUND` si compte inexistant (résolu avec `upsert`)  
⚠️ Erreur `INSUFFICIENT_CREDITS` déjà gérée dans le code existant  

### Impact

- **Fichiers modifiés** : 1
- **Fichiers bénéficiaires** : 2 (automatique)
- **Lignes de code modifiées** : ~15 lignes
- **Risque de régression** : Faible (API inchangée)
- **Temps estimé** : 15 minutes

---

**FIN DU RAPPORT D'AUDIT LEDGER**

*Ce rapport identifie les problèmes transactionnels et propose une correction minimale. Aucune modification n'a été effectuée. Attendre validation explicite avant implémentation.*
