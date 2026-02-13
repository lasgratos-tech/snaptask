# Task Engine - Moteur d'exécution générique

## Vue d'ensemble

Le Task Engine est le cœur du système SnapTask V4. Il orchestre toutes les exécutions de tâches via une machine à états générique, sans logique spécifique par type de tâche.

## Machine à états

### États (TaskStep)

- **INIT** : État initial, exécution créée
- **EXECUTE** : Exécution de la tâche IA en cours
- **WAIT_PROOF** : En attente de preuve d'exécution
- **WAIT_VALIDATION** : En attente de validation humaine
- **COMPLETE** : Tâche terminée avec succès
- **FAIL** : Échec de la tâche

### Transitions

Les transitions sont déterminées automatiquement par la configuration de la `TaskDefinition` :

- `executionType` : `'ai'` | `'manual'` | `'hybrid'`
- `proofType` : `'none'` | `'file'` | `'human_validation'`
- `requiresProof` : boolean (déduit de `proofType` si non défini)
- `requiresValidation` : boolean (déduit de `proofType === 'human_validation'` si non défini)

## Utilisation

### Fonction principale

```typescript
import { runTaskExecution } from './engine/taskEngine.js'

// Exécuter une transition automatique
const updated = await runTaskExecution(taskExecutionId)
```

### Exemples de flux

#### Tâche simple (sans preuve)
```typescript
{
  config: {
    executionType: 'ai',
    proofType: 'none',
  }
}
```
Flux : `INIT → EXECUTE → COMPLETE`

#### Tâche avec preuve par fichier
```typescript
{
  config: {
    executionType: 'ai',
    proofType: 'file',
  }
}
```
Flux : `INIT → EXECUTE → WAIT_PROOF → COMPLETE`

#### Tâche avec validation humaine
```typescript
{
  config: {
    executionType: 'ai',
    proofType: 'human_validation',
  }
}
```
Flux : `INIT → EXECUTE → WAIT_VALIDATION → COMPLETE` ou `FAIL`

## Intégration

Le Task Engine est automatiquement appelé lors de :

- `validateExecution()` : Transition depuis `WAIT_VALIDATION` vers `COMPLETE`
- `rejectExecution()` : Transition depuis `WAIT_VALIDATION` vers `FAIL`
- `uploadProof()` : Transition depuis `WAIT_PROOF` vers `WAIT_VALIDATION` ou `COMPLETE`

## Audit

Chaque transition génère un audit log `TASK_STEP_CHANGED` avec :
- `from` : Step précédent
- `to` : Step suivant
- `fromStatus` / `toStatus` : Statuts correspondants
- `taskId` : Identifiant de la tâche

## Extensibilité

Le moteur est préparé pour :

- **Retry contrôlé** : À implémenter dans `executeStepEffects()`
- **Timeout** : À ajouter dans la configuration
- **SLA** : À intégrer dans les métadonnées de transition

## Architecture

```
TaskDefinition (config)
    ↓
determineNextStep() → TaskStep suivant
    ↓
executeStepEffects() → Effets (IA, etc.)
    ↓
updateExecutionStatus() → Mise à jour
    ↓
createAuditLog() → Traçabilité
    ↓
handleTaskCompletion() / handleTaskFailure() → Effets finaux
```

## Philosophie

- **Générique** : Aucune logique spécifique par tâche
- **Configurable** : Tout vient de `TaskDefinition.config`
- **Auditable** : Chaque transition est tracée
- **Extensible** : Prêt pour retry, timeout, SLA
