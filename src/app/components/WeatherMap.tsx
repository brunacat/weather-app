'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { WeatherData } from '../services/WeatherApi';
import { convertToFahrenheit } from '../services/WeatherApi';

interface WeatherMapProps {
    city: string;
    forecast: WeatherData[];
    temperatureUnit: 'celsius' | 'fahrenheit';
    coordinates: {
        lat: number;
        lon: number;
        name: string;
    };
}

const MapWrapper = styled.div`
  background: var(--gray-alpha-100);
  border: 1px solid var(--gray-alpha-200);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  max-width: 800px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 900px) {
    max-width: 100%;
    padding: 12px;
  }
  @media (max-width: 600px) {
    max-width: 100%;
    padding: 6px;
    margin: 12px 0;
  }
`;

const MapTitle = styled.h3`
  text-align: center;
  margin-bottom: 16px;
  color: var(--foreground);
`;

const MapContainerStyled = styled.div`
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  @media (max-width: 900px) {
    height: 260px;
  }
  @media (max-width: 600px) {
    height: 180px;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: var(--foreground);
  opacity: 0.7;
`;

export default function WeatherMap({ city, forecast, temperatureUnit, coordinates }: WeatherMapProps) {
    const [MapComponent, setMapComponent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Dynamically import the map components only on the client side
        const loadMap = async () => {
            try {
                const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
                setMapComponent({ MapContainer, TileLayer, Marker, Popup });
                // Dynamically import leaflet and its CSS, and set marker icon URLs
                const L = (await import('leaflet')).default;
                await import('leaflet/dist/leaflet.css');
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });
            } catch (error) {
                console.error('Error loading map:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMap();
    }, []);

    const getDisplayTemperature = (celsiusTemp: number): number => {
        if (temperatureUnit === 'fahrenheit') {
            return convertToFahrenheit(celsiusTemp);
        }
        return celsiusTemp;
    };

    const getTemperatureSymbol = (): string => {
        return temperatureUnit === 'celsius' ? '°C' : '°F';
    };

    if (isLoading) {
        return (
            <MapWrapper>
                <MapTitle>Weather Map - {coordinates.name}</MapTitle>
                <LoadingMessage>Loading map...</LoadingMessage>
            </MapWrapper>
        );
    }

    if (!MapComponent) {
        return (
            <MapWrapper>
                <MapTitle>Weather Map - {coordinates.name}</MapTitle>
                <LoadingMessage>Unable to load map</LoadingMessage>
            </MapWrapper>
        );
    }

    const { MapContainer, TileLayer, Marker, Popup } = MapComponent;

    return (
        <MapWrapper>
            <MapTitle>Weather Map - {coordinates.name}</MapTitle>
            <MapContainerStyled>
                <MapContainer
                    center={[coordinates.lat, coordinates.lon]}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* City center marker */}
                    <Marker position={[coordinates.lat, coordinates.lon]}>
                        <Popup>
                            <div>
                                <h4>{coordinates.name}</h4>
                                <p>Weather forecast location</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Temperature markers for each day */}
                    {forecast.map((day, index) => {
                        // Spread markers around the city center
                        const offsetLat = coordinates.lat + (Math.random() - 0.5) * 0.1;
                        const offsetLon = coordinates.lon + (Math.random() - 0.5) * 0.1;

                        return (
                            <Marker
                                key={index}
                                position={[offsetLat, offsetLon]}
                            >
                                <Popup>
                                    <div>
                                        <h4>{day.date}</h4>
                                        <p>{day.icon} {day.description}</p>
                                        <p><strong>{getDisplayTemperature(day.temperature)}{getTemperatureSymbol()}</strong></p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </MapContainerStyled>
        </MapWrapper>
    );
} 