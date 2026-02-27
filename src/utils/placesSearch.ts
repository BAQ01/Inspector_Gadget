export interface ParsedPlace {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  website: string;
}

export const parsePlaceResult = (place: any): ParsedPlace => {
  const comp = (type: string) =>
    place.addressComponents?.find((c: any) => c.types?.includes(type))?.longText || '';
  const street = comp('route');
  const num = comp('street_number');
  return {
    name: place.displayName?.text || '',
    address: street ? `${street} ${num}`.trim() : '',
    postalCode: comp('postal_code'),
    city: comp('locality') || comp('administrative_area_level_2'),
    phone: place.internationalPhoneNumber || '',
    website: place.websiteUri || '',
  };
};

export const fetchPlaces = async (query: string): Promise<any[]> => {
  if (!query.trim() || query.trim().length < 2) return [];
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.addressComponents,places.internationalPhoneNumber,places.websiteUri',
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'nl', regionCode: 'NL', maxResultCount: 5 }),
    });
    const data = await res.json();
    return data.places || [];
  } catch { return []; }
};

/**
 * Geocode een Nederlands adres naar lat/lng via PDOK Locatieserver (gratis).
 * Geeft null terug als het adres niet gevonden wordt.
 */
export const geocodeAddress = async (
  address: string,
  postalCode: string,
  city: string
): Promise<{ lat: number; lng: number } | null> => {
  const query = [address, postalCode, city].filter(Boolean).join(' ');
  if (!query.trim()) return null;
  try {
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(query)}&rows=1&fl=centroide_ll`
    );
    const data = await res.json();
    const centroid: string | undefined = data.response?.docs?.[0]?.centroide_ll;
    if (!centroid) return null;
    // Format: "POINT(5.1234 52.5678)" — lng eerst, lat tweede
    const match = centroid.match(/POINT\(([\d.]+)\s+([\d.]+)\)/);
    if (!match) return null;
    return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) };
  } catch { return null; }
};

export const lookupAddressBAG = async (
  postalCode: string,
  address: string
): Promise<{ city: string; street: string } | null> => {
  const houseNum = address.match(/\d+/)?.[0] || '';
  if (!postalCode.trim() || !houseNum) return null;
  try {
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(`${postalCode} ${houseNum}`)}&rows=1`
    );
    const data = await res.json();
    const doc = data.response?.docs?.[0];
    if (!doc) return null;
    return { city: doc.woonplaatsnaam || '', street: doc.straatnaam || '' };
  } catch { return null; }
};
