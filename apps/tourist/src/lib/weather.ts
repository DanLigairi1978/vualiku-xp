/**
 * Weather Engine for Vanua Levu (Labasa/Savusavu regions)
 * Coordinates set to center of the island roughly -16.6, 179.3
 */

const LAT = -16.6;
const LON = 179.3;

// API key would usually be in .env
// We'll use a public-safe fallback or mock if not provided
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'MOCK_KEY';

export interface WeatherData {
    temp: number;
    condition: string;
    description: string;
    icon: string;
    humidity: number;
    isRainy: boolean;
    timestamp: number;
}

export async function getVanuaLevuWeather(): Promise<WeatherData> {
    if (API_KEY === 'MOCK_KEY') {
        // Return realistic tropical Fiji weather mock
        return {
            temp: 28,
            condition: 'Partly Cloudy',
            description: 'Scattered clouds with tropical breeze',
            icon: '04d',
            humidity: 75,
            isRainy: false,
            timestamp: Date.now()
        };
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error('Weather fetch failed');

        const data = await response.json();
        const condition = data.weather[0].main;

        return {
            temp: Math.round(data.main.temp),
            condition: condition,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            isRainy: ['Rain', 'Drizzle', 'Thunderstorm'].includes(condition),
            timestamp: Date.now()
        };
    } catch (error) {
        console.error("Weather API error:", error);
        return {
            temp: 27,
            condition: 'Clear',
            description: 'Stable tropical conditions',
            icon: '01d',
            humidity: 70,
            isRainy: false,
            timestamp: Date.now()
        };
    }
}
