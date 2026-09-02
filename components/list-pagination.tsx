import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type ListPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

/** Primera, última y una ventana alrededor de la actual. Nunca imprime 25 números. */
function pagesToShow(page: number, pageCount: number) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const edge =
    page <= 3
      ? [2, 3, 4]
      : page >= pageCount - 2
        ? [pageCount - 3, pageCount - 2, pageCount - 1]
        : []
  for (const value of edge) pages.add(value)

  return [...pages]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b)
    .reduce<(number | "gap")[]>((list, value, index, all) => {
      if (index && value - all[index - 1] > 1) list.push("gap")
      list.push(value)
      return list
    }, [])
}

export function ListPagination({ page, pageCount, onPageChange }: ListPaginationProps) {
  if (pageCount <= 1) return null

  return (
    <Pagination className="mx-0 w-auto justify-between sm:justify-end" aria-label="Páginas">
      <PaginationContent className="w-full justify-between gap-0.5 sm:w-auto sm:justify-end">
        <PaginationItem>
          <PaginationPrevious
            href="#lista"
            text="Anterior"
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : 0}
            className={cn(
              "h-11 min-w-11 px-3",
              page === 1 && "pointer-events-none text-muted-foreground",
            )}
            onClick={(event) => {
              event.preventDefault()
              onPageChange(Math.max(1, page - 1))
            }}
          />
        </PaginationItem>

        {pagesToShow(page, pageCount).map((value, index) =>
          value === "gap" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: los huecos no tienen identidad propia
            <PaginationItem key={`gap-${index}`} className="hidden sm:block">
              <PaginationEllipsis className="size-11" />
            </PaginationItem>
          ) : (
            <PaginationItem key={value} className="hidden sm:block">
              <PaginationLink
                href="#lista"
                className="size-11"
                isActive={value === page}
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(value)
                }}
              >
                {value}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem className="sm:hidden">
          <span className="inline-flex h-11 min-w-11 items-center justify-center text-[13px] font-medium tabular-nums">
            {page}/{pageCount}
          </span>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href="#lista"
            text="Siguiente"
            aria-disabled={page === pageCount}
            tabIndex={page === pageCount ? -1 : 0}
            className={cn(
              "h-11 min-w-11 px-3",
              page === pageCount && "pointer-events-none text-muted-foreground",
            )}
            onClick={(event) => {
              event.preventDefault()
              onPageChange(Math.min(pageCount, page + 1))
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
