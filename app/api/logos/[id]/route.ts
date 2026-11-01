import { sql } from "@/lib/database"
import { logoVersion } from "@/lib/public-logo"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const version = new URL(request.url).searchParams.get("v")
  if (!/^\d+$/.test(params.id) || !version || !/^[a-f0-9]{64}$/.test(version)) {
    return new Response(null, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  try {
    const rows = await sql`SELECT custom_logo FROM websites WHERE id = ${params.id}`
    const logo = rows[0]?.custom_logo as string | undefined
    const image = logo?.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/)
    if (!logo || !image || logoVersion(logo) !== version) {
      return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } })
    }

    return new Response(new Uint8Array(Buffer.from(image[2], "base64")), {
      headers: {
        "Content-Type": image[1],
        "Cache-Control": "public, max-age=31536000, immutable",
        "CDN-Cache-Control": "public, s-maxage=31536000",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
        ETag: `"${version}"`,
      },
    })
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } })
  }
}
