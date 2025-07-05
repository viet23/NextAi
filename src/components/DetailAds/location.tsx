import React, { useState, useCallback } from "react";
import { GoogleMap, Marker, Circle, useLoadScript } from "@react-google-maps/api";
import { Slider, Input } from "antd";

interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  location: LatLng;
  setLocation: (loc: LatLng) => void;
  radius: number;
  setRadius: (loc: number) => void;
}

const containerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: 20.4485,
  lng: 105.8982,
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  setLocation,
  radius,
  setRadius,
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBp4QWJiJNSo9cwiY13fHl30I8zxHhzeqY",
  });

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      console.log("Clicked e:", e); // Kiểm tra log
      if (e.latLng) {
        const newLatLng = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };
        console.log("Clicked location:", newLatLng); // Kiểm tra log
        setLocation(newLatLng);
      }
    },
    [setLocation]
  );

  return (
    <div style={{ marginBottom: 12 }}>
      <label>📍 Location</label>
      <Input value={`${location.lat}, ${location.lng}`} readOnly style={{ marginBottom: 8 }} />
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location}
          zoom={12}
          onClick={handleMapClick}
        >
          <Marker
            position={location}
            draggable={true}
            onDragEnd={e => {
              const newLocation = {
                lat: e.latLng?.lat() || location.lat,
                lng: e.latLng?.lng() || location.lng,
              };
              console.log("Dragged to:", newLocation);
              setLocation(newLocation);
            }}
          />
          <Circle
            center={location}
            radius={radius}
            options={{
              fillColor: "#007bff",
              fillOpacity: 0.2,
              strokeColor: "#007bff",
              strokeOpacity: 0.5,
              strokeWeight: 1,
            }}
          />
        </GoogleMap>
      )}
      <div style={{ marginTop: 8 }}>
        <label>Bán kính: {Math.round(radius / 1000)} km</label>
        <Slider
          min={1000}
          max={50000}
          step={1000}
          value={radius}
          onChange={value => setRadius(value)}
        />
      </div>
    </div>
  );
};

export default LocationPicker;
