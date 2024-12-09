import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface LocationPickerProps {
  onClose: () => void;
  onSave: (latitude: string, longitude: string) => void;
  initialLatitude?: string;
  initialLongitude?: string;
}

export function LocationPicker({ onClose, onSave, initialLatitude, initialLongitude }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    const initialLocation = { 
      lat: initialLatitude ? parseFloat(initialLatitude) : 41.0082, 
      lng: initialLongitude ? parseFloat(initialLongitude) : 28.9784 
    };

    const map = new google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: 13,
    });

    let marker = new google.maps.Marker({
      position: initialLocation,
      map: map,
      draggable: true,
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      const position = e.latLng;
      if (!position) return;
      
      marker.setPosition(position);
      setSelectedLocation({
        lat: position.lat(),
        lng: position.lng(),
      });
    });

    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (!position) return;
      
      setSelectedLocation({
        lat: position.lat(),
        lng: position.lng(),
      });
    });

    // Add search box
    const input = document.createElement('input');
    input.className = 'map-search-input px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 w-72';
    input.placeholder = 'Adres ara...';
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    const searchBox = new google.maps.places.SearchBox(input);

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      map.setCenter(place.geometry.location);
      marker.setPosition(place.geometry.location);
      
      setSelectedLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
  };

  const handleSave = () => {
    if (!selectedLocation) return;
    onSave(
      selectedLocation.lat.toString(),
      selectedLocation.lng.toString()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Konum Seç</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div ref={mapRef} className="w-full h-[500px] rounded-lg mb-4" />

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedLocation}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}