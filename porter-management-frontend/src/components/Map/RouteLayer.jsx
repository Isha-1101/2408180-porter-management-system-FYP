import { Polyline } from "react-leaflet";

export default function RouteLayer({ positions }) {
  if (!positions || positions.length === 0) return null;
  return <Polyline positions={positions} />;
}
