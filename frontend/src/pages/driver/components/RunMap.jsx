import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { GEOFENCE_M, isFinal } from "../lib/geo";
const pin = (n, state) => {
  const color = { done: "#1E8E5A", failed: "#D63A2E", current: "#4D4DE9" }[state] || "#9292B4";
  const s = state === "current" ? 36 : 28;
  return L.divIcon({ html: `<div class="wp-pin" style="background:${color};width:${s}px;height:${s}px">${n}</div>`, className: "", iconSize: [s, s] });
};
const truck = L.divIcon({ html: '<div class="wp-truck">🚚</div>', className: "", iconSize: [36, 36] });
function Camera({ points, pos, follow }) {
  const map = useMap();
  useEffect(() => { if (points.length > 1) map.fitBounds(points, { padding: [50, 50], maxZoom: 14, animate: false }); }, [points.length]);
  useEffect(() => { if (follow && pos) map.setView(pos, Math.max(map.getZoom(), 14), { animate: false }); }, [follow, pos?.[0], pos?.[1]]);
  return null;
}
export default function RunMap({ depot, stops, current, pos, driving }) {
  const at = (o) => (o.lat && o.lng ? [o.lat, o.lng] : depot);
  const route = [depot, ...stops.map(at), depot];
  return (
    <MapContainer center={depot} zoom={10} zoomControl={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution="© OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Camera points={route} pos={pos} follow={driving} />
      <CircleMarker center={depot} radius={9} pathOptions={{ color: "#010138", fillOpacity: 0.9 }}><Tooltip>Depot</Tooltip></CircleMarker>
      <Polyline positions={route} pathOptions={{ color: "#4D4DE9", weight: 4, dashArray: "8 8", opacity: 0.7 }} />
      {current && <Circle center={at(current)} radius={GEOFENCE_M} pathOptions={{ color: "#4D4DE9", fillOpacity: 0.1 }} />}
      {stops.map((o, i) => (
        <Marker key={o.orderRef} position={at(o)} icon={pin(i + 1, o === current || o.orderRef === current?.orderRef ? "current" : o.delivery === "DELIVERED" ? "done" : isFinal(o) ? "failed" : "todo")}>
          <Tooltip>{o.outletId} · {o.outletName || o.district}</Tooltip>
        </Marker>
      ))}
      {pos && <Marker position={pos} icon={truck} zIndexOffset={1000} />}
    </MapContainer>
  );
}
