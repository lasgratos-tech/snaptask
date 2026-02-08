# V5 Tasks — Read-only

## Objectif
Fournir le premier domaine métier V5 en lecture seule.
Le modèle est propre à V5 et n’hérite d’aucun contrat V4.

## Différence avec V4
V5 expose un modèle minimal et autonome.
Aucune compatibilité forcée.

## Pourquoi read-only
Réduction du risque et absence de mutation.
Pas de dépendance DB ni d’état externe.

## Règles d’évolution
- Ajouter des champs uniquement si validé par contrat.
- Garder des routes GET uniquement.

## Interdit
- DB réelle ou cache externe.
- Mutation (POST/PUT/DELETE).
- Importer V4.
