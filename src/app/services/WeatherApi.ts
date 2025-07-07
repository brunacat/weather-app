// Types for OpenWeatherMap API responses
export interface WeatherData {
    date: string;
    temperature: number;
    description: string;
    icon: string;
}

export interface CityCoordinates {
    lat: number;
    lon: number;
    name: string;
}

export interface ForecastResponse {
    forecast: WeatherData[];
    city: CityCoordinates;
}

// API Configuration
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL;

// Error handling
export class WeatherApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'WeatherApiError';
    }
}

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
export const fetchForecast = async (city: string): Promise<ForecastResponse> => {
    if (!API_KEY) {
        throw new WeatherApiError('API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env.local file.');
    }

    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
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

        // Get one forecast per day (every 8th item = one per day)
        const dailyForecasts = [];
        for (let i = 0; i < 5; i++) {
            dailyForecasts.push(data.list[i * 8]);
        }

        const forecast = dailyForecasts.map((item: any) => ({
            date: new Date(item.dt_txt).toLocaleDateString('pt-PT'),
            temperature: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: getWeatherIcon(item.weather[0].icon)
        }));

        return {
            forecast,
            city: {
                lat: data.city.coord.lat,
                lon: data.city.coord.lon,
                name: data.city.name
            }
        };
    } catch (error) {
        if (error instanceof WeatherApiError) {
            throw error;
        }
        throw new WeatherApiError('Network error. Please check your internet connection.');
    }
};

// Temperature conversion utilities
export const convertToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9 / 5) + 32);
};

export const convertToCelsius = (fahrenheit: number): number => {
    return Math.round((fahrenheit - 32) * 5 / 9);
};
