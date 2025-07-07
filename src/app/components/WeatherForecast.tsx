'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchForecast, WeatherData, WeatherApiError, convertToFahrenheit } from '../services/WeatherApi';
import TemperatureToggle from './TemperatureToggle';
import TemperatureChart from './TemperatureChart';
import WeatherMap from './WeatherMap';

interface WeatherForecastProps {
    city: string;
}

const ForecastContainer = styled.div`
    margin-top: 32px;
    text-align: center;
    width: 100%;
    @media (max-width: 600px) {
        margin-top: 16px;
    }
`;

const ForecastTitle = styled.h2`
    margin-bottom: 24px;
    color: var(--foreground);
`;

const ForecastGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;

    @media (max-width: 900px) {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
    }
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 8px;
        max-width: 100%;
        padding: 0 4px;
    }
`;

const ForecastCard = styled.div`
    background: var(--gray-alpha-100);
    border: 1px solid var(--gray-alpha-200);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    min-width: 0;
    @media (max-width: 900px) {
        padding: 12px;
    }
    @media (max-width: 600px) {
        padding: 8px;
    }
`;

const Date = styled.div`
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 8px;
`;

const Icon = styled.div`
    font-size: 48px;
    margin: 12px 0;

    @media (max-width: 768px) {
        font-size: 36px;
    }
`;

const Temperature = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: var(--foreground);
    margin-bottom: 8px;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const Description = styled.div`
    color: var(--foreground);
    opacity: 0.8;
    font-size: 14px;
`;

const Loading = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    font-size: 18px;
    color: var(--foreground);
    opacity: 0.7;
`;

const Error = styled.p`
    color: #e53e3e;
    background: rgba(229, 62, 62, 0.1);
    border: 1px solid rgba(229, 62, 62, 0.2);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
`;

export default function WeatherForecast({ city }: WeatherForecastProps) {
    const [forecast, setForecast] = useState<WeatherData[]>([]);
    const [cityData, setCityData] = useState<{ lat: number; lon: number; name: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

    useEffect(() => {
        if (!city) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchForecast(city);
                setForecast(data.forecast);
                setCityData(data.city);
            } catch (err) {
                if (err instanceof WeatherApiError) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [city]);

    const getDisplayTemperature = (celsiusTemp: number): number => {
        if (temperatureUnit === 'fahrenheit') {
            return convertToFahrenheit(celsiusTemp);
        }
        return celsiusTemp;
    };

    const getTemperatureSymbol = (): string => {
        return temperatureUnit === 'celsius' ? '°C' : '°F';
    };

    if (!city) {
        return null;
    }

    if (loading) {
        return (
            <ForecastContainer>
                <ForecastTitle>Loading forecast for {city}...</ForecastTitle>
                <Loading>Loading...</Loading>
            </ForecastContainer>
        );
    }

    if (error) {
        return (
            <ForecastContainer>
                <ForecastTitle>Error</ForecastTitle>
                <Error>{error}</Error>
            </ForecastContainer>
        );
    }

    return (
        <ForecastContainer>
            <ForecastTitle>5-Day Forecast for {city}</ForecastTitle>
            <TemperatureToggle
                unit={temperatureUnit}
                onUnitChange={setTemperatureUnit}
            />

            {forecast && forecast.length > 0 && (
                <>
                    <ForecastGrid>
                        {forecast.map((day, index) => (
                            <ForecastCard key={index}>
                                <Date>{day.date}</Date>
                                <Icon>{day.icon}</Icon>
                                <Temperature>
                                    {getDisplayTemperature(day.temperature)}{getTemperatureSymbol()}
                                </Temperature>
                                <Description>{day.description}</Description>
                            </ForecastCard>
                        ))}
                    </ForecastGrid>

                    <TemperatureChart
                        forecast={forecast}
                        temperatureUnit={temperatureUnit}
                    />

                    {cityData && (
                        <WeatherMap
                            city={city}
                            forecast={forecast}
                            temperatureUnit={temperatureUnit}
                            coordinates={cityData}
                        />
                    )}
                </>
            )}
        </ForecastContainer>
    );
}
