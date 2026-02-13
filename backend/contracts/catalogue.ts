/**
 * CONTRAT — CATALOGUE
 * Références constitutionnelles :
 * - Section 5 : LE CATALOGUE
 * - Section 2 : ADN IMMUTABLE (1 tâche = 1 résultat = 1 paiement)
 */
export type CatalogueVersion = string;

export type CatalogueEntryId = string;

export interface CatalogueEntry {
  /**
   * Identifiant immuable d’entrée de catalogue.
   * Section 5 : Catalogue fini, versionné, auditable.
   */
  id: CatalogueEntryId;

  /**
   * Version de l’entrée (duplication par langue/pays/cadre/format).
   * Section 5 + Section 8 : duplication des tasks.
   */
  version: CatalogueVersion;

  /**
   * Référence contractuelle de task.
   * Section 3 : Task définie avant achat.
   */
  taskId: string;
}

export interface Catalogue {
  /**
   * Version globale du catalogue, immuable.
   * Section 5 : catalogue fini, versionné, auditable.
   */
  version: CatalogueVersion;

  /**
   * Liste immuable des entrées.
   * Section 5 : toute action hors catalogue n’existe pas.
   */
  entries: readonly CatalogueEntry[];
}
