import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function DealerMap() {
  const [position, setPosition] = useState([19.0760, 72.8777]);
  const { theme } = useTheme();
  const [mapThemeMode, setMapThemeMode] = useState(() => {
    const savedMapThemeMode = localStorage.getItem("mapThemeMode");
    return ["auto", "light", "dark"].includes(savedMapThemeMode)
      ? savedMapThemeMode
      : "auto";
  });

  const dealers = [
    { id: 1, name: "Agro Seeds", lat: 19.078, lng: 72.879 },
    { id: 2, name: "Green Crop Dealer", lat: 19.074, lng: 72.873 },
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("mapThemeMode", mapThemeMode);
  }, [mapThemeMode]);

  const resolvedMapTheme = mapThemeMode === "auto" ? theme : mapThemeMode;

  const tileLayerUrl = resolvedMapTheme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Carto Dark Matter
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; // Standard OSM (Light)

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-2xl">
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1 rounded-xl border border-brand-border bg-brand-surface/90 p-1 backdrop-blur">
        {[
          { value: "auto", label: "Auto" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMapThemeMode(option.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              mapThemeMode === option.value
                ? "bg-brand-base text-brand-surface"
                : "text-brand-muted hover:text-brand-base"
            }`}
            aria-pressed={mapThemeMode === option.value}
            aria-label={`Set map theme to ${option.label}`}
          >
            {option.label}
          </button>
        ))}
      </div>

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