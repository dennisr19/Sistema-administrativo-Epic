import { Card } from "@/components/ui/card"

export default function Loading() {
  const pulse = "animate-pulse rounded-lg bg-muted"

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-5">
      <div className="hidden md:block">
        <div className={`${pulse} h-8 w-32`} />
        <div className={`${pulse} mt-2 h-4 w-52`} />
      </div>
      <Card className="min-h-0 gap-0 overflow-y-auto rounded-xl border-0 px-5 py-6 md:mx-auto md:w-full md:max-w-[560px] md:self-start md:px-7 md:py-7">
        <div className="grid gap-4">
          {["a", "b", "c"].map((row) => (
            <div key={row} className={`${pulse} h-14 w-full`} />
          ))}
        </div>
      </Card>
    </div>
  )
}
