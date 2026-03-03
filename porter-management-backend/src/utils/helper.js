/**
 * get distance of pickUp and drop location
 * @param {{lat: number, lng: number}} pickup 
 * @param {{lat: number, lng: number}} drop 
 * @returns {number}
 */

export const getDistanceKm = (pickup, drop) => {
  const R = 6371; // Radius of the Earth in km
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(drop.lat - pickup.lat);
  const dLon = toRad(drop.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(drop.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const priceCalculator = (distance, fare) => {
    const baseDistance = 5;
    const fareUpToFiveKm = 50;
    const baseFarePerKm = 10;

    const totalDistance = distance > baseDistance ? distance : baseDistance;
    const totalFare = totalDistance * baseFarePerKm + (totalDistance - baseDistance) * fareUpToFiveKm + fare;
    return totalFare;
}