export type PhoneDialRow = { iso2: string; name: string; dial: string };

class PhoneDialCodesService {
  async getDialCodes(): Promise<PhoneDialRow[]> {
    const res = await fetch("/api/phone/dial-codes", { cache: "force-cache" });
    const json = (await res.json()) as { data?: PhoneDialRow[]; error?: string };
    if (!res.ok || !json.data?.length) return [];
    return json.data;
  }
}

export const phoneDialCodesService = new PhoneDialCodesService();
