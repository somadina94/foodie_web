import { NextResponse } from "next/server";

type Idd = { root?: string; suffixes?: string[] };

/** Derive E.164 country calling code from restcountries `idd` (handles NANP vs split roots). */
function dialFromIdd(idd: Idd | undefined): string | null {
  if (!idd?.root) return null;
  const suf = idd.suffixes;
  if (!suf?.length) return idd.root;
  // US/Canada/Caribbean: many area-code suffixes; country code is just the root (+1).
  if (suf.length > 15) return idd.root;
  return `${idd.root}${suf[0]}`;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,idd",
      { next: { revalidate: 60 * 60 * 24 } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
    }
    const json = (await res.json()) as {
      name: { common: string };
      cca2: string;
      idd?: Idd;
    }[];
    const data = json
      .map((c) => {
        const dial = dialFromIdd(c.idd);
        if (!dial) return null;
        return {
          iso2: c.cca2,
          name: c.name.common,
          dial,
        };
      })
      .filter((row): row is { iso2: string; name: string; dial: string } => row !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to load dial codes" }, { status: 502 });
  }
}
