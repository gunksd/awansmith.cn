import { createHash } from "node:crypto"

export function logoVersion(logo: string): string {
  return createHash("sha256").update(logo).digest("hex")
}

export function publicLogo(id: number | string, logo: string | null): string | null {
  if (!logo || !/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(logo)) return logo
  return `/api/logos/${id}?v=${logoVersion(logo)}`
}
