// src/components/ads/LocationSelector.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Select, Tag, Space, Button, Divider, Typography, Slider } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api'
import { useLazyTargetingSearchQuery } from 'src/store/api/facebookApi'

// dùng chung types từ 1 file duy nhất
import type { SelectedLocation, GeoSearchItem, LocationBehavior } from './types'

type Props = {
  value?: SelectedLocation[]
  onChange?: React.Dispatch<React.SetStateAction<SelectedLocation[]>>
  defaultCountryCode?: string
  googleMapsApiKey?: string
  onPreviewTargetingSpec?: (payload: {
    selections: SelectedLocation[];
    behaviors: LocationBehavior[];
  }) => void
}

const containerStyle = { width: '100%', height: '320px' }
const FALLBACK_CENTER: google.maps.LatLngLiteral = { lat: 16.0471, lng: 108.206 } // VN

const LocationSelector: React.FC<Props> = ({
  value = [],
  onChange,
  defaultCountryCode = 'VN',
  googleMapsApiKey,
}) => {
  const [options, setOptions] = useState<GeoSearchItem[]>([])
  const [triggerSearch, { isFetching }] = useLazyTargetingSearchQuery()
  const timer = useRef<any>(null)

  // Google Maps
  const apiKey = googleMapsApiKey || (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string)
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey || '' })
  const mapRef = useRef<google.maps.Map | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const onMapLoad = useCallback((map: google.maps.Map) => { mapRef.current = map }, [])

  /* ============================ Helpers to set state ============================ */
  const setArray = (updater: React.SetStateAction<SelectedLocation[]>) => onChange?.(updater)
  const push = (item: SelectedLocation) => setArray(prev => ([...(prev || []), item]))
  const remove = (idx: number) => setArray(prev => (prev || []).filter((_, i) => i !== idx))
  const update = (idx: number, patch: Partial<SelectedLocation>) =>
    setArray(prev => (prev || []).map((v, i) => (i === idx ? { ...v, ...patch } : v)))

  /* ============================ Search (adgeolocation) ============================ */
  const fetchOptions = async (q: string) => {
    if (!q?.trim()) return setOptions([])
    try {
      const data = await triggerSearch({
        q,
        country_code: defaultCountryCode,
        normalize: 1,
        limit: 10,
        // CHỈ city để đơn giản & đúng yêu cầu
        location_types: '["city"]',
      }).unwrap()
      setOptions(Array.isArray(data) ? data : [])
    } catch {
      setOptions([])
    }
  }
  const onSearch = (q: string) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fetchOptions(q), 350)
  }

  const toLabel = (o: GeoSearchItem) => {
    const meta =
      o.type === 'country'
        ? (o.country_name || o.name)
        : [o.name, o.region, o.country_name || o.country_code].filter(Boolean).join(' · ')
    return `[${o.type}] ${meta}`
  }

  const addFromOption = (o: GeoSearchItem) => {
    // Ép về city & GẮN raw để gửi đủ dữ liệu khi tạo ads
    const item: SelectedLocation = {
      type: 'city',
      key: o.key,
      name: o.name,
      country_code: o.country_code,
      latitude: typeof o.latitude === 'number' ? o.latitude : undefined,
      longitude: typeof o.longitude === 'number' ? o.longitude : undefined,
      raw: o,
    }
    push(item)

    // geocode nếu city chưa có lat/lng
    if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
      setTimeout(() => geocodeSelectionIfNeeded((value || []).length, item), 0)
    }
    setOptions([])
  }

  /* ============================ Geocode helpers ============================ */
  const ensureGeocoder = () => {
    if (!geocoderRef.current && isLoaded && (window as any).google) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
    return geocoderRef.current
  }

  const geocodeSelectionIfNeeded = (idx: number, item: SelectedLocation) => {
    if (typeof item.latitude === 'number' && typeof item.longitude === 'number') return
    const geocoder = ensureGeocoder()
    if (!geocoder) return
    const q = [item.name, item.country_code].filter(Boolean).join(', ')
    geocoder.geocode({ address: q }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location
        update(idx, { latitude: loc.lat(), longitude: loc.lng() })
      }
    })
  }

  // Geocode cho kết quả tìm kiếm (để đặt marker kết quả)
  const [resultCoords, setResultCoords] = useState<Record<string, { lat: number; lng: number }>>({})
  useEffect(() => {
    if (!isLoaded || !(window as any).google) return
    const geocoder = ensureGeocoder()
    if (!geocoder) return
    const need = options
      .filter(o => typeof o.latitude !== 'number' || typeof o.longitude !== 'number')
      .slice(0, 5)
    need.forEach(o => {
      const q = [o.name, o.country_code].filter(Boolean).join(', ')
      geocoder.geocode({ address: q }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location
          setResultCoords(prev => ({ ...prev, [o.key]: { lat: loc.lat(), lng: loc.lng() } }))
        }
      })
    })
  }, [options, isLoaded])

  /* ============================ Map points ============================ */
  const selectedPoints = useMemo(
    () =>
      (value || [])
        .map((v, idx) =>
          (typeof v.latitude === 'number' && typeof v.longitude === 'number')
            ? { idx, lat: v.latitude!, lng: v.longitude!, radiusM: v.radius ?? 0, label: v.name, isCustom: v.type === 'custom' }
            : null
        )
        .filter(Boolean) as Array<{ idx: number; lat: number; lng: number; radiusM: number; label?: string; isCustom: boolean }>,
    [value]
  )

  const resultPoints = useMemo(
    () =>
      options
        .map(o => {
          const lat = o.latitude ?? resultCoords[o.key]?.lat
          const lng = o.longitude ?? resultCoords[o.key]?.lng
          return (typeof lat === 'number' && typeof lng === 'number')
            ? { key: o.key, lat, lng, label: o.name, raw: o }
            : null
        })
        .filter(Boolean) as Array<{ key: string; lat: number; lng: number; label?: string; raw: GeoSearchItem }> ,
    [options, resultCoords]
  )

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (selectedPoints.length) {
      if (selectedPoints.length === 1) {
        map.setCenter({ lat: selectedPoints[0].lat, lng: selectedPoints[0].lng })
        map.setZoom(11)
      } else {
        const b = new google.maps.LatLngBounds()
        selectedPoints.forEach(p => b.extend({ lat: p.lat, lng: p.lng }))
        map.fitBounds(b, 48)
      }
    } else if (resultPoints.length) {
      if (resultPoints.length === 1) {
        map.setCenter({ lat: resultPoints[0].lat, lng: resultPoints[0].lng })
        map.setZoom(10)
      } else {
        const b = new google.maps.LatLngBounds()
        resultPoints.forEach(p => b.extend({ lat: p.lat, lng: p.lng }))
        map.fitBounds(b, 48)
      }
    } else {
      map.setCenter(FALLBACK_CENTER)
      map.setZoom(5)
    }
  }, [selectedPoints, resultPoints])

  const resultIcon = useMemo<google.maps.Symbol | undefined>(() => {
    if (!isLoaded) return undefined
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: '#00bcd4',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    }
  }, [isLoaded])

  /* ============================ Render ============================ */
  return (
    <div style={{ background: '#0f172a', border: '1px solid #2a3446', borderRadius: 8, padding: 12 }}>
      <Typography.Text style={{ color: '#e2e8f0' }}>
        Tìm theo <b>thành phố</b> hoặc thả <b>ghim tuỳ chỉnh</b>. Bán kính chỉnh bằng <b>thanh kéo</b>.
      </Typography.Text>

      {/* Search city */}
      <Select
        showSearch
        onSearch={onSearch}
        notFoundContent={isFetching ? 'Đang tìm...' : 'Không có dữ liệu'}
        filterOption={false}
        onSelect={(val) => {
          const picked = options.find(o => o.key === val)
          if (picked) addFromOption(picked)
        }}
        placeholder="Nhập tên thành phố… (vd: Hue, Da Nang, Ho Chi Minh)"
        style={{ width: '100%', marginTop: 8 }}
        value={undefined}
        options={options.map(o => ({ value: o.key, label: toLabel(o) }))}
        suffixIcon={<SearchOutlined />}
      />

      <Divider style={{ borderColor: '#334155' }} />

      {/* Selected list */}
      <Space direction="vertical" style={{ width: '100%' }}>
        {value.map((loc, idx) => (
          <div key={`${loc.type}-${loc.key ?? idx}`} style={{
            background: '#0b1220', border: '1px solid #2a3446', borderRadius: 8, padding: 10
          }}>
            <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
              <Space>
                <Tag color={loc.type === 'custom' ? 'purple' : 'blue'}>{loc.type}</Tag>
                <span style={{ color: '#e2e8f0' }}>{loc.name}</span>
                {loc.country_code && <Tag>{loc.country_code}</Tag>}
                {typeof loc.latitude === 'number' && typeof loc.longitude === 'number' && (
                  <Tag color="geekblue">({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})</Tag>
                )}
              </Space>

              <Button danger size="small" onClick={() => remove(idx)}>Xóa</Button>
            </Space>

            {/* Slider bán kính chỉ cho custom */}
            {loc.type === 'custom' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#94a3b8', marginBottom: 6 }}>
                  Bán kính: <b>{Math.round(((loc.radius ?? 10000) / 1000))}</b> km
                </div>
                <Slider
                  min={1}
                  max={80} // 1–80 km
                  value={Math.round(((loc.radius ?? 10000) / 1000))}
                  onChange={(km) => update(idx, { radius: Number(km) * 1000, distance_unit: 'kilometer' })}
                  tooltip={{ open: false }}
                />
              </div>
            )}
          </div>
        ))}
      </Space>

      {/* MAP */}
      <Divider style={{ borderColor: '#334155' }} />
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedPoints[0] ? { lat: selectedPoints[0].lat, lng: selectedPoints[0].lng }
                                    : (resultPoints[0] ? { lat: resultPoints[0].lat, lng: resultPoints[0].lng } : FALLBACK_CENTER)}
          zoom={selectedPoints.length || resultPoints.length ? 10 : 5}
          onLoad={onMapLoad}
          onClick={(e) => {
            const ll = e.latLng
            if (!ll) return
            // Thả ghim → custom (mặc định 10km)
            push({
              type: 'custom',
              name: `(${ll.lat().toFixed(4)}, ${ll.lng().toFixed(4)})`,
              latitude: ll.lat(),
              longitude: ll.lng(),
              radius: 10 * 1000,
              distance_unit: 'kilometer',
            })
          }}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, clickableIcons: false }}
        >
          {/* Markers kết quả tìm kiếm */}
          {resultPoints.map(p => (
            <Marker
              key={`res-${p.key}`}
              position={{ lat: p.lat, lng: p.lng }}
              icon={resultIcon}
              title={`Kết quả: ${p.label || p.key}`}
              onClick={() => addFromOption(p.raw)}
              zIndex={5}
            />
          ))}

          {/* Markers & Circle cho lựa chọn */}
          {selectedPoints.map((p) => (
            <React.Fragment key={`sel-${p.idx}`}>
              <Marker
                position={{ lat: p.lat, lng: p.lng }}
                draggable={value[p.idx].type === 'custom'}
                title={value[p.idx].name}
                onDragEnd={(ev) => {
                  const newLat = ev.latLng?.lat()
                  const newLng = ev.latLng?.lng()
                  if (typeof newLat === 'number' && typeof newLng === 'number') {
                    update(p.idx, { latitude: newLat, longitude: newLng })
                  }
                }}
                zIndex={10}
              />
              {/* Vẽ vòng tròn CHỈ cho custom */}
              {value[p.idx].type === 'custom' && (
                <Circle
                  center={{ lat: p.lat, lng: p.lng }}
                  radius={Math.max(50, p.radiusM || 100)}
                  options={{
                    fillColor: '#007bff',
                    fillOpacity: 0.2,
                    strokeColor: '#007bff',
                    strokeOpacity: 0.5,
                    strokeWeight: 1,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </GoogleMap>
      ) : (
        <div style={{ height: 320, display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
          Đang tải bản đồ…
        </div>
      )}
    </div>
  )
}

export default LocationSelector
