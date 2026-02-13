/**
 * CONTRAT — TASK
 * Références constitutionnelles :
 * - Section 3 : DÉFINITION D’UNE TASK SNAPTASK
 * - Section 2 : ADN IMMUTABLE (stateless, déterministe, amnésique)
 */
export type TaskId = string;

export type TaskVersion = string;

export type TaskCategory = "DOCUMENT" | "PROOF" | "ANALYSIS" | "TRANSFORMATION";

export type DeliverableFormat =
  | "PDF"
  | "DOCX"
  | "ZIP"
  | "CSV"
  | "JSON"
  | "TXT";

export type InputKind = "FILE" | "TEXT" | "ENUM";

export interface InputConstraint {
  /**
   * Taille maximale en octets.
   * Section 3 : task définie avant achat, sans paramétrage libre.
   */
  maxBytes: number;

  /**
   * Longueur minimale et maximale pour texte.
   * Section 3 : résultat attendu explicite et borné.
   */
  minLength: number;
  maxLength: number;

  /**
   * Formats acceptés pour fichiers.
   * Section 3 : critères explicites avant achat.
   */
  acceptedFormats: readonly string[];

  /**
   * Valeurs autorisées pour entrées ENUM.
   * Section 3 : pas de paramétrage libre.
   */
  allowedValues: readonly string[];

  /**
   * Nombre minimum et maximum d’items pour entrées fichiers.
   * Section 3 : entrées bornées et mesurables.
   */
  minItems: number;
  maxItems: number;
}

export interface TaskInputSpec {
  /**
   * Nom d’entrée contractuel.
   * Section 3 : tâche définie avant achat.
   */
  name: string;

  /**
   * Type d’entrée fermé.
   * Section 3 : pas de paramétrage libre.
   */
  kind: InputKind;

  /**
   * Contraintes d’entrée explicites.
   * Section 3 : résultat attendu explicite, vérifiable.
   */
  constraints: InputConstraint;
}

export type RcgCriterionOperator =
  | "FILE_PRESENT"
  | "FORMAT_MATCH"
  | "SECTION_COUNT"
  | "FIELDS_PRESENT"
  | "ARCHIVE_CONTAINS";

export interface RcgCriterion {
  /**
   * Opérateur binaire vérifiable.
   * Section 2 : RCG™ livré ou remboursé.
   */
  operator: RcgCriterionOperator;

  /**
   * Valeurs attendues, strictes.
   * Section 3 : critère de livraison vérifiable.
   */
  expected: readonly string[];
}

export interface TaskContract {
  /**
   * Identifiant immuable.
   * Section 3 : définie avant achat.
   */
  id: TaskId;

  /**
   * Version explicite.
   * Section 5 : pas de modification silencieuse.
   */
  version: TaskVersion;

  /**
   * Catégorie contractuelle unique.
   * Section 3 : unité contractuelle atomique.
   */
  category: TaskCategory;

  /**
   * Prix connu avant exécution.
   * Section 3 + Section 4 : prix connu, paiement avant exécution.
   */
  price: {
    amount: number;
    currency: string;
  };

  /**
   * Résultat attendu explicite.
   * Section 3 : résultat attendu explicite, livrable exploitable.
   */
  expectedResult: string;

  /**
   * Entrées autorisées et bornées.
   * Section 3 : pas de paramétrage libre.
   */
  inputs: readonly TaskInputSpec[];

  /**
   * Type de livrable figé.
   * Section 3 : livrable exploitable, format explicite.
   */
  deliverableFormat: DeliverableFormat;

  /**
   * Critère RCG™ formel et testable.
   * Section 2 + Section 3 : livraison binaire vérifiable.
   */
  rcgCriteria: readonly RcgCriterion[];
}
