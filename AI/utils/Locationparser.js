/**
 * parseLocation("San Francisco, CA, USA")
 * → { city: "San Francisco", state: "CA", country: "USA" }
 *
 * parseLocation("Remote")
 * → { city: "", state: "", country: "Remote" }
 *
 * Handles most TheirStack location formats gracefully.
 */
function parseLocation(rawLocation = "") {
  if (!rawLocation) return { city: "", state: "", country: "" };

  const trimmed = rawLocation.trim();

  // Remote-only jobs
  if (/^remote$/i.test(trimmed)) {
    return { city: "", state: "", country: "Remote" };
  }

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    // Could be just a country or just a city
    return { city: "", state: "", country: parts[0] };
  }

  if (parts.length === 2) {
    // "City, Country"  OR  "City, State"
    return { city: parts[0], state: "", country: parts[1] };
  }

  // 3+ parts → "City, State, Country"
  return {
    city:    parts[0],
    state:   parts[1],
    country: parts.slice(2).join(", "),
  };
}

module.exports = { parseLocation };