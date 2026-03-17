import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function DealerMap() {
  const [position, setPosition] = useState([19.0760, 72.8777]);
  const { theme } = useTheme();

  const dealers = [
    { id: 1, name: "Agro Seeds", lat: 19.078, lng: 72.879 },
    { id: 2, name: "Green Crop Dealer", lat: 19.074, lng: 72.873 },
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  const tileLayerUrl = theme === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Carto Dark Matter
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; // Standard OSM (Light)

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-2xl">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false} // optional: to make room for our custom controls if desired
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileLayerUrl}
        />

      <Marker position={position}>
        <Popup>Your Location</Popup>
      </Marker>

      {dealers.map((d) => (
        <Marker key={d.id} position={[d.lat, d.lng]}>
          <Popup>{d.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
  );
}