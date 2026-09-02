import "server-only"

type OtpEmail = { to: string; code: string; from: string; apiKey: string; minutes: number }

const body = (code: string, minutes: number) => `
  <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:420px;margin:0 auto;padding:32px 24px">
    <p style="margin:0 0 24px;font-size:15px;color:#556376">Tu código para entrar a Sistema Administrativo Epic</p>
    <p style="margin:0 0 24px;font-size:36px;font-weight:600;letter-spacing:0.12em;color:#192230">${code}</p>
    <p style="margin:0;font-size:14px;color:#556376">Vence en ${minutes} minutos. Si no lo pediste, ignora este correo.</p>
  </div>`

/**
 * Se llama a la API de Resend con `fetch` en vez de su SDK: es una sola
 * petición y el runtime de Workers ya trae todo lo necesario.
 */
export async function sendOtpEmail({ to, code, from, apiKey, minutes }: OtpEmail) {
  // Sin llave configurada el código va al log del servidor, que es lo que
  // necesitamos mientras no exista el dominio para Resend.
  if (!apiKey) {
    console.info(`[auth] código para ${to}: ${code}`)
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: `${code} es tu código de Sistema Administrativo Epic`,
      html: body(code, minutes),
    }),
  })

  if (!response.ok) {
    // Se registra alto y claro: la pantalla no puede decir si la cuenta existe,
    // así que sin esto una caída del proveedor sería indistinguible del caso
    // normal y nadie se enteraría.
    const detail = await response.text()
    console.error(`[auth] Resend rechazó el envío a ${to}: ${response.status} ${detail}`)
    throw new Error(`Resend respondió ${response.status}`)
  }
}
