import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DealerMap() {
  const [position, setPosition] = useState([19.0760, 72.8777]);
  const [theme, setTheme] = useState('dark'); // default dark mode

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
        style={{ height: "100%", width: "100%", zIndex: 10 }}
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

    {/* Theme Toggle Button positioned absolutely over the map */}
    <button
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      className="absolute top-4 right-4 z-[400] bg-[hsl(220,16%,12%)] border border-[hsl(220,14%,24%)] text-slate-200 p-2.5 rounded-xl shadow-lg hover:border-green-400 hover:text-green-400 transition-all flex items-center justify-center"
      title={theme === 'dark' ? "Switch to Light Map" : "Switch to Dark Map"}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  </div>
  );
}