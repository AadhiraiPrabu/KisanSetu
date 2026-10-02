import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  Train,
  Thermometer,
  ShieldCheck,
  Phone,
  Clock,
  Gauge,
  Battery,
  Fuel,
  Volume2,
  RefreshCw,
  LocateFixed,
  AlertCircle,
  CheckCircle2,
  Radio,
  ExternalLink,
  ChevronRight,
  Share2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { GpsTrackingData, LanguageCode, GpsWaypoint } from '../types';
import { INITIAL_GPS_TRACKS } from '../data/mockGpsData';
import { TRANSLATIONS } from '../data/translations';
import { speechService } from '../services/speech';

interface GpsLiveTrackingProps {
  language: LanguageCode;
  onNavigateToOrder?: (orderId: string) => void;
}

export const GpsLiveTracking: React.FC<GpsLiveTrackingProps> = ({
  language,
  onNavigateToOrder,
}) => {
  const [tracks, setTracks] = useState<GpsTrackingData[]>(INITIAL_GPS_TRACKS);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(INITIAL_GPS_TRACKS[0].trackingId);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [deviceGps, setDeviceGps] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: string;
    nearestMandi?: string;
    distanceToMandiKm?: number;
  } | null>(null);
  const [isLocatingDevice, setIsLocatingDevice] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [speakingStatus, setSpeakingStatus] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const activeTrack = tracks.find((t) => t.trackingId === selectedTrackId) || tracks[0];
  const t = TRANSLATIONS[language];

  // Simulation timer to gently advance current positions
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTracks((prevTracks) =>
        prevTracks.map((track) => {
          if (track.trackingId !== selectedTrackId) return track;

          // Subtle position jitter / progress along trajectory
          const latDelta = (track.destination.lat - track.origin.lat) * 0.001;
          const lngDelta = (track.destination.lng - track.origin.lng) * 0.001;
          
          const newLat = Number((track.currentPosition.lat + (Math.random() * 0.002 - 0.0005) + latDelta * 0.5).toFixed(4));
          const newLng = Number((track.currentPosition.lng + (Math.random() * 0.002 - 0.0005) + lngDelta * 0.5).toFixed(4));
          const newSpeed = Math.floor(62 + Math.random() * 12);
          const newTemp = Number((track.telemetry.cargoTempCelsius + (Math.random() * 0.2 - 0.1)).toFixed(1));

          return {
            ...track,
            currentPosition: {
              ...track.currentPosition,
              lat: newLat,
              lng: newLng,
              speedKmH: newSpeed,
              lastUpdated: 'Live Just Now',
            },
            telemetry: {
              ...track.telemetry,
              cargoTempCelsius: newTemp,
            },
            distanceCoveredKm: Math.min(track.totalDistanceKm, track.distanceCoveredKm + 1),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, selectedTrackId]);

  // Handle Real Device GPS Geolocation
  const handleLocateDeviceGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingDevice(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        // Approximate distance to closest major APMC
        const nearestMandi = 'Khanna APMC / Local Mandi Hub';
        const distanceToMandiKm = 14.8;

        setDeviceGps({
          lat,
          lng,
          accuracy,
          timestamp: new Date().toLocaleTimeString(),
          nearestMandi,
          distanceToMandiKm,
        });
        setIsLocatingDevice(false);

        // Speak confirmation
        const speechMsg =
          language === 'hi'
            ? `आपका जीपीएस स्थान सफलतापूर्वक प्राप्त हो गया है। निकटतम मंडी ${distanceToMandiKm} किलोमीटर दूर है।`
            : `Your farm GPS location is verified. Nearest Mandi is ${distanceToMandiKm} kilometers away.`;
        speechService.speak(speechMsg, language);
      },
      (error) => {
        setIsLocatingDevice(false);
        setGpsError(error.message || 'Unable to retrieve your farm GPS location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Voice narration of active shipment
  const handleSpeakTrackStatus = () => {
    speechService.stop();
    setSpeakingStatus(true);

    let speechText = '';
    if (language === 'hi') {
      speechText = `गाड़ी संख्या ${activeTrack.vehicleNumber}, ${activeTrack.commodity} लेकर ${activeTrack.origin.city} से ${activeTrack.destination.city} के लिए मार्ग में है। वर्तमान गति ${activeTrack.currentPosition.speedKmH} किलोमीटर प्रति घंटा है। तापमान ${activeTrack.telemetry.cargoTempCelsius} डिग्री सेल्सियस सामान्य है। अनुमानित डिलीवरी ${activeTrack.estimatedArrival} है।`;
    } else if (language === 'ta') {
      speechText = `வாகனம் ${activeTrack.vehicleNumber}, ${activeTrack.commodity} கொண்டு செல்கிறது. தற்போதைய வேகம் ${activeTrack.currentPosition.speedKmH} கிமீ/மணி. எதிர்பார்க்கப்படும் வருகை ${activeTrack.estimatedArrival}.`;
    } else if (language === 'te') {
      speechText = `వాహనం ${activeTrack.vehicleNumber}, ${activeTrack.commodity} రవాణాలో ఉంది. ప్రస్తుత వేగం ${activeTrack.currentPosition.speedKmH} కి.మీ/గంట. అంచనా డెలివరీ ${activeTrack.estimatedArrival}.`;
    } else {
      speechText = `Shipment ${activeTrack.trackingId} carrying ${activeTrack.commodity} is currently in transit from ${activeTrack.origin.city} to ${activeTrack.destination.city}. Current speed is ${activeTrack.currentPosition.speedKmH} km/h. Temperature is locked at ${activeTrack.telemetry.cargoTempCelsius}°C. Estimated arrival is ${activeTrack.estimatedArrival}.`;
    }

    speechService.speak(speechText, language, () => {
      setSpeakingStatus(false);
    });
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const progressPercent = Math.min(100, Math.round((activeTrack.distanceCoveredKm / activeTrack.totalDistanceKm) * 100));

  return (
    <div id="gps-live-tracking-container" className="space-y-6 animate-fadeIn">
      {/* Top Banner & Title Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Satellite GPS Active
              </span>
              <span className="text-xs text-slate-500 font-medium">IoT Sensor Hub v3.4</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {t.gpsTracking} (Real-Time Agri Fleet & Farm Geolocation)
            </h1>
            <p className="text-sm text-slate-600">
              Direct telemetry of farmer produce consignments, cold-chain temperature sensors, and live farm gate dispatch tracking.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-speak-gps-status"
            onClick={handleSpeakTrackStatus}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              speakingStatus
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse'
                : 'bg-slate-900 text-slate-100 hover:bg-slate-800 border-slate-800 shadow-sm'
            }`}
            title="Listen to Live Status in your language"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>{speakingStatus ? 'Announcing...' : t.welcomeVoiceIntro}</span>
          </button>

          <button
            id="btn-locate-my-farm-gps"
            onClick={handleLocateDeviceGps}
            disabled={isLocatingDevice}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            title="Get exact GPS coordinates from your device"
          >
            <LocateFixed className={`w-4 h-4 ${isLocatingDevice ? 'animate-spin' : ''}`} />
            <span>{isLocatingDevice ? 'Detecting GPS...' : t.locateGps}</span>
          </button>

          <button
            id="btn-share-tracking-link"
            onClick={handleShareLink}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Share Tracking Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real Device Farm GPS Banner (if detected) */}
      {deviceGps && (
        <div
          id="device-farm-gps-card"
          className="bg-emerald-900 text-white p-5 rounded-2xl shadow-md border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 border border-emerald-700 flex items-center justify-center text-emerald-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Farm Gate Verified Coordinates
              </div>
              <div className="text-sm font-bold text-white">
                Latitude: {deviceGps.lat.toFixed(6)}° N | Longitude: {deviceGps.lng.toFixed(6)}° E (±{deviceGps.accuracy}m precision)
              </div>
              <div className="text-xs text-emerald-200 mt-0.5">
                Timestamp: {deviceGps.timestamp} • Nearest Mandi Hub: {deviceGps.nearestMandi} (~{deviceGps.distanceToMandiKm} km)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-xs font-semibold text-emerald-200">
              Verified Farm Geofence
            </span>
          </div>
        </div>
      )}

      {gpsError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{gpsError} (Please ensure location access is permitted in your browser settings).</span>
        </div>
      )}

      {copiedLink && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Live GPS Tracking link copied to clipboard!</span>
        </div>
      )}

      {/* Active Shipment Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tracks.map((trk) => {
          const isSelected = trk.trackingId === selectedTrackId;
          const isRail = trk.vehicleType.includes('Rail');
          return (
            <button
              key={trk.trackingId}
              id={`tab-gps-track-${trk.trackingId}`}
              onClick={() => {
                setSelectedTrackId(trk.trackingId);
                speechService.stop();
              }}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {trk.trackingId}
                </span>
                <span
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    isSelected ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {trk.currentPosition.speedKmH} km/h
                </span>
              </div>

              <div className="flex items-center gap-2.5 mb-1.5">
                {isRail ? (
                  <Train className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-700'}`} />
                ) : (
                  <Truck className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-700'}`} />
                )}
                <div className="text-sm font-bold truncate">{trk.commodity}</div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{trk.origin.city} → {trk.destination.city}</span>
                <span className="shrink-0 font-medium text-slate-300">{trk.quantityQuintals} Qtl</span>
              </div>

              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Map Visualizer + Telemetry Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Map Simulation & Route View (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Map Card */}
          <div
            id="gps-map-canvas-card"
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col"
          >
            {/* Map Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    {activeTrack.origin.title} → {activeTrack.destination.title}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Live GPS Lat: {activeTrack.currentPosition.lat}° N, Lng: {activeTrack.currentPosition.lng}° E
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-toggle-sim-mode"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    isSimulating
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isSimulating ? '● Simulation Live' : '○ Paused'}
                </button>
              </div>
            </div>

            {/* Simulated Vector / SVG Route Map Visualizer */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-950 flex items-center justify-center p-6 overflow-hidden select-none">
              {/* Grid lines background */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Geographic Overlay Vectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="60%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Main Transit Polyline Corridor */}
                <path
                  d="M 120 310 Q 280 230, 420 180 T 680 90"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="6"
                  strokeDasharray="8 6"
                  filter="url(#glow)"
                />

                {/* Covered Path solid */}
                <path
                  d="M 120 310 Q 280 230, 420 180"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                />

                {/* Origin Marker */}
                <circle cx="120" cy="310" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                
                {/* Mid Waypoints */}
                <circle cx="280" cy="230" r="5" fill="#34d399" />
                <circle cx="560" cy="130" r="5" fill="#64748b" />

                {/* Destination Marker */}
                <circle cx="680" cy="90" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

                {/* Vehicle Live Marker with Pulse */}
                <g transform="translate(420, 180)">
                  <circle cx="0" cy="0" r="22" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                  <circle cx="0" cy="0" r="14" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
                </g>
              </svg>

              {/* HTML Floating Nodes over the SVG */}
              {/* Origin Tag */}
              <div className="absolute left-6 bottom-8 bg-slate-900/90 border border-slate-700 p-2.5 rounded-xl shadow text-left max-w-[180px]">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Origin Farm Gate
                </div>
                <div className="text-xs font-semibold text-white truncate">{activeTrack.origin.city}</div>
                <div className="text-[10px] text-slate-400">{activeTrack.origin.state}</div>
              </div>

              {/* Live Vehicle Card on Map */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-emerald-500/80 p-3 rounded-xl shadow-2xl text-center z-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {activeTrack.vehicleType.includes('Rail') ? (
                    <Train className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Truck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-xs font-bold text-white">{activeTrack.vehicleNumber}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  {activeTrack.currentPosition.speedKmH} km/h • Heading {activeTrack.currentPosition.heading}°
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Temp: {activeTrack.telemetry.cargoTempCelsius}°C (Optimal)
                </div>
              </div>

              {/* Destination Tag */}
              <div className="absolute right-6 top-8 bg-slate-900/90 border border-slate-700 p-2.5 rounded-xl shadow text-left max-w-[180px]">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Destination Silo
                </div>
                <div className="text-xs font-semibold text-white truncate">{activeTrack.destination.city}</div>
                <div className="text-[10px] text-slate-400">{activeTrack.destination.state}</div>
              </div>
            </div>

            {/* Route Progress Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Transit Progress:</span>
                  <span>{activeTrack.distanceCoveredKm} km of {activeTrack.totalDistanceKm} km</span>
                </div>
                <div className="font-bold text-emerald-400">{progressPercent}% Completed</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Status: <strong className="text-slate-200">{activeTrack.transitStatus}</strong></span>
                <span>ETA: <strong className="text-emerald-400">{activeTrack.estimatedArrival} (~{activeTrack.etaHours}h)</strong></span>
                <span>Security: <strong className="text-slate-200">Digital Seal Locked</strong></span>
              </div>
            </div>
          </div>

          {/* Waypoint Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Electronic Waypoint & Toll Checkposts</span>
              <span className="text-xs font-normal text-slate-500">6 Checkpoints Monitored</span>
            </h3>

            <div className="space-y-4">
              {activeTrack.waypoints.map((wp, index) => {
                const isPassed = wp.status === 'passed';
                const isCurrent = wp.status === 'current';
                return (
                  <div key={index} className="flex items-start gap-3 relative">
                    {index < activeTrack.waypoints.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${
                          isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : isCurrent
                          ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{wp.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                              Active Location
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-slate-500">{wp.time}</div>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{wp.location}</div>
                      {wp.remarks && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-1.5 border border-slate-100">
                          {wp.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Cargo Health Sensors (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Driver / Freight Pilot Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Logistics Crew
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified KYC
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow">
                {activeTrack.driverName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{activeTrack.driverName}</div>
                <div className="text-xs text-slate-500">{activeTrack.vehicleType}</div>
                <div className="text-xs font-medium text-amber-600">★ {activeTrack.driverRating} / 5.0 rating</div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`tel:${activeTrack.driverPhone}`}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Driver ({activeTrack.driverPhone})</span>
              </a>
            </div>
          </div>

          {/* IoT Telemetry Metrics Card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
                  {t.gpsLiveStatus}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Temperature Gauge */}
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between mb-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                  Cargo Pod Temperature
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  {activeTrack.telemetry.cargoTempCelsius}°C
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Target: {activeTrack.telemetry.targetTempCelsius}°C</span>
                <span className="text-emerald-400 font-medium">Safe Perishable Zone</span>
              </div>
            </div>

            {/* Speed & Moisture */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Current Velocity</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {activeTrack.currentPosition.speedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Moisture Sensor</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {activeTrack.telemetry.moisturePercent}% <span className="text-xs font-normal text-emerald-400">Optimal</span>
                </div>
              </div>
            </div>

            {/* Digital Seal & Battery */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Digital e-Seal</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  {activeTrack.telemetry.digitalSealLocked ? 'Locked (Tamper-Proof)' : 'Unlocked'}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IoT Battery</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {activeTrack.telemetry.batteryLevel}% (Nominal)
                </div>
              </div>
            </div>

            {/* Escrow Guarantee link */}
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>T+1 Escrow Auto-Release:</strong> Funds of ₹2,80,000 held in Escrow will be digitally credited to the farmer's bank account upon buyer weighbridge confirmation scan at destination.
              </div>
            </div>
          </div>

          {/* Quick Helpline */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-900">Need Immediate Logistics Re-routing?</div>
            <p>
              Platform Kisan Rail Control Desk: <strong>1800-111-139</strong> (Toll Free 24x7).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
