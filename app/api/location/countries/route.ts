import { NextResponse } from "next/server";

const UPSTREAM = "https://countriesnow.space/api/v0.1/countries";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      next: { revalidate: 60 * 60 * 24 },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: "Failed to load countries" }, { status: 502 });
  }
}
