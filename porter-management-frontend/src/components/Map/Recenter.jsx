import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Leaflet helper component — sets the map view when `pos` changes.
 * Must be rendered inside a <MapContainer>.
 */
export function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, 14);
  }, [pos, map]);
  return null;
}
