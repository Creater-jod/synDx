import React, { useState, useEffect } from 'react';
import { ReferralFacility } from '../types/syndx';
import { REFERRAL_FACILITIES } from '../services/mockData';
import {
  MapPin,
  Phone,
  Building2,
  Navigation,
  Clock,
  ShieldCheck,
  Wifi,
  WifiOff,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Copy,
  Check,
  Send,
  Compass,
  Bed,
  Ambulance,
  Car,
  Bus,
  ExternalLink
} from 'lucide-react';

interface Props {
  onSelectFacilityForReferral?: (facility: ReferralFacility) => void;
  className?: string;
}

export const OfflineLocalReferralMap: React.FC<Props> = ({
  onSelectFacilityForReferral,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [facilities, setFacilities] = useState<ReferralFacility[]>(REFERRAL_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState<ReferralFacility>(REFERRAL_FACILITIES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showWaypoints, setShowWaypoints] = useState<boolean>(true);
  const [dispatchSmsModal, setDispatchSmsModal] = useState<boolean>(false);
  const [smsSentNotice, setSmsSentNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filter facilities
  const filteredFacilities = facilities.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.specialistsAvailable.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      fac.drugStockStatus.some((d) => d.drugName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || fac.type === typeFilter;
    const matchesDistance = fac.distanceKm <= maxDistance;

    return matchesSearch && matchesType && matchesDistance;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSendOfflineSMS = () => {
    setSmsSentNotice(true);
    setTimeout(() => {
      setSmsSentNotice(false);
      setDispatchSmsModal(false);
    }, 2500);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner: Network & Offline Cache Indicator */}
      <div className="card-3d p-5 bg-slate-900 border-slate-700/80 text-white shadow-2xl relative overflow-hidden">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <Compass className="w-3 h-3 text-teal-400 animate-spin-slow" />
                Offline Vector Geo-Matrix v3.2
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  isOnline
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/60 animate-pulse'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    Online (Cache Primed)
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    Offline Mode Active (100% Local Data)
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-teal-400 shrink-0" />
              Offline Local Referral Map & Emergency Facility Finder
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-2xl">
              Cached GIS spatial routing with offline contact numbers, rural ambulance dispatch,
              road surface conditions, and orphan drug inventory. Operates with zero network connectivity.
            </p>
          </div>

          {/* Network Simulation Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`btn-3d px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all ${
                isOnline
                  ? 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
                  : 'bg-amber-600 text-slate-950 border-amber-400 hover:bg-amber-500 font-black'
              }`}
              title="Click to toggle network connectivity simulation"
            >
              {isOnline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-950" />}
              <span>{isOnline ? 'Simulate Network Outage' : 'Restore Online Network'}</span>
            </button>
          </div>
        </div>

        {/* Origin Location Info Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Origin Health Post: <strong className="text-slate-200">Vedapatti Rural PHC (#402)</strong></span>
            <span className="text-slate-600">|</span>
            <span>GPS: <span className="text-teal-300">10.9821° N, 76.9015° E</span></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cached Map Data Validated
            </span>
            <span className="text-slate-500">Updated: Today, 08:00 AM</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Interactive Map Canvas + Facility Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Map Canvas Representation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card-3d p-4 bg-slate-900 border-slate-700/80 text-white space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-teal-300 uppercase flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-teal-400" />
                Spatial Radar View - Local Health Facilities
              </span>
              <span className="text-slate-400">Scale: 1 : 50,000 (District Vector)</span>
            </div>

            {/* Custom Interactive Map Canvas (SVG Vector Grid) */}
            <div className="relative w-full h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-4 group">
              {/* Grid Background Pattern */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-[#0ea5e9] 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Concentric Distance Rings */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                <circle cx="200" cy="150" r="40" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="200" cy="150" r="85" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="200" cy="150" r="130" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                <text x="205" y="112" fill="#64748b" fontSize="8" fontFamily="monospace">10 km</text>
                <text x="205" y="67" fill="#64748b" fontSize="8" fontFamily="monospace">25 km</text>
                <text x="205" y="22" fill="#64748b" fontSize="8" fontFamily="monospace">50 km</text>

                {/* Connecting Lines from Origin PHC to Facilities */}
                {facilities.map((fac) => {
                  // Map coordinates relative to center (200, 150)
                  // Rough visual projection using lat/lng delta
                  const originLat = 10.9821;
                  const originLng = 76.9015;
                  const dx = ((fac.lng || originLng) - originLng) * 800;
                  const dy = (originLat - (fac.lat || originLat)) * 800;

                  const targetX = Math.max(30, Math.min(370, 200 + dx));
                  const targetY = Math.max(30, Math.min(270, 150 + dy));

                  const isSelected = selectedFacility.id === fac.id;

                  return (
                    <g key={fac.id}>
                      <line
                        x1="200"
                        y1="150"
                        x2={targetX}
                        y2={targetY}
                        stroke={isSelected ? '#14b8a6' : '#475569'}
                        strokeWidth={isSelected ? '2' : '1'}
                        strokeDasharray={isSelected ? 'none' : '2 2'}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Node: Origin Vedapatti PHC */}
              <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center animate-ping absolute inset-0 opacity-60" />
                  <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center relative z-10 text-[10px] font-black text-slate-950">
                    PHC
                  </div>
                </div>
                <span className="mt-1 px-2 py-0.5 bg-slate-900/90 text-orange-300 font-mono text-[9px] font-bold rounded border border-orange-500/40 shadow-md whitespace-nowrap">
                  Vedapatti PHC (You)
                </span>
              </div>

              {/* Facility Node Markers on Canvas */}
              {facilities.map((fac) => {
                const originLat = 10.9821;
                const originLng = 76.9015;
                const dx = ((fac.lng || originLng) - originLng) * 800;
                const dy = (originLat - (fac.lat || originLat)) * 800;

                const targetX = Math.max(30, Math.min(370, 200 + dx));
                const targetY = Math.max(30, Math.min(270, 150 + dy));

                const isSelected = selectedFacility.id === fac.id;

                let badgeBg = 'bg-teal-500';
                if (fac.type === 'Tertiary Medical College') badgeBg = 'bg-purple-500';
                if (fac.type === 'District Hospital') badgeBg = 'bg-blue-500';
                if (fac.type === 'Rural Primary Health Center') badgeBg = 'bg-emerald-500';

                return (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacility(fac)}
                    style={{ left: `${targetX}px`, top: `${targetY}px` }}
                    className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 group/marker transition-all duration-300 focus:outline-none ${
                      isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full ${badgeBg} border-2 ${
                          isSelected ? 'border-amber-300 ring-4 ring-amber-400/40' : 'border-white'
                        } shadow-lg flex items-center justify-center text-slate-950 font-black text-[10px]`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-950" />
                      </div>

                      {/* Floating Label */}
                      <div
                        className={`mt-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap border shadow-md transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                            : 'bg-slate-900/90 text-slate-200 border-slate-700'
                        }`}
                      >
                        {fac.name.split(' ')[0]} ({fac.distanceKm} km)
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Map Controls / Compass Legend overlay */}
              <div className="absolute bottom-2 left-2 z-30 bg-slate-900/90 border border-slate-700 rounded-lg p-2 text-[10px] font-mono space-y-1 text-slate-300 shadow-lg">
                <div className="font-bold text-teal-300 uppercase">Map Legend:</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Tertiary Medical College</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>District Hospital</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Specialty Rare Disease Hub</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Rural PHC / CHC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="card-3d p-4 bg-white border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search facility name, specialist, or drug stock..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              {/* Facility Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="py-2 px-3 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                >
                  <option value="ALL">All Types</option>
                  <option value="Tertiary Medical College">Tertiary College</option>
                  <option value="District Hospital">District Hospital</option>
                  <option value="Specialty Rare Disease Hub">Specialty Hub</option>
                  <option value="Rural Primary Health Center">Rural PHC</option>
                </select>
              </div>
            </div>

            {/* Distance Filter Slider */}
            <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-600">
              <span>Max Radius: <strong className="text-teal-700 font-bold">{maxDistance} km</strong></span>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-48 accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">
                {filteredFacilities.length} of {facilities.length} Facilities Listed
              </span>
            </div>
          </div>

          {/* List of Facilities Cards */}
          <div className="space-y-3">
            {filteredFacilities.map((fac) => {
              const isSelected = selectedFacility.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-teal-500/80 shadow-xl ring-2 ring-teal-500/30'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm tracking-tight">{fac.name}</span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 font-bold uppercase rounded ${
                            isSelected
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {fac.type}
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-3 text-[11px] font-mono mt-1.5 flex-wrap ${
                          isSelected ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        <span className="flex items-center gap-1 font-bold text-teal-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {fac.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Ambulance className="w-3.5 h-3.5 text-amber-400" />
                          ~{fac.travelTimeMinutes?.ambulance || 20} mins (Ambulance)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {fac.contactPhone}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border shrink-0 ${
                        isSelected
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {fac.bedAvailability} Beds Open
                    </span>
                  </div>

                  {/* Road type & Specialist count summary */}
                  <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">
                      Road Access: <strong className={isSelected ? 'text-slate-200' : 'text-slate-700'}>{fac.roadType || 'Paved Highway'}</strong>
                    </span>
                    <span className="text-teal-400 font-bold">
                      {fac.specialistsAvailable.length} Specialists On Duty
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Facility Comprehensive Details & Emergency Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedFacility ? (
            <div className="card-3d p-5 bg-slate-900 border-slate-700 text-white space-y-5 sticky top-20 shadow-2xl">
              {/* Selected Facility Title Header */}
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded border border-teal-800">
                    {selectedFacility.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedFacility.distanceKm} KM From PHC
                  </span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-white mt-1">
                  {selectedFacility.name}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Node: {selectedFacility.districtNode || 'Coimbatore Rural Healthcare Corridor'}
                </p>
              </div>

              {/* Transit & Travel Time Estimates */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  ⚡ Cached Offline Travel Time Matrix:
                </span>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <Ambulance className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="font-bold text-amber-300">
                      {selectedFacility.travelTimeMinutes?.ambulance || 15}m
                    </div>
                    <div className="text-[9px] text-slate-400">108 ER</div>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <Car className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <div className="font-bold text-teal-300">
                      {selectedFacility.travelTimeMinutes?.car || 25}m
                    </div>
                    <div className="text-[9px] text-slate-400">Private</div>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <Bus className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="font-bold text-blue-300">
                      {selectedFacility.travelTimeMinutes?.bus || 45}m
                    </div>
                    <div className="text-[9px] text-slate-400">Rural Bus</div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-orange-400 shrink-0" />
                  <span>Road Status: <strong className="text-slate-200">{selectedFacility.roadType || 'Paved Highway'}</strong></span>
                </div>
              </div>

              {/* Emergency Contacts & Phone Actions */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  📞 Direct Contact Hotlines (Cached Offline):
                </span>

                <div className="space-y-2 text-xs font-mono">
                  {/* Primary Hospital Phone */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Hospital Reception</div>
                      <div className="font-mono font-bold text-teal-300">{selectedFacility.contactPhone}</div>
                    </div>
                    <a
                      href={`tel:${selectedFacility.contactPhone}`}
                      className="btn-3d px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-[11px] uppercase rounded-lg flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                  </div>

                  {/* Ambulance Emergency Phone */}
                  {selectedFacility.ambulanceHelpline && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                          <Ambulance className="w-3 h-3" />
                          Ambulance Helpline
                        </div>
                        <div className="font-mono font-bold text-amber-300">
                          {selectedFacility.ambulanceHelpline}
                        </div>
                      </div>
                      <a
                        href={`tel:${selectedFacility.ambulanceHelpline}`}
                        className="btn-3d px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] uppercase rounded-lg flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Dispatch
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Orphan Drug Stock Availability */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-teal-400" />
                  Cached Essential Rare Drug Stock:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {selectedFacility.drugStockStatus.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-sans font-bold text-slate-200 truncate">{d.drugName}</span>
                      <span
                        className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.2 rounded w-fit ${
                          d.status === 'In Stock'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : d.status === 'Low Stock'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offline Waypoints Turn-by-Turn Accordion */}
              {selectedFacility.offlineWaypoints && selectedFacility.offlineWaypoints.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => setShowWaypoints(!showWaypoints)}
                    className="w-full text-left text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-teal-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-orange-400" />
                      Cached Turn-by-Turn Route ({selectedFacility.offlineWaypoints.length} Steps)
                    </span>
                    <span>{showWaypoints ? '▲ Hide' : '▼ View'}</span>
                  </button>

                  {showWaypoints && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                      {selectedFacility.offlineWaypoints.map((wp, wIdx) => (
                        <div key={wIdx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                          <span className="w-4 h-4 rounded bg-slate-800 text-teal-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {wIdx + 1}
                          </span>
                          <span>{wp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setDispatchSmsModal(true)}
                  className="w-full btn-3d py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg border border-teal-300/40"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Offline SMS Dispatch Payload</span>
                </button>

                {onSelectFacilityForReferral && (
                  <button
                    onClick={() => onSelectFacilityForReferral(selectedFacility)}
                    className="w-full btn-3d py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-slate-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Select for E-Referral Letter</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card-3d p-8 text-center text-slate-400 text-xs font-mono">
              Select a facility on the map or list to view cached offline details.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Offline SMS Referral Payload Generator */}
      {dispatchSmsModal && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-3d max-w-lg w-full p-6 bg-slate-900 border-slate-700 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-teal-400" />
                Offline SMS Dispatch Payload
              </h3>
              <button
                onClick={() => setDispatchSmsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono font-bold"
              >
                ✕ CLOSE
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans">
              This compressed offline text payload can be dispatched via standard cellular SMS to the duty medical officer when internet access is completely unavailable.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 space-y-1 overflow-x-auto select-all">
              <div>SYNDX-REF-URGENT</div>
              <div>TO: {selectedFacility.name} ({selectedFacility.contactPhone})</div>
              <div>FROM: Vedapatti PHC (Node 402)</div>
              <div>GPS: 10.9821N,76.9015E</div>
              <div>PATIENT: P-8820 | TIER A EMERGENCY</div>
              <div>IMPRESSION: Gaucher Disease Type 1</div>
              <div>DRUG REQ: Imiglucerase (ERTI)</div>
              <div>TRANSIT: 108 Ambulance Dispatch Requested</div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() =>
                  handleCopy(
                    `SYNDX-REF-URGENT\nTO: ${selectedFacility.name} (${selectedFacility.contactPhone})\nFROM: Vedapatti PHC\nGPS: 10.9821N,76.9015E\nPATIENT: P-8820 | TIER A EMERGENCY\nIMPRESSION: Gaucher Disease Type 1`,
                    'sms'
                  )
                }
                className="btn-3d px-4 py-2 bg-slate-800 text-slate-200 text-xs font-mono font-bold uppercase rounded-lg flex items-center gap-1.5"
              >
                {copiedText === 'sms' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === 'sms' ? 'Copied Payload!' : 'Copy SMS Text'}</span>
              </button>

              <button
                onClick={handleSendOfflineSMS}
                className="btn-3d px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black uppercase rounded-lg flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Simulate Send SMS</span>
              </button>
            </div>

            {smsSentNotice && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold rounded-xl text-center animate-fade-in">
                ✓ Offline SMS Dispatch Transmitted to {selectedFacility.contactPhone}!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
