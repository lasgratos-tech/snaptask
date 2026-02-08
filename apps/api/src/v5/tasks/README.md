# V5 Tasks — Read-only + Write model

## Objectif
Fournir le premier domaine métier V5 avec lecture et écriture contrôlée.
Le modèle est propre à V5 et n’hérite d’aucun contrat V4.

## Différence avec V4
V5 expose un modèle minimal et autonome.
Aucune compatibilité forcée.

## Pourquoi persistance mémoire
Écriture contrôlée sans dépendance externe.
Données volatiles et réversibles au redémarrage.

## Règles d’évolution
- Ajouter des champs uniquement si validé par contrat.
- Garder un modèle simple et strict.

## Invariant write model
- `id` est généré côté serveur uniquement.
- `status` est contrôlé côté serveur uniquement.
- Le client ne fournit jamais `status` ni `id`.
- La validation de `title` reste stricte et déterministe.

## Interdit
- DB réelle ou cache externe.
- Auth ou logique métier avancée.
- Importer V4.
