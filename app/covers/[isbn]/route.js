import { books } from "../../../lib/books.js";

const cacheSeconds = 86400;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);

export async function GET(request, { params }) {
  const { isbn } = await params;
  if (!books.some((book) => book.isbn === isbn)) {
    return new Response("Cover not found", { status: 404 });
  }

  try {
    const response = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`, {
      next: { revalidate: cacheSeconds },
      signal: AbortSignal.timeout(10000),
    });
    const contentType = response.headers.get("content-type");
    const imageType = contentType?.split(";")[0].trim().toLowerCase();
    if (!response.ok || !allowedTypes.has(imageType)) {
      console.error(`Cover fetch failed for ${isbn}: HTTP ${response.status}, content type ${contentType}`);
      return new Response("Cover unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": `public, max-age=${cacheSeconds}`,
      },
    });
  } catch (error) {
    console.error(`Cover fetch failed for ${isbn}:`, error);
    return new Response("Cover unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
