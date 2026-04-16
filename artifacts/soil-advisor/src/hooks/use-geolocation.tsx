import { useState, useCallback } from "react";

export interface GeolocationData {
  latitude: number;
  longitude: number;
  locationName: string;
  temperature: number | null;
  humidity: number | null;
  weatherLoaded: boolean;
}

export type GeolocationStatus = "idle" | "detecting" | "success" | "error";

interface UseGeolocationReturn {
  status: GeolocationStatus;
  data: GeolocationData | null;
  error: string | null;
  detect: () => Promise<GeolocationData | null>;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "MittiAdvisor/1.0" },
    });
    if (!res.ok) throw new Error("Geocoding failed");
    const json = await res.json() as {
      address?: {
        county?: string;
        state_district?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        district?: string;
      };
    };
    const addr = json.address ?? {};
    const parts = [
      addr.county ?? addr.state_district ?? addr.city ?? addr.town ?? addr.village,
      addr.state,
    ].filter(Boolean);
    return parts.join(", ") || "Unknown Location";
  } catch {
    return "Unknown Location";
  }
}

async function fetchWeather(lat: number, lon: number): Promise<{ temperature: number | null; humidity: number | null }> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    const json = await res.json() as {
      current?: { temperature_2m?: number; relative_humidity_2m?: number };
    };
    return {
      temperature: json.current?.temperature_2m ?? null,
      humidity: json.current?.relative_humidity_2m ?? null,
    };
  } catch {
    return { temperature: null, humidity: null };
  }
}

export function useGeolocation(): UseGeolocationReturn {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [data, setData] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (): Promise<GeolocationData | null> => {
    if (!navigator.geolocation) {
      setError("GPS not supported by your browser");
      setStatus("error");
      return null;
    }

    setStatus("detecting");
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: false,
        });
      });

      const { latitude, longitude } = position.coords;

      const [locationName, weather] = await Promise.all([
        reverseGeocode(latitude, longitude),
        fetchWeather(latitude, longitude),
      ]);

      const result: GeolocationData = {
        latitude,
        longitude,
        locationName,
        temperature: weather.temperature,
        humidity: weather.humidity,
        weatherLoaded: true,
      };

      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      const msg =
        err instanceof GeolocationPositionError
          ? err.code === 1
            ? "Location permission denied. Please allow access in browser settings."
            : err.code === 3
            ? "Location detection timed out. Please try again."
            : "Could not detect your location."
          : "Could not detect your location.";
      setError(msg);
      setStatus("error");
      return null;
    }
  }, []);

  return { status, data, error, detect };
}
