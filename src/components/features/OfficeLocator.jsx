import { useEffect, useRef } from 'react';
import { Phone, Clock, ExternalLink, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (broken in bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const OFFICE_LOCATIONS = {
  FSSAI: {
    name: 'FSSAI State Office Karnataka',
    address: 'No. 4, 80 Feet Road, Koramangala, Bengaluru - 560034',
    lat: 12.9279, lng: 77.6271,
    phone: '080-25535996',
    hours: 'Mon-Fri: 10:00 AM - 5:00 PM',
    website: 'https://foscos.fssai.gov.in',
  },
  FIRE_NOC: {
    name: 'Karnataka State Fire & Emergency Services HQ',
    address: 'Nrupathunga Road, Bengaluru - 560001',
    lat: 12.9716, lng: 77.5946,
    phone: '080-22250601',
    hours: 'Mon-Sat: 10:00 AM - 5:30 PM',
    website: 'https://ksfe.karnataka.gov.in',
  },
  TRADE_LICENSE: {
    name: 'BBMP Head Office',
    address: 'N R Square, Hudson Circle, Bengaluru - 560002',
    lat: 12.9763, lng: 77.5929,
    phone: '080-22660000',
    hours: 'Mon-Sat: 9:30 AM - 5:30 PM',
    website: 'https://bbmptax.karnataka.gov.in',
  },
  SHOP_ESTABLISHMENT: {
    name: 'Karnataka Labour Department',
    address: 'Karmika Bhavana, Dairy Circle, Bengaluru - 560029',
    lat: 12.9249, lng: 77.6154,
    phone: '080-29751212',
    hours: 'Mon-Fri: 10:00 AM - 5:30 PM',
    website: 'https://labour.karnataka.gov.in',
  },
  EATING_HOUSE: {
    name: "Bengaluru City Police Commissioner's Office",
    address: 'Infantry Road, Bengaluru - 560001',
    lat: 12.9784, lng: 77.6058,
    phone: '080-22942222',
    hours: 'Mon-Sat: 10:00 AM - 5:00 PM',
    website: 'https://bengalurupolice.karnataka.gov.in',
  },
  GST: {
    name: 'GST Commissionerate — Bengaluru',
    address: 'Kendriya Bhavana, Sadashivanagar, Bengaluru - 560080',
    lat: 13.0052, lng: 77.5795,
    phone: '080-23440222',
    hours: 'Mon-Fri: 10:00 AM - 5:00 PM',
    website: 'https://www.gst.gov.in',
  },
};

export default function OfficeLocator({ licenseType }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const office = OFFICE_LOCATIONS[licenseType] || OFFICE_LOCATIONS.TRADE_LICENSE;

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current, { zoomControl: true }).setView([office.lat, office.lng], 15);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Office marker
    const officeIcon = L.divIcon({
      html: `<div style="width:36px;height:36px;background:#1A56DB;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      className: '',
    });

    L.marker([office.lat, office.lng], { icon: officeIcon })
      .addTo(map)
      .bindPopup(`<strong>${office.name}</strong><br/>${office.address}<br/><span style="color:#6B7280;font-size:12px">${office.phone}</span>`)
      .openPopup();

    // Try geolocation
    navigator.geolocation?.getCurrentPosition((pos) => {
      const userIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#16A34A;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(22,163,74,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: '',
      });
      L.marker([pos.coords.latitude, pos.coords.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Location');
    });

    return () => { map.remove(); mapInstance.current = null; };
  }, [licenseType, office.lat, office.lng]);

  const getDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="rounded-2xl overflow-hidden border border-gray-100" style={{ height: 320 }} />

      <div className="bg-blue-50 rounded-2xl p-5 space-y-3">
        <h4 className="font-bold text-gray-900 text-base">{office.name}</h4>
        <p className="text-sm text-gray-600">{office.address}</p>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-blue-500 flex-shrink-0" />
          <a href={`tel:${office.phone}`} className="hover:text-blue-600 font-medium">{office.phone}</a>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={14} className="text-blue-500 flex-shrink-0" />
          <span>{office.hours}</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={getDirections} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
            <Navigation size={15} /> Get Directions
          </button>
          <a href={office.website} target="_blank" rel="noreferrer" className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
            <ExternalLink size={15} /> Visit Portal
          </a>
        </div>
      </div>
    </div>
  );
}
