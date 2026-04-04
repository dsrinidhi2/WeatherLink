// client/src/components/TrafficMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ensure Leaflet's default icon images load correctly in dev builds
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function TrafficMap({ lat, lon }) {
  const TOMTOM_KEY = process.env.REACT_APP_TOMTOM_API_KEY || null;

  if (!lat || !lon) return <p>No location available.</p>;

  return (
    <div style={{ height: "450px", width: "100%", marginTop: "20px" }}>
      <MapContainer
        center={[lat, lon]}
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        {/* Base map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* TomTom live traffic overlay if key present */}
        {TOMTOM_KEY ? (
          <TileLayer
            url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`}
            opacity={0.85}
          />
        ) : (
          <></>
        )}

        <Marker position={[lat, lon]}>
          <Popup>Center: {lat.toFixed(4)}, {lon.toFixed(4)}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
