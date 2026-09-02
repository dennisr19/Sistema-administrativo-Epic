/**
 * Las etiquetas del Data Cache, en un solo lugar. Todas llevan la
 * organización dentro: esto es multi-inquilino y una etiqueta compartida
 * entre organizaciones significaría invalidar —o peor, servir— datos de otra.
 */
export const tags = {
  /** Los seis catálogos: tours, guías, choferes, hoteles, agentes, alimentación. */
  catalogs: (organizationId: string) => `catalogs:${organizationId}`,
  /** Cualquier cosa derivada de reservas: reportes, cobertura, avisos, uso. */
  reservations: (organizationId: string) => `reservations:${organizationId}`,
  /** Nombre de la organización, que se ve en la barra lateral. */
  organization: (organizationId: string) => `organization:${organizationId}`,
} as const
