import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

export default function LocationAutocomplete({
  id,
  placeholder,
  value,
  onChange,
  icon: Icon,
  onMapSelect,
  isMapSelecting,
  onUseCurrentLocation,
  className,
  containerClassName = "",
  showCurrentLocationBtn,
  inputRightButtons,
}) {
  const [query, setQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const skipFetchRef = useRef(false);

  // Sync internal state if external value changes (e.g., from map click or current location)
  useEffect(() => {
    if (value?.address !== undefined && value?.address !== query) {
      skipFetchRef.current = true;
      setQuery(value.address || "");
    }
  }, [value?.address]);

  useEffect(() => {
    // Hide dropdown if clicked outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      if (skipFetchRef.current) {
        skipFetchRef.current = false;
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=np`,
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item) => {
    const address = item.display_name;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    skipFetchRef.current = true;
    setQuery(address);
    setShowDropdown(false);
    onChange({ address, lat, lng });
  };

  return (
    <div className={`relative ${containerClassName}`} ref={dropdownRef}>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          skipFetchRef.current = false;
          setQuery(e.target.value);
          // Reset lat and lng when user manually types an address
          onChange({ address: e.target.value, lat: null, lng: null });
        }}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        className={className}
        autoComplete="off"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Icon className="w-4 h-4" />
      </div>

      {/* Buttons provided as children to be position absolute */}
      {inputRightButtons}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <div
              key={item.place_id || idx}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-start gap-2 border-b last:border-0"
              onClick={() => handleSelect(item)}
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-gray-900 leading-snug">
                  {item.display_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
