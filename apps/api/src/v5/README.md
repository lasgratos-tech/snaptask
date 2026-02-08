# SnapTask V5 — Contrat architectural

## Objectif
V5 est une extension additive, isolée et réversible de l’API SnapTask.
Elle est montée sous `/v5` et désactivée par défaut.

## Règles absolues
- Isolation stricte (aucun impact V4).
- Additive only (pas de breaking change).
- Aucun import depuis V4.
- Aucun runtime partagé implicite.
- Pas d’activation sans `SNAPTASK_V5_ENABLED=true`.

## Ajouter un nouveau domaine V5
1. Créer un dossier de domaine (`<domain>/plugin.ts`, `<domain>/routes.ts`).
2. Définir les routes dans `routes.ts` (pas de logique métier).
3. Exposer un plugin unique dans `plugin.ts`.
4. Enregistrer explicitement le plugin dans `v5/index.ts`.

## Strictement interdit
- Activer V5 par défaut.
- Auto-discovery de plugins.
- Ajouter des dépendances runtime cachées.
- Coupler V5 à V4.
# V5 (preparation)

- V5 en preparation.
- V4 reste la prod.
- Aucun runtime actif.
