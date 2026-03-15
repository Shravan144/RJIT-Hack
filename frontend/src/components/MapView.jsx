import { MapPin } from 'lucide-react';

export default function MapView({ dealers }) {
  return (
    <div className="border border-dashed border-[hsl(220,14%,24%)] rounded-2xl p-16 text-center flex flex-col items-center gap-4 bg-[hsl(220,14%,16%)] mb-6">
      <MapPin size={40} className="text-green-400" />
      <p className="font-bold text-lg text-slate-100">Interactive Map</p>
      <p className="text-slate-400 text-sm">{dealers?.length ?? 0} dealers in this area</p>
      <div className="flex gap-3 flex-wrap justify-center my-2">
        {dealers?.slice(0, 6).map(d => (
          <div key={d.id} title={d.shop_name}
            className="w-4 h-4 rounded-full bg-green-400/70 animate-pulse" />
        ))}
      </div>
      <p className="text-xs text-slate-600">💡 Integrate Leaflet or Google Maps for live map view</p>
    </div>
  );
}
