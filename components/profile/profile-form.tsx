"use client"

import { useActionState } from "react"

import { updateProfileAction } from "@/app/(app)/perfil/actions"
import { Field } from "@/components/reservations/form/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { initialProfileState } from "@/lib/profile-action-state"

type ProfileFormProps = {
  name: string
  email: string
  organizationName: string
}

export function ProfileForm({ name, email, organizationName }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, initialProfileState)

  return (
    <form action={action} className="grid gap-6">
      <section className="grid gap-4">
        <h2 className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Tu cuenta
        </h2>

        <Field label="Nombre" id="name" error={state.errors?.name}>
          {/* `key`: al guardar, el servidor manda otro valor y el campo debe reiniciarse
              con él en vez de quedarse con el defecto de la primera carga. */}
          <Input
            key={name}
            id="name"
            name="name"
            defaultValue={name}
            autoComplete="name"
            required
            className="h-11"
          />
        </Field>

        <Field
          label="Correo"
          id="email"
          hint="Es con lo que entras, así que no se cambia desde aquí."
        >
          {/* `readOnly` y no `disabled`: es un dato que hay que poder leer y enfocar,
              no un control apagado. `disabled` lo saca del orden de tabulación. */}
          <Input
            id="email"
            value={email}
            readOnly
            autoComplete="email"
            className="h-11 bg-surface-muted text-muted-foreground"
          />
        </Field>
      </section>

      <section className="grid gap-4">
        <h2 className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Organización
        </h2>

        <Field
          label="Nombre"
          id="organizationName"
          error={state.errors?.organizationName}
          hint="Aparece en los reportes y en lo que se exporta."
        >
          <Input
            key={organizationName}
            id="organizationName"
            name="organizationName"
            defaultValue={organizationName}
            required
            className="h-11"
          />
        </Field>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando" : "Guardar cambios"}
        </Button>
        {state.status !== "idle" && state.message ? (
          <p
            role="status"
            className={
              state.status === "success"
                ? "text-[13px] text-secondary-foreground"
                : "text-[13px] text-destructive"
            }
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  )
}
