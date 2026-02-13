# 🔍 AUDIT AUTH CONSOLIDATION — RAPPORT DE CONSOLIDATION

**Date**: 13 février 2026  
**Mode**: Audit strict — Aucune modification effectuée  
**Objectif**: Unifier les middlewares d'authentification sans suppression brutale

---

## 📋 TABLE DES MATIÈRES

1. [Résumé exécutif](#résumé-exécutif)
2. [Liste des middlewares auth](#liste-des-middlewares-auth)
3. [Utilisation actuelle](#utilisation-actuelle)
4. [Duplication logique](#duplication-logique)
5. [Risques actuels](#risques-actuels)
6. [Stratégie de consolidation progressive](#stratégie-de-consolidation-progressive)
7. [Plan de rollback](#plan-de-rollback)

---

## 🎯 RÉSUMÉ EXÉCUTIF

### État actuel
**4 middlewares d'authentification** identifiés :
- ✅ **1 utilisé** : `apiKeyAuthMiddleware` (production)
- ❌ **3 non utilisés** : `authMiddleware`, `apiKeyAuth`, `requireApiKey` (code mort)

### Problèmes identifiés
- 🔴 **Code mort** : 3 fichiers non utilisés créent confusion
- 🟡 **Duplication** : Logique similaire répétée dans 4 fichiers
- 🟡 **Incohérence** : Comportements différents (codes HTTP, gestion erreurs)
- 🟡 **Maintenance** : Modifications nécessaires dans plusieurs fichiers

### Solution proposée
**Consolidation progressive** vers `apiKeyAuthMiddleware` (déjà utilisé) :
1. Marquer les fichiers non utilisés comme dépréciés (commentaires)
2. Vérifier qu'aucune référence cachée n'existe
3. Supprimer progressivement après période de grâce

**Impact** : 3 fichiers à nettoyer, 0 modification du code actif

---

## 🔐 LISTE DES MIDDLEWARES AUTH

### 1. `apiKeyAuthMiddleware` ✅ **UTILISÉ**

**Fichier**: `apps/api/src/auth/apiKey.middleware.ts`  
**Lignes**: 1-65  
**Status**: ✅ **Production actif**

**Fonctionnalités**:
- ✅ Support `x-api-key` header
- ✅ Support `Authorization: Bearer <key>` header
- ✅ Gestion bootstrap founder (dev only)
- ✅ Utilise `findApiKey()` de `apiKey.store.js`
- ✅ Ajoute `role` à `request.user`
- ✅ Logging dev (nombre de clés)
- ✅ Gestion erreurs complète

**Code**:
```typescript
export async function apiKeyAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const rawKey =
    request.headers['x-api-key'] ??
    request.headers.authorization?.replace('Bearer ', '')

  const apiKey = Array.isArray(rawKey) ? rawKey[0] : rawKey

  if (!apiKey) {
    return reply.status(401).send({
      error: 'API_KEY_MISSING',
      message: 'Missing x-api-key header',
    })
  }

  // Bootstrap founder (dev only)
  if (process.env.NODE_ENV === 'development') {
    const isBootstrapRoute =
      request.method === 'POST' && request.url === '/admin/bootstrap/founder'
    if (
      isBootstrapRoute &&
      process.env.FOUNDER_BOOTSTRAP_KEY &&
      apiKey === process.env.FOUNDER_BOOTSTRAP_KEY
    ) {
      const founderCount = await countFounderKeys()
      if (founderCount === 0) {
        request.user = {
          apiKey,
          owner: 'founder',
          role: 'founder',
        }
        return
      }
    }
  }

  const record = await findApiKey(apiKey)

  if (!record) {
    return reply.status(401).send({
      error: 'INVALID_API_KEY',
      message: 'Invalid or revoked API key',
    })
  }

  request.user = {
    apiKey: record.key,
    owner: record.owner,
    role: record.role,
  }
}
```

**Utilisation**:
- `apps/api/src/index.ts` ligne 350 : Hook global sur routes protégées

---

### 2. `authMiddleware` ❌ **NON UTILISÉ**

**Fichier**: `apps/api/src/http/middlewares/auth.middleware.ts`  
**Lignes**: 1-40  
**Status**: ❌ **Code mort / Incomplet**

**Problèmes identifiés**:
- ❌ **Import manquant** : `prisma` utilisé ligne 15 mais import ligne 1 incorrect
- ❌ **Code incomplet** : Ligne 33 commentaire "LedgerService not available"
- ❌ **Pas de support** `Authorization: Bearer`
- ❌ **Pas de gestion** bootstrap founder
- ❌ **Pas de `role`** dans `request.user`
- ❌ **Code HTTP différent** : `reply.code(401)` vs `reply.status(401)`

**Code**:
```typescript
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey) {
    return reply.code(401).send({ error: 'API_KEY_MISSING' });
  }

  const key = await prisma.apiKey.findUnique({  // ⚠️ Import incorrect
    where: { key: Array.isArray(apiKey) ? apiKey[0] : apiKey },
  });

  if (!key || key.revokedAt) {
    return reply.code(401).send({ error: 'API_KEY_INVALID' });
  }

  // ⚠️ Code incomplet
  // LedgerService not available in this scope (stabilisation)

  request.user = {
    apiKey: key.key,
    owner: key.owner,
    // ❌ Pas de role
  };
}
```

**Utilisation**: ❌ **Aucune référence trouvée**

---

### 3. `apiKeyAuth` ❌ **NON UTILISÉ**

**Fichier**: `apps/api/src/http/middlewares/apiKeyAuth.ts`  
**Lignes**: 1-27  
**Status**: ❌ **Code mort**

**Problèmes identifiés**:
- ❌ **Pas de support** `Authorization: Bearer`
- ❌ **Pas de gestion** bootstrap founder
- ❌ **Pas de `role`** dans `request.user`
- ❌ **Validation stricte** : `typeof apiKey !== 'string'` (peut casser si array)
- ❌ **Utilise directement Prisma** au lieu de `findApiKey()`

**Code**:
```typescript
export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {  // ⚠️ Peut casser si array
    return reply.status(401).send({ error: 'API_KEY_MISSING' });
  }

  const key = await prisma.apiKey.findUnique({  // ⚠️ Direct Prisma
    where: { key: apiKey },
  });

  if (!key || key.revokedAt) {
    return reply.status(401).send({ error: 'API_KEY_INVALID' });
  }

  request.user = { apiKey: key.key, owner: key.owner };  // ❌ Pas de role
}
```

**Utilisation**: ❌ **Aucune référence trouvée**

---

### 4. `requireApiKey` ❌ **NON UTILISÉ**

**Fichier**: `apps/api/src/auth/apiKey.guard.ts`  
**Lignes**: 1-30  
**Status**: ❌ **Code mort**

**Problèmes identifiés**:
- ❌ **Code HTTP différent** : Retourne `403` au lieu de `401`
- ❌ **Pas de support** `Authorization: Bearer`
- ❌ **Pas de gestion** bootstrap founder
- ❌ **Pas de `role`** dans `request.user`
- ✅ Utilise `findApiKey()` (bonne pratique)

**Code**:
```typescript
export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const apiKey = request.headers['x-api-key']

  if (!apiKey || typeof apiKey !== 'string') {
    return reply.status(401).send({
      error: 'API_KEY_MISSING',
      message: 'Missing x-api-key header',
    })
  }

  const record = await findApiKey(apiKey)

  if (!record) {
    return reply.status(403).send({  // ⚠️ 403 au lieu de 401
      error: 'API_KEY_INVALID',
      message: 'Invalid or inactive API key',
    })
  }

  request.user = {
    apiKey: record.key,
    owner: record.owner,
    // ❌ Pas de role
  }
}
```

**Utilisation**: ❌ **Aucune référence trouvée**

---

## 📊 UTILISATION ACTUELLE

### Middleware utilisé

| Middleware | Fichier | Ligne | Usage |
|------------|---------|-------|-------|
| `apiKeyAuthMiddleware` | `apps/api/src/index.ts` | 11 (import), 350 (hook) | ✅ Hook global sur routes protégées |

**Routes protégées**:
- `/admin/*` (apiKeyAdminRoutes)
- `/billing/*` (billingRoutes)
- `/ledger/*` (ledgerRoutes)
- `/v1/tasks/*` (bootstrapRoutes)
- `/v4/*` (registerV4Routes)

### Middlewares non utilisés

| Middleware | Fichier | Références | Status |
|------------|---------|------------|--------|
| `authMiddleware` | `http/middlewares/auth.middleware.ts` | 0 | ❌ Code mort |
| `apiKeyAuth` | `http/middlewares/apiKeyAuth.ts` | 0 | ❌ Code mort |
| `requireApiKey` | `auth/apiKey.guard.ts` | 0 | ❌ Code mort |

**Vérification**:
```bash
# Aucune référence trouvée dans le codebase
grep -r "authMiddleware\|apiKeyAuth\|requireApiKey" apps/api/src
# Résultat: 0 import, 0 utilisation
```

---

## 🔄 DUPLICATION LOGIQUE

### Comparaison des fonctionnalités

| Fonctionnalité | `apiKeyAuthMiddleware` | `authMiddleware` | `apiKeyAuth` | `requireApiKey` |
|----------------|------------------------|-----------------|--------------|-----------------|
| Support `x-api-key` | ✅ | ✅ | ✅ | ✅ |
| Support `Authorization: Bearer` | ✅ | ❌ | ❌ | ❌ |
| Bootstrap founder (dev) | ✅ | ❌ | ❌ | ❌ |
| Utilise `findApiKey()` | ✅ | ❌ | ❌ | ✅ |
| Ajoute `role` à `user` | ✅ | ❌ | ❌ | ❌ |
| Gestion erreurs complète | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Code HTTP cohérent | ✅ | ⚠️ | ✅ | ⚠️ (403) |
| Logging dev | ✅ | ❌ | ❌ | ❌ |
| **Status** | ✅ **Production** | ❌ **Mort** | ❌ **Mort** | ❌ **Mort** |

### Logique dupliquée

**1. Extraction de la clé API**
```typescript
// apiKeyAuthMiddleware (complet)
const rawKey = request.headers['x-api-key'] ?? 
               request.headers.authorization?.replace('Bearer ', '')
const apiKey = Array.isArray(rawKey) ? rawKey[0] : rawKey

// authMiddleware (incomplet)
const apiKey = request.headers['x-api-key'];

// apiKeyAuth (incomplet)
const apiKey = request.headers['x-api-key'];

// requireApiKey (incomplet)
const apiKey = request.headers['x-api-key']
```

**2. Vérification de la clé**
```typescript
// apiKeyAuthMiddleware (utilise store)
const record = await findApiKey(apiKey)

// authMiddleware (direct Prisma)
const key = await prisma.apiKey.findUnique({ where: { key } })

// apiKeyAuth (direct Prisma)
const key = await prisma.apiKey.findUnique({ where: { key } })

// requireApiKey (utilise store)
const record = await findApiKey(apiKey)
```

**3. Vérification révoquée**
```typescript
// apiKeyAuthMiddleware (dans findApiKey)
// findApiKey() filtre déjà revokedAt: null

// authMiddleware (manuelle)
if (!key || key.revokedAt) { ... }

// apiKeyAuth (manuelle)
if (!key || key.revokedAt) { ... }

// requireApiKey (dans findApiKey)
// findApiKey() filtre déjà revokedAt: null
```

**4. Attribution à request.user**
```typescript
// apiKeyAuthMiddleware (complet)
request.user = {
  apiKey: record.key,
  owner: record.owner,
  role: record.role,  // ✅
}

// authMiddleware (incomplet)
request.user = {
  apiKey: key.key,
  owner: key.owner,
  // ❌ Pas de role
}

// apiKeyAuth (incomplet)
request.user = { apiKey: key.key, owner: key.owner }

// requireApiKey (incomplet)
request.user = {
  apiKey: record.key,
  owner: record.owner,
  // ❌ Pas de role
}
```

---

## ⚠️ RISQUES ACTUELS

### Risque #1 : Confusion pour les développeurs

**Probabilité**: Moyenne  
**Impact**: Moyen  
**Sévérité**: 🟡 **MOYEN**

**Description**:
4 fichiers avec des noms similaires créent de la confusion :
- `apiKey.middleware.ts` (utilisé)
- `auth.middleware.ts` (mort)
- `apiKeyAuth.ts` (mort)
- `apiKey.guard.ts` (mort)

**Impact**:
- Développeur peut utiliser le mauvais middleware
- Code mort peut être réactivé par erreur
- Maintenance difficile

### Risque #2 : Code mort réactivé par erreur

**Probabilité**: Faible  
**Impact**: Critique  
**Sévérité**: 🔴 **CRITIQUE**

**Description**:
Si un développeur importe `authMiddleware` ou `apiKeyAuth` par erreur, il obtient :
- Pas de support `Authorization: Bearer`
- Pas de `role` dans `request.user`
- Comportement différent

**Scénario**:
```typescript
// Erreur: Import du mauvais middleware
import { authMiddleware } from './http/middlewares/auth.middleware.js'

app.addHook('preHandler', authMiddleware)  // ⚠️ Code mort réactivé
```

**Impact**:
- Routes protégées cassées
- `request.user.role` undefined → Guards RBAC cassés
- Support `Authorization: Bearer` perdu

### Risque #3 : Maintenance dupliquée

**Probabilité**: Moyenne  
**Impact**: Faible  
**Sévérité**: 🟢 **MINEUR**

**Description**:
Si une modification est nécessaire (ex: nouveau header), elle doit être faite dans 4 fichiers.

**Impact**:
- Temps de développement augmenté
- Risque d'oubli de mise à jour
- Tests nécessaires sur plusieurs fichiers

### Risque #4 : Incohérence des codes HTTP

**Probabilité**: Faible  
**Impact**: Faible  
**Sévérité**: 🟢 **MINEUR**

**Description**:
- `apiKeyAuthMiddleware` : `401` (correct)
- `requireApiKey` : `403` (incorrect pour auth)
- `authMiddleware` : `401` mais `reply.code()` au lieu de `reply.status()`

**Impact**:
- Comportement différent selon middleware utilisé
- Confusion pour les clients API

---

## 🛠️ STRATÉGIE DE CONSOLIDATION PROGRESSIVE

### Principe
**Consolidation progressive sans rupture** :
1. ✅ Vérifier qu'aucune référence cachée n'existe
2. ✅ Marquer les fichiers comme dépréciés (commentaires)
3. ✅ Période de grâce (1 semaine)
4. ✅ Suppression après validation

### Phase 1 : Marquage déprécié (SÉCURISÉ)

**Objectif**: Marquer les fichiers non utilisés comme dépréciés sans les supprimer

**Fichiers à modifier**: **3 fichiers** (max autorisé)

#### 1. `apps/api/src/http/middlewares/auth.middleware.ts`

**Action**: Ajouter commentaire de dépréciation en haut du fichier

**Diff prévu**:
```diff
+ /**
+  * @deprecated This middleware is not used and will be removed.
+  * Use `apiKeyAuthMiddleware` from `auth/apiKey.middleware.ts` instead.
+  * 
+  * Reasons for deprecation:
+  * - Not imported anywhere in the codebase
+  * - Incomplete implementation (missing role, no Bearer support)
+  * - Direct Prisma usage instead of apiKey.store
+  * 
+  * Migration: Replace imports with:
+  *   import { apiKeyAuthMiddleware } from '../auth/apiKey.middleware.js'
+  */
  import prisma from '../../prisma/client.js'
  import type { FastifyRequest, FastifyReply } from 'fastify';

  export async function authMiddleware(
```

**Impact**: ✅ Aucun impact sur le code actif (fichier non utilisé)

#### 2. `apps/api/src/http/middlewares/apiKeyAuth.ts`

**Action**: Ajouter commentaire de dépréciation en haut du fichier

**Diff prévu**:
```diff
+ /**
+  * @deprecated This middleware is not used and will be removed.
+  * Use `apiKeyAuthMiddleware` from `auth/apiKey.middleware.ts` instead.
+  * 
+  * Reasons for deprecation:
+  * - Not imported anywhere in the codebase
+  * - Missing features: Bearer support, role, bootstrap founder
+  * - Direct Prisma usage instead of apiKey.store
+  * 
+  * Migration: Replace imports with:
+  *   import { apiKeyAuthMiddleware } from '../auth/apiKey.middleware.js'
+  */
  import type { FastifyRequest, FastifyReply } from 'fastify';
  import prisma from '../../prisma/client.js'

  export async function apiKeyAuth(
```

**Impact**: ✅ Aucun impact sur le code actif (fichier non utilisé)

#### 3. `apps/api/src/auth/apiKey.guard.ts`

**Action**: Ajouter commentaire de dépréciation en haut du fichier

**Diff prévu**:
```diff
+ /**
+  * @deprecated This guard is not used and will be removed.
+  * Use `apiKeyAuthMiddleware` from `auth/apiKey.middleware.ts` instead.
+  * 
+  * Reasons for deprecation:
+  * - Not imported anywhere in the codebase
+  * - Missing features: Bearer support, role, bootstrap founder
+  * - Returns 403 instead of 401 (incorrect for authentication)
+  * 
+  * Migration: Replace imports with:
+  *   import { apiKeyAuthMiddleware } from './apiKey.middleware.js'
+  */
  import type { FastifyReply, FastifyRequest } from 'fastify'
  import { findApiKey } from './apiKey.store.js'

  export async function requireApiKey(
```

**Impact**: ✅ Aucun impact sur le code actif (fichier non utilisé)

### Phase 2 : Vérification (après Phase 1)

**Objectif**: Vérifier qu'aucune référence n'a été ajoutée pendant la période de grâce

**Action**: 
- Relancer `grep` pour vérifier qu'aucun import n'a été ajouté
- Vérifier les logs de build/CI pour erreurs

**Durée**: 1 semaine après Phase 1

### Phase 3 : Suppression (après validation)

**Objectif**: Supprimer les fichiers dépréciés après validation

**Fichiers à supprimer**:
1. `apps/api/src/http/middlewares/auth.middleware.ts`
2. `apps/api/src/http/middlewares/apiKeyAuth.ts`
3. `apps/api/src/auth/apiKey.guard.ts`

**Action**: Suppression simple des fichiers

**Impact**: ✅ Aucun impact (fichiers non utilisés)

---

## 🔄 PLAN DE ROLLBACK

### Scénario de rollback

Si un problème est détecté après Phase 1 (marquage déprécié) :

**Rollback immédiat**:
1. Retirer les commentaires `@deprecated` des 3 fichiers
2. Vérifier que le code fonctionne toujours
3. Analyser pourquoi le fichier était référencé

**Rollback après Phase 3 (suppression)**:

Si un fichier supprimé était nécessaire :

**Option A : Restauration Git**
```bash
git checkout HEAD~1 -- apps/api/src/http/middlewares/auth.middleware.ts
git checkout HEAD~1 -- apps/api/src/http/middlewares/apiKeyAuth.ts
git checkout HEAD~1 -- apps/api/src/auth/apiKey.guard.ts
```

**Option B : Recréation depuis `apiKeyAuthMiddleware`**
- Copier `apiKeyAuthMiddleware` et adapter si nécessaire
- Moins recommandé (duplication)

### Points de contrôle

**Avant Phase 1**:
- [x] Vérification complète des références (grep)
- [x] Confirmation qu'aucun import n'existe
- [x] Validation que `apiKeyAuthMiddleware` fonctionne

**Après Phase 1**:
- [ ] Vérifier que le build passe toujours
- [ ] Vérifier que les tests passent toujours
- [ ] Surveiller les logs pour erreurs

**Avant Phase 3**:
- [ ] Relancer grep pour confirmer absence de références
- [ ] Validation explicite du Founder
- [ ] Backup Git créé

---

## 📋 CHECKLIST DE VALIDATION

### Avant modification
- [x] Audit complet effectué
- [x] Liste des middlewares identifiée
- [x] Utilisation actuelle documentée
- [x] Duplications identifiées
- [x] Risques évalués
- [x] Plan de consolidation défini
- [x] Plan de rollback défini

### Après Phase 1 (marquage déprécié)
- [ ] Commentaires `@deprecated` ajoutés aux 3 fichiers
- [ ] Build passe toujours
- [ ] Tests passent toujours
- [ ] Aucune référence ajoutée

### Après Phase 2 (vérification)
- [ ] Période de grâce écoulée (1 semaine)
- [ ] Aucune référence ajoutée pendant la période
- [ ] Validation explicite du Founder

### Après Phase 3 (suppression)
- [ ] 3 fichiers supprimés
- [ ] Build passe toujours
- [ ] Tests passent toujours
- [ ] Documentation mise à jour si nécessaire

---

## 🎯 RÉSUMÉ DU PLAN

### Modifications requises

**Phase 1 (marquage déprécié)**:
- **3 fichiers** à modifier (ajout commentaires)
- **~15 lignes** ajoutées par fichier
- **Temps estimé**: 10 minutes
- **Risque**: ⚠️ Faible (fichiers non utilisés)

**Phase 3 (suppression)**:
- **3 fichiers** à supprimer
- **Temps estimé**: 2 minutes
- **Risque**: ✅ Aucun (fichiers non utilisés)

### Bénéfices

✅ **Code plus clair** → Un seul middleware à maintenir  
✅ **Moins de confusion** → Pas de choix entre 4 middlewares  
✅ **Maintenance simplifiée** → Modifications dans 1 seul fichier  
✅ **Réduction code mort** → 3 fichiers supprimés (~100 lignes)  

### Risques

⚠️ **Référence cachée** → Détectée par grep avant modification  
⚠️ **Réactivation accidentelle** → Prévenu par commentaires dépréciés  

### Timeline

- **Jour 0** : Phase 1 (marquage déprécié)
- **Jour 7** : Phase 2 (vérification)
- **Jour 8** : Phase 3 (suppression) après validation

---

**FIN DU RAPPORT D'AUDIT AUTH CONSOLIDATION**

*Ce rapport identifie les middlewares d'authentification et propose une consolidation progressive. Aucune modification n'a été effectuée. Attendre validation explicite avant implémentation.*
