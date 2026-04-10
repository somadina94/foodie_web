import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    if (!country?.trim()) {
      return NextResponse.json({ error: "country required" }, { status: 400 });
    }
    const q = encodeURIComponent(country.trim());
    const res = await fetch(
      `https://countriesnow.space/api/v0.1/countries/states/q?country=${q}`,
      { next: { revalidate: 60 * 60 } }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: "Failed to load states" }, { status: 502 });
  }
}
