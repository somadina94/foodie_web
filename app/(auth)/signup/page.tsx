"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { setAuthCookies } from "@/lib/cookies";
import { useAppDispatch } from "@/lib/hooks";
import { dashboardPathForRole, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/services/apiClient";
import { toast } from "sonner";
import { locationService } from "@/services/locationService";
import { detectClientGeo } from "@/lib/geo/client-detect";
import { matchOption } from "@/lib/location-match";
import { SearchableSelect } from "@/components/molecules/searchable-select";
import { phoneDialCodesService, type PhoneDialRow } from "@/services/phoneDialCodesService";
import { mergePhone } from "@/lib/phone/merge-phone";
import { AuthLegalLinks } from "@/components/molecules/auth-legal-links";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    address: "",
    zip: "",
  });
  const [phoneIso2, setPhoneIso2] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [dialRows, setDialRows] = useState<PhoneDialRow[]>([]);
  const [loadingDialCodes, setLoadingDialCodes] = useState(true);
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [geoHint, setGeoHint] = useState<Awaited<
    ReturnType<typeof detectClientGeo>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    let cancelled = false;
    setLoadingCountries(true);
    locationService
      .getCountries()
      .then((c) => {
        if (!cancelled) setCountries(c);
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });
    detectClientGeo().then((g) => {
      if (!cancelled) setGeoHint(g);
    });
    phoneDialCodesService
      .getDialCodes()
      .then((rows) => {
        if (!cancelled) setDialRows(rows);
      })
      .finally(() => {
        if (!cancelled) setLoadingDialCodes(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!geoHint) return;
    if (!country && countries.length) {
      const c = matchOption(geoHint.countryName, countries);
      if (c) setCountry(c);
      return;
    }
    const geoCountryOk =
      Boolean(country) && matchOption(geoHint.countryName, [country]) === country;
    if (!geoCountryOk) return;
    if (!stateName && states.length && geoHint.region) {
      const s = matchOption(geoHint.region, states);
      if (s) setStateName(s);
      return;
    }
    if (stateName && cities.length && geoHint.city && !city) {
      const ci = matchOption(geoHint.city, cities);
      if (ci) setCity(ci);
    }
  }, [geoHint, countries, country, states, stateName, cities, city]);

  useEffect(() => {
    if (!geoHint || !dialRows.length || phoneIso2) return;
    if (geoHint.iso2 && dialRows.some((r) => r.iso2 === geoHint.iso2)) {
      setPhoneIso2(geoHint.iso2);
      return;
    }
    if (geoHint.dialingCode) {
      const row = dialRows.find((r) => r.dial === geoHint.dialingCode);
      if (row) setPhoneIso2(row.iso2);
    }
  }, [geoHint, dialRows, phoneIso2]);

  useEffect(() => {
    if (!country) {
      setStates([]);
      setStateName("");
      setCity("");
      setCities([]);
      return;
    }
    let cancelled = false;
    setLoadingStates(true);
    setStateName("");
    setCity("");
    setCities([]);
    locationService
      .getStates(country)
      .then((s) => {
        if (!cancelled) setStates(s);
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    if (!country || !stateName) {
      setCities([]);
      setCity("");
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    setCity("");
    locationService
      .getCities(country, stateName)
      .then((c) => {
        if (!cancelled) setCities(c);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country, stateName]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!name) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!country.trim() || !stateName.trim() || !city.trim()) {
      setError("Please select your country, state, and city.");
      return;
    }
    const dialRow = dialRows.find((r) => r.iso2 === phoneIso2);
    const localDigits = phoneLocal.replace(/\D/g, "");
    if (!dialRow || !localDigits.length) {
      setError("Please select a country code and enter your phone number.");
      return;
    }
    if (!agreedToPolicies) {
      setError("Please agree to the Terms & conditions and Privacy policy.");
      return;
    }
    const phone = mergePhone(dialRow.dial, phoneLocal);
    setLoading(true);
    try {
      const res = await authService.signUp({
        name,
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        phone,
        address: form.address,
        city,
        state: stateName,
        zip: form.zip,
      });
      const { role } = res.data.user;
      setAuthCookies(res.token, role);
      dispatch(setCredentials({ user: res.data.user, token: res.token }));
      toast.success("Welcome to Foodie");
      router.push(dashboardPathForRole(role));
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Sign up failed. Try again.";
      setError(msg);
      toast.error("Sign up failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-16">
      <Link href={ROUTES.home} className="mb-8 text-xl font-bold tracking-tight text-primary">
        Foodie
      </Link>
      <div className="w-full max-w-lg">
      <Card className="w-full border-border/80 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join Foodie to order and track deliveries.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirm password</Label>
              <Input
                id="passwordConfirm"
                type="password"
                required
                autoComplete="new-password"
                value={form.passwordConfirm}
                onChange={(e) => update("passwordConfirm", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Phone</Label>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="phoneDial" className="text-xs text-muted-foreground">
                    Country code
                  </Label>
                  <SearchableSelect
                    id="phoneDial"
                    value={phoneIso2}
                    onChange={setPhoneIso2}
                    options={dialRows.map((r) => ({
                      value: r.iso2,
                      label: `${r.name} (${r.dial})`,
                    }))}
                    placeholder="Code"
                    disabled={loadingDialCodes}
                    loading={loadingDialCodes}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phoneLocal" className="text-xs text-muted-foreground">
                    Number
                  </Label>
                  <Input
                    id="phoneLocal"
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder="Local number"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                required
                autoComplete="street-address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="country">Country</Label>
              <SearchableSelect
                id="country"
                value={country}
                onChange={setCountry}
                options={countries}
                placeholder="Select country"
                disabled={loadingCountries}
                loading={loadingCountries}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / province</Label>
              <SearchableSelect
                id="state"
                value={stateName}
                onChange={setStateName}
                options={states}
                placeholder={country ? "Select state" : "Select country first"}
                disabled={!country || loadingStates}
                loading={loadingStates}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <SearchableSelect
                id="city"
                value={city}
                onChange={setCity}
                options={cities}
                placeholder={stateName ? "Select city" : "Select state first"}
                disabled={!stateName || loadingCities}
                loading={loadingCities}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                required
                autoComplete="postal-code"
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
              />
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <input
                id="signup-agree-policies"
                type="checkbox"
                checked={agreedToPolicies}
                onChange={(e) => setAgreedToPolicies(e.target.checked)}
                className="mt-1 size-4 shrink-0 rounded border border-input bg-background accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              />
              <label
                htmlFor="signup-agree-policies"
                className="text-sm leading-snug text-muted-foreground"
              >
                I agree to the{" "}
                <Link
                  href={ROUTES.terms}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Terms & conditions
                </Link>{" "}
                and{" "}
                <Link
                  href={ROUTES.privacy}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Privacy policy
                </Link>
                .
              </label>
            </div>
            {error && (
              <p className="text-sm text-destructive sm:col-span-2">{error}</p>
            )}
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading || !agreedToPolicies}
              >
                {loading ? "Creating account…" : "Sign up"}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
      <AuthLegalLinks />
      </div>
    </div>
  );
}
