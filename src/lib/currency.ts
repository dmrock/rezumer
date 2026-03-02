import type { Currency } from "./constants";
import { DEFAULT_CURRENCY } from "./constants";

// Eurozone IANA timezones for timezone-based currency detection (Set for O(1) lookup)
const EUROZONE_TIMEZONES = new Set([
  "Europe/Vienna", // Austria
  "Europe/Brussels", // Belgium
  "Europe/Nicosia", // Cyprus
  "Europe/Tallinn", // Estonia
  "Europe/Helsinki", // Finland
  "Europe/Paris", // France
  "Europe/Berlin", // Germany
  "Europe/Athens", // Greece
  "Europe/Dublin", // Ireland
  "Europe/Rome", // Italy
  "Europe/Riga", // Latvia
  "Europe/Vilnius", // Lithuania
  "Europe/Luxembourg", // Luxembourg
  "Europe/Malta", // Malta
  "Europe/Amsterdam", // Netherlands
  "Europe/Lisbon", // Portugal
  "Europe/Bratislava", // Slovakia
  "Europe/Ljubljana", // Slovenia
  "Europe/Madrid", // Spain
  "Europe/Zagreb", // Croatia
  "Atlantic/Canary", // Spain (Canary Islands)
]);

// ISO 3166-1 alpha-2 country codes for Eurozone members (Set for O(1) lookup)
const EUROZONE_REGIONS = new Set([
  "AT",
  "BE",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
  "HR",
]);

// ISO 639-1 language codes commonly used in Eurozone countries (Set for O(1) lookup).
// Used as fallback when locale has no region suffix (e.g., "de" instead of "de-AT").
const EUROZONE_LANGUAGE_CODES = new Set([
  "de", // German
  "fr", // French
  "es", // Spanish
  "it", // Italian
  "nl", // Dutch
  "pt", // Portuguese
  "el", // Greek
  "fi", // Finnish
  "sk", // Slovak
  "sl", // Slovenian
  "et", // Estonian
  "lv", // Latvian
  "lt", // Lithuanian
]);

// Detect default currency based on user's timezone (most reliable) or locale
function detectDefaultCurrency(): Currency {
  if (typeof Intl === "undefined") return DEFAULT_CURRENCY;

  // Try timezone first (more reliable than locale for physical location)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (EUROZONE_TIMEZONES.has(tz)) return "EUR";

    // GBP timezones
    if (tz === "Europe/London" || tz === "Europe/Belfast") return "GBP";
  } catch {
    // Ignore timezone detection errors
  }

  // Fallback to locale-based detection
  if (typeof navigator === "undefined") return DEFAULT_CURRENCY;
  const locale = navigator.language || "en-US";

  // Extract region code (e.g., "AT" from "de-AT" or "en-AT")
  const regionMatch = locale.match(/-([A-Z]{2})$/i);
  const region = regionMatch ? regionMatch[1].toUpperCase() : null;

  if (region && EUROZONE_REGIONS.has(region)) return "EUR";
  if (region === "GB" || region === "UK") return "GBP";

  // Fallback: check language prefix for locales without region
  const lang = locale.split("-")[0].toLowerCase();
  if (EUROZONE_LANGUAGE_CODES.has(lang)) {
    return "EUR";
  }

  return DEFAULT_CURRENCY;
}

// Memoize default currency - computed once on first access
let _defaultCurrency: Currency | null = null;
export function getDefaultCurrency(): Currency {
  if (_defaultCurrency === null) {
    _defaultCurrency = detectDefaultCurrency();
  }
  return _defaultCurrency;
}
