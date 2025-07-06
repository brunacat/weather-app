// Types for OpenWeatherMap API responses
export interface WeatherData {
    date: string;
    temperature: number;
    description: string;
    icon: string;
}

export interface ForecastResponse {
    forecast: WeatherData[];
}

// API Configuration
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

// Error handling
export class WeatherApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'WeatherApiError';
    }
}

// Helper function to format date
const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

// Helper function to format time
const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// Helper function to get weather icon
const getWeatherIcon = (iconCode: string): string => {
    const iconMap: { [key: string]: string } = {
        '01d': '☀️', // clear sky day
        '01n': '🌙', // clear sky night
        '02d': '⛅', // few clouds day
        '02n': '☁️', // few clouds night
        '03d': '☁️', // scattered clouds
        '03n': '☁️',
        '04d': '☁️', // broken clouds
        '04n': '☁️',
        '09d': '🌧️', // shower rain
        '09n': '🌧️',
        '10d': '🌦️', // rain day
        '10n': '🌧️', // rain night
        '11d': '⛈️', // thunderstorm
        '11n': '⛈️',
        '13d': '🌨️', // snow
        '13n': '🌨️',
        '50d': '🌫️', // mist
        '50n': '🌫️'
    };

    return iconMap[iconCode] || '🌤️';
};

// Fetch 5-day forecast
export const fetchForecast = async (city: string): Promise<WeatherData[]> => {
    if (!API_KEY) {
        throw new WeatherApiError('API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env.local file.');
    }

    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new WeatherApiError(`City "${city}" not found. Please check the spelling and try again.`, 404);
            } else if (response.status === 401) {
                throw new WeatherApiError('Invalid API key. Please check your OpenWeatherMap API key.', 401);
            } else {
                throw new WeatherApiError(`Failed to fetch forecast data. Status: ${response.status}`, response.status);
            }
        }

        const data = await response.json();

        // Group forecast by day and get the noon forecast for each day
        const dailyForecasts = data.list.filter((item: any, index: number) => {
            const date = new Date(item.dt * 1000);
            const hour = date.getHours();
            // Get forecast around noon (12:00) for each day
            return hour >= 11 && hour <= 13;
        });

        // If no noon forecasts, take the first forecast of each day
        const forecasts = dailyForecasts.length >= 5
            ? dailyForecasts.slice(0, 5)
            : data.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 5);

        return forecasts.map((item: any) => ({
            date: formatDate(item.dt),
            temperature: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: getWeatherIcon(item.weather[0].icon)
        }));
    } catch (error) {
        if (error instanceof WeatherApiError) {
            throw error;
        }
        throw new WeatherApiError('Network error. Please check your internet connection.');
    }
};

// Fetch both current weather and forecast
export const fetchWeatherData = async (city: string): Promise<ForecastResponse> => {
    try {
        const [forecast] = await Promise.all([
            fetchForecast(city)
        ]);

        return { forecast };
    } catch (error) {
        throw error;
    }
};

// Temperature conversion utilities
export const convertToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9 / 5) + 32);
};

export const convertToCelsius = (fahrenheit: number): number => {
    return Math.round((fahrenheit - 32) * 5 / 9);
};
