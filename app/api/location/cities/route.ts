import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const state = searchParams.get("state");
    if (!country?.trim() || !state?.trim()) {
      return NextResponse.json({ error: "country and state required" }, { status: 400 });
    }
    const c = encodeURIComponent(country.trim());
    const s = encodeURIComponent(state.trim());
    const res = await fetch(
      `https://countriesnow.space/api/v0.1/countries/state/cities/q?country=${c}&state=${s}`,
      { next: { revalidate: 60 * 60 } }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: "Failed to load cities" }, { status: 502 });
  }
}
