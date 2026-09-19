import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type BusLocation = {
  id: number
  bus_id: number
  latitude: number
  longitude: number
  accuracy: number | null
  speed: number | null
  heading: number | null
  timestamp: string
}

type LiveBusMapProps = {
  busId: number
  token: string | null
  canPublish?: boolean
  className?: string
}

type Coordinates = {
  latitude: number
  longitude: number
  accuracy?: number | null
  speed?: number | null
  heading?: number | null
}

const busIcon = L.divIcon({
  className: 'salik-bus-icon',
  html: '<span>🚌</span>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

const userIcon = L.divIcon({
  className: 'salik-user-icon',
  html: '<span>●</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const distanceInKm = (from: Coordinates, to: Coordinates) => {
  const earthRadius = 6371
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180
  const latitudeOne = (from.latitude * Math.PI) / 180
  const latitudeTwo = (to.latitude * Math.PI) / 180
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

const RecenterMap = ({ location }: { location: BusLocation | null }) => {
  const map = useMap()
  useEffect(() => {
    if (location) map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 14), { duration: 0.7 })
  }, [location, map])
  return null
}

export default function LiveBusMap({ busId, token, canPublish = false, className = '' }: LiveBusMapProps) {
  const [locations, setLocations] = useState<BusLocation[]>([])
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState('')
  const [isWatching, setIsWatching] = useState(false)

  const latestLocation = locations.at(-1) ?? null
  const mapCenter: [number, number] = latestLocation
    ? [latestLocation.latitude, latestLocation.longitude]
    : [24.7136, 46.6753]

  const loadLocations = async () => {
    const response = await fetch(`/api/bus/location?bus_id=${busId}`)
    if (!response.ok) return
    const payload = await response.json()
    setLocations(payload.locations ?? [])
  }

  useEffect(() => {
    void loadLocations()
    const interval = window.setInterval(() => void loadLocations(), 10000)
    return () => window.clearInterval(interval)
  }, [busId])

  useEffect(() => {
    if (!canPublish || !token || !navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(async (position) => {
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
      }
      setIsWatching(true)
      setLocationError('')
      await fetch('/api/bus/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bus_id: busId, ...coordinates, timestamp: new Date(position.timestamp).toISOString() }),
      })
      await loadLocations()
    }, () => setLocationError('تعذر الوصول إلى GPS لهذا الجهاز. تحقق من إذن الموقع.'), { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 })
    return () => navigator.geolocation.clearWatch(watchId)
  }, [busId, canPublish, token])

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم GPS.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy })
        setLocationError('')
      },
      () => setLocationError('اسمح بالوصول إلى موقعك لحساب المسافة ووقت الوصول.'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )
  }

  const route = useMemo(() => locations.map((location) => [location.latitude, location.longitude] as [number, number]), [locations])
  const eta = latestLocation && userLocation
    ? Math.max(1, Math.round((distanceInKm(latestLocation, userLocation) / ((latestLocation.speed && latestLocation.speed > 2 ? latestLocation.speed * 3.6 : 30))) * 60))
    : null

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-900">تتبع GPS مباشر</div>
          <div className="text-xs text-slate-500">OpenStreetMap · آخر تحديث: {latestLocation ? new Date(latestLocation.timestamp).toLocaleTimeString('ar-SA') : 'بانتظار إحداثيات حقيقية'}</div>
        </div>
        <button onClick={requestUserLocation} className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">استخدم موقعي لحساب ETA</button>
      </div>
      <div className="relative z-0 h-[360px] overflow-hidden rounded-[24px] border border-slate-200">
        <MapContainer center={mapCenter} zoom={latestLocation ? 14 : 11} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap location={latestLocation} />
          {route.length > 1 && <Polyline positions={route} pathOptions={{ color: '#0ea5e9', weight: 5 }} />}
          {latestLocation && <Marker position={[latestLocation.latitude, latestLocation.longitude]} icon={busIcon} />}
          {userLocation && <CircleMarker center={[userLocation.latitude, userLocation.longitude]} radius={8} pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 1 }} />}
          {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} />}
        </MapContainer>
        {!latestLocation && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 text-center text-sm font-bold text-slate-600">لم تصل إحداثيات GPS للحافلة بعد</div>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs text-slate-500">الحالة</div><div className="mt-1 text-sm font-black text-slate-900">{isWatching ? 'يبث من GPS الجهاز' : latestLocation ? 'متصل' : 'بانتظار الجهاز'}</div></div>
        <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs text-slate-500">المسافة إلى موقعي</div><div className="mt-1 text-sm font-black text-slate-900">{latestLocation && userLocation ? `${distanceInKm(latestLocation, userLocation).toFixed(1)} كم` : 'غير متاح'}</div></div>
        <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs text-slate-500">ETA</div><div className="mt-1 text-sm font-black text-slate-900">{eta ? `${eta} دقيقة` : 'غير متاح'}</div></div>
      </div>
      {locationError && <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">{locationError}</div>}
    </div>
  )
}
