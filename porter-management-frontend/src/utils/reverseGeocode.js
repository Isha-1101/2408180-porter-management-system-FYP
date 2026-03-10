/**
 * Reverse geocode a lat/lng pair to a human-readable address using Nominatim.
 * Returns the display_name string, or a shortened coordinate fallback.
 */
export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return "Unknown location";
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json();
    // Return a short form: road + suburb/city, not the full verbose string
    const { road, suburb, city, town, village, county, country } =
      data.address || {};
    const line1 = road || suburb || "";
    const line2 = city || town || village || county || country || "";
    if (line1 || line2) return [line1, line2].filter(Boolean).join(", ");
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
