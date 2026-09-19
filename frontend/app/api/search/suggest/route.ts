import { NextResponse } from "next/server";
import { searchBooks } from "@/src/lib/cms/books";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ books: [] });
  try {
    const { books } = await searchBooks({ query: q, limit: 5 });
    return NextResponse.json({ books });
  } catch (err) {
    // Typeahead is non-critical: on a CMS error return no suggestions rather
    // than a 500 that would surface in the search box.
    console.error("search suggest failed:", err);
    return NextResponse.json({ books: [] });
  }
}
