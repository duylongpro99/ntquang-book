import { NextResponse } from "next/server";
import { searchBooks } from "@/src/lib/cms/books";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ books: [] });
  const { books } = await searchBooks({ query: q, limit: 5 });
  return NextResponse.json({ books });
}
