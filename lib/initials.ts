/** Dos letras a partir del nombre: primera y última palabra. */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ""
  return `${first}${last}`.toUpperCase()
}
