## 0. STATUT DU DOCUMENT

Ce document définit le **format contractuel obligatoire** de toute **Task SnapTask**.

Toute task qui **ne respecte pas intégralement** ce template est :

> ❌ **NON CONFORME — INTERDITE AU CATALOGUE**

Ce document est **subordonné uniquement** à **SNAPTASK_CONSTITUTION_V2.md**.

---

## 1. IDENTITÉ DE LA TASK

**Task ID (immutable)**
`SNAPTASK-TASK-XXXX`

**Nom public (figé)**
Nom exact affiché dans le catalogue.
➡️ Clair, descriptif, sans marketing, sans promesse vague.

**Version**
`vX.Y`
Toute modification ⇒ **nouvelle version**.

**Statut**

* ACTIVE
* DEPRECATED
* REMOVED

---

## 2. CATÉGORIE CONTRACTUELLE

(une seule valeur autorisée)

* DOCUMENT
* PROOF
* ANALYSIS
* TRANSFORMATION

❌ Toute catégorie hybride est interdite.

---

## 3. DESCRIPTION CONTRACTUELLE (OBLIGATOIRE)

Description **objective**, **factuelle**, **non subjective**.

Règles strictes :

* pas de superlatif
* pas de promesse implicite
* pas de “meilleur”, “optimisé”, “idéal”
* pas de bénéfice marketing

➡️ Décrire **ce qui est livré**, pas **pourquoi c’est bien**.

---

## 4. PÉRIMÈTRE EXACT (SCOPE)

### 4.1 CE QUE LA TASK FAIT (EXPLICITE)

Liste **fermée**, **exhaustive**, **atomique**.

Chaque point doit être :

* vérifiable
* mesurable
* livrable

### 4.2 CE QUE LA TASK NE FAIT PAS (OBLIGATOIRE)

Liste **explicite** des exclusions.

➡️ Cette section est **contractuelle**.
➡️ Toute ambiguïté est une **erreur de design**.

---

## 5. ENTRÉES UTILISATEUR (INPUTS)

### 5.1 Type d’entrées autorisées

* Fichiers (formats listés)
* Champs texte (longueur max définie)
* Sélections fermées (enum)

❌ Texte libre non borné interdit.

### 5.2 Contraintes d’entrée

* formats acceptés
* taille max
* nombre max
* règles de validation

➡️ Toute entrée invalide ⇒ **refus AVANT paiement**.

---

## 6. DÉCLENCHEMENT TRANSACTIONNEL

* Paiement : **OBLIGATOIRE AVANT EXÉCUTION**
* Exécution : **UNE SEULE FOIS**
* Aucune relance
* Aucune modification post-paiement

---

## 7. LIVRABLE CONTRACTUEL (OUTPUT)

### 7.1 Type de livrable

* Document (PDF, DOCX, ZIP, etc.)
* Archive
* Fichier unique

➡️ Le format est **figé**.

### 7.2 Contenu du livrable

Liste **exhaustive** de ce que contient le résultat.

❌ Pas de “peut contenir”
❌ Pas de variation dynamique

---

## 8. CRITÈRE DE LIVRAISON (RCG™)

Critère **objectif**, **binaire**, **non interprétable**.

Exemples :

* fichier généré conforme au format défini
* toutes les sections présentes
* photos horodatées incluses
* document accessible et lisible

➡️ Si le critère n’est pas rempli ⇒ **REMBOURSEMENT AUTOMATIQUE**

---

## 9. NON-OBJECTIFS (ANTI-DÉRIVE)

La task **n’a pas pour objectif** :

* d’optimiser
* de conseiller
* de personnaliser au-delà du cadre défini
* d’évoluer dans le temps
* de créer une relation continue

---

## 10. DÉTERMINISME & ÉTAT

* Task **stateless**
* Task **amnésique**
* Aucun stockage réutilisable
* Aucun historique
* Aucun lien avec une autre task

---

## 11. CONFORMITÉ AIRBNB (SI APPLICABLE)

(Section **présente uniquement** si la task touche Airbnb Lite)

* Task **documentaire uniquement**
* Aucune notion de logement persistant
* Aucune notion de séjour
* Aucune réutilisation de preuves
* Photos (si présentes) :

  * horodatées
  * non modifiables
  * attachées uniquement au livrable

❌ Toute logique métier Airbnb ⇒ **INTERDICTION**

---

## 12. RAISON DE SUPPRESSION POTENTIELLE

Checklist obligatoire :

* ❏ Faible valeur mesurable
* ❏ Échec fréquent
* ❏ Ambiguïté contractuelle
* ❏ Subjectivité perçue
* ❏ Faible marge

➡️ Une task supprimable **sans débat** n’est pas une faiblesse :
c’est une **propriété du système**.

---

## 13. SIGNATURE CONTRACTUELLE INTERNE

* Task conforme à **SNAPTASK_CONSTITUTION_V2.md**
* Task éligible au **Catalogue SnapTask**
* Task livrable sous **RCG™**

---

📌 **FIN — TASK DEFINITION TEMPLATE (SNAPTASK V2)**
