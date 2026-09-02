const skeletonRows = ["one", "two", "three", "four", "five", "six", "seven"]

export function SettingsCatalogSkeleton() {
  return (
    <div className="grid gap-3 px-5 py-5" role="status" aria-label="Cargando catálogo">
      {skeletonRows.map((row) => (
        <div key={row} className="h-12 animate-pulse rounded-lg bg-muted" aria-hidden="true" />
      ))}
    </div>
  )
}
