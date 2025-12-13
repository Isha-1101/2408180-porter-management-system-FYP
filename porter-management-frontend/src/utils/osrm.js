export async function fetchRouteCoords(userLat, userLng, porterLat, porterLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${porterLng},${porterLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes || !data.routes.length) return [];
  // return coordinates as [lat, lng] pairs
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}
