import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// Sin cache incremental todavía: cuando haya páginas que valga la pena cachear,
// se conecta R2 o KV aquí.
export default defineCloudflareConfig()
