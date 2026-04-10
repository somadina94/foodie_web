/**
 * Location lists via Next.js API routes (proxies CountriesNow — avoids CORS).
 */

class LocationService {
  async getCountries(): Promise<string[]> {
    const res = await fetch("/api/location/countries", { cache: "force-cache" });
    const json = (await res.json()) as {
      data?: { country: string }[];
      error?: boolean;
    };
    if (!res.ok || !json.data?.length) {
      return [];
    }
    return json.data.map((c) => c.country).sort((a, b) => a.localeCompare(b));
  }

  async getStates(countryName: string): Promise<string[]> {
    const params = new URLSearchParams({ country: countryName });
    const res = await fetch(`/api/location/states?${params}`);
    const json = (await res.json()) as {
      data?: { states?: { name: string }[] };
      error?: boolean;
    };
    if (!res.ok || !json.data?.states?.length) {
      return [];
    }
    return json.data.states.map((s) => s.name).sort((a, b) => a.localeCompare(b));
  }

  async getCities(countryName: string, stateName: string): Promise<string[]> {
    const params = new URLSearchParams({ country: countryName, state: stateName });
    const res = await fetch(`/api/location/cities?${params}`);
    const json = (await res.json()) as {
      data?: string[];
      error?: boolean;
    };
    if (!res.ok || !Array.isArray(json.data) || !json.data.length) {
      return [];
    }
    return json.data.slice().sort((a, b) => a.localeCompare(b));
  }
}

export const locationService = new LocationService();
