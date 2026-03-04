import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Helper to mock Intl.DateTimeFormat with a given timezone
function mockTimezone(tz: string) {
  vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
    resolvedOptions: () => ({ timeZone: tz, locale: "en", calendar: "iso8601", numberingSystem: "latn" }),
    format: () => "",
    formatToParts: () => [],
    formatRange: () => "",
    formatRangeToParts: () => [],
  } as unknown as Intl.DateTimeFormat);
}

// Helper to mock navigator.language
function mockLocale(locale: string) {
  Object.defineProperty(navigator, "language", {
    value: locale,
    configurable: true,
    writable: true,
  });
}

// Helper to mock a non-eurozone timezone (so locale fallback kicks in)
function mockNonEurozoneTimezone() {
  mockTimezone("America/New_York");
}

describe("getDefaultCurrency — eurozone timezones", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "EUR" for Europe/Berlin', async () => {
    mockTimezone("Europe/Berlin");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "EUR" for Europe/Paris', async () => {
    mockTimezone("Europe/Paris");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "EUR" for Europe/Madrid', async () => {
    mockTimezone("Europe/Madrid");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "EUR" for Europe/Rome', async () => {
    mockTimezone("Europe/Rome");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "EUR" for Atlantic/Canary (Spain Canary Islands)', async () => {
    mockTimezone("Atlantic/Canary");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });
});

describe("getDefaultCurrency — GBP timezones", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "GBP" for Europe/London', async () => {
    mockTimezone("Europe/London");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("GBP");
  });

  it('returns "GBP" for Europe/Belfast', async () => {
    mockTimezone("Europe/Belfast");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("GBP");
  });
});

describe("getDefaultCurrency — non-eurozone timezone → locale fallback", () => {
  beforeEach(() => {
    vi.resetModules();
    mockNonEurozoneTimezone();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "EUR" for locale "de-AT"', async () => {
    mockLocale("de-AT");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "EUR" for locale "en-DE"', async () => {
    mockLocale("en-DE");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "GBP" for locale "en-GB"', async () => {
    mockLocale("en-GB");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("GBP");
  });

  it('returns "GBP" for locale "en-UK"', async () => {
    mockLocale("en-UK");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("GBP");
  });

  it('returns "USD" for locale "en-US"', async () => {
    mockLocale("en-US");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("USD");
  });

  it('returns "EUR" for bare language code "de" (EUROZONE_LANGUAGE_CODES)', async () => {
    mockLocale("de");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "EUR" for bare language code "fr"', async () => {
    mockLocale("fr");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });

  it('returns "USD" for locale "en" (not in eurozone language codes)', async () => {
    mockLocale("en");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("USD");
  });
});

describe("getDefaultCurrency — Intl unavailable", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns DEFAULT_CURRENCY (USD) when Intl is undefined", async () => {
    vi.stubGlobal("Intl", undefined);
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("USD");
  });
});

describe("getDefaultCurrency — timezone throws", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls through to locale detection when resolvedOptions() throws", async () => {
    vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
      resolvedOptions: () => {
        throw new Error("timezone unavailable");
      },
      format: () => "",
      formatToParts: () => [],
      formatRange: () => "",
      formatRangeToParts: () => [],
    } as unknown as Intl.DateTimeFormat);
    mockLocale("de-AT");
    const { getDefaultCurrency } = await import("@/lib/currency");
    expect(getDefaultCurrency()).toBe("EUR");
  });
});

describe("getDefaultCurrency — memoization", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the same value on repeated calls without re-detecting", async () => {
    mockTimezone("Europe/Berlin");
    const { getDefaultCurrency } = await import("@/lib/currency");

    // Warm up the memoization cache with the first call
    getDefaultCurrency();

    // Get the spy (mockTimezone already set one up) and clear its history
    const spy = vi.spyOn(Intl, "DateTimeFormat");
    spy.mockClear();

    // Subsequent calls should use the cached value — Intl.DateTimeFormat never called again
    getDefaultCurrency();
    getDefaultCurrency();

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("re-detects after module reset", async () => {
    mockTimezone("Europe/Berlin");
    const mod1 = await import("@/lib/currency");
    expect(mod1.getDefaultCurrency()).toBe("EUR");

    vi.resetModules();
    vi.restoreAllMocks();
    mockTimezone("Europe/London");
    const mod2 = await import("@/lib/currency");
    expect(mod2.getDefaultCurrency()).toBe("GBP");
  });
});
