// src/components/ads/types.ts
export type LocationType =
  | 'country'
  | 'region'
  | 'city'
  | 'subcity'
  | 'neighborhood'
  | 'zip';

export type LocationBehavior = 'home' | 'recent' | 'travel_in';

// Kiểu tổng cho SelectedLocation.type (bao gồm 'custom' để drop-pin)
export type GeoType = LocationType | 'custom';

export interface GeoSearchItem {
  key: string;
  name: string;
  type: LocationType;
  country_code?: string;
  country_name?: string;
  region?: string;
  region_id?: number;
  supports_radius?: boolean;
  latitude?: number;
  longitude?: number;
  /** Thêm để giữ nhãn hiển thị đầy đủ như ví dụ */
  label?: string;
}

export interface SelectedLocation {
  type: GeoType;
  key?: string;
  name: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;                    // FE có thể nhập m/km/mi
  radiusUnit?: 'm' | 'km' | 'mi';
  distance_unit?: 'kilometer' | 'mile';
  excluded?: boolean;                 // include/exclude

  /** Giữ nguyên item trả về từ search (để khi tạo ads có đủ city/region/country_name/label…) */
  raw?: GeoSearchItem;
}
