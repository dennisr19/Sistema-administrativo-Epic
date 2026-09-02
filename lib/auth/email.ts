import "server-only"

type OtpEmail = { to: string; code: string; from: string; apiKey: string; minutes: number }

// Estilos en línea a propósito: es lo único que los clientes de correo
// respetan de forma consistente, un <style> aparte se cae en varios de ellos.
// El fondo va en un div propio, no en <body>: varios webmails (Gmail entre
// ellos) sustituyen el <body> por su propio contenedor y se llevan su style.
const body = (code: string, minutes: number) => `
  <div style="margin:0;padding:32px 16px;background-color:#f3f5f8;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif">
    <div style="max-width:420px;margin:0 auto;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e9ef">
      <div style="padding:28px 32px;border-bottom:1px solid #eef1f5">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:36px;height:36px;border-radius:9999px;background-color:#1a7a52;text-align:center;vertical-align:middle;font-size:16px;font-weight:700;color:#ffffff">S</td>
            <td style="padding-left:10px;font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#192230">
              Sistema Administrativo Epic
            </td>
          </tr>
        </table>
      </div>

      <div style="padding:32px">
        <p style="margin:0 0 20px;font-size:15px;color:#556376">Tu código para entrar es</p>
        <p style="margin:0 0 20px;font-size:38px;font-weight:700;letter-spacing:0.14em;color:#192230">${code}</p>
        <p style="margin:0;font-size:14px;line-height:1.5;color:#556376">
          Vence en ${minutes} minutos. Si no lo pediste, ignora este correo: tu cuenta sigue segura.
        </p>
      </div>
    </div>
    <p style="max-width:420px;margin:20px auto 0;padding:0 8px;font-size:12px;color:#9aa4b2;text-align:center">
      Sistema Administrativo Epic &middot; correo automático, no respondas a este mensaje.
    </p>
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
