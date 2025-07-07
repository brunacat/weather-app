'use client';

import { Chart } from 'react-charts';
import styled from 'styled-components';
import { WeatherData } from '../services/WeatherApi';
import { convertToFahrenheit } from '../services/WeatherApi';

interface TemperatureChartProps {
    forecast: WeatherData[];
    temperatureUnit: 'celsius' | 'fahrenheit';
}

const ChartContainer = styled.div`
  background: var(--gray-alpha-100);
  border: 1px solid var(--gray-alpha-200);
  border-radius: 0.5rem;
  box-shadow: 0 30px 40px rgba(0,0,0,.1);
  padding: 0.5rem;
  margin: 20px 0;
  max-width: 800px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media (max-width: 900px) {
    max-width: 100%;
    height: 260px;
  }
  @media (max-width: 600px) {
    max-width: 100%;
    height: 200px;
    margin: 12px 0;
    padding: 0.25rem;
  }
`;

const ChartTitle = styled.h3`
  text-align: center;
  margin-bottom: 16px;
  color: var(--foreground);
  flex-shrink: 0;
  padding-top: 16px;
`;

const ChartArea = styled.div`
  flex: 1 1 0%;
  width: 100%;
  height: 0; // Let flexbox control the height
  min-height: 0;
  margin: 16px;
`;

export default function TemperatureChart({ forecast, temperatureUnit }: TemperatureChartProps) {
    if (!forecast || forecast.length === 0) {
        return null;
    }

    // Prepare data for the chart
    const data = [
        {
            label: `Temperature (${temperatureUnit === 'celsius' ? '°C' : '°F'})`,
            data: forecast.map(day => ({
                primary: day.date,
                secondary: temperatureUnit === 'fahrenheit'
                    ? convertToFahrenheit(day.temperature)
                    : day.temperature
            }))
        }
    ];

    const primaryAxis = {
        getValue: (datum: any) => datum.primary,
    };

    const secondaryAxes = [
        {
            getValue: (datum: any) => datum.secondary,
            elementType: 'line' as const,
        },
    ];

    return (
        <ChartContainer>
            <ChartTitle>Temperature Evolution</ChartTitle>
            <ChartArea>
                <Chart
                    style={{ width: '100%', height: '100%' }}
                    options={{
                        data,
                        primaryAxis,
                        secondaryAxes,
                        dark: true,
                    }}
                />
            </ChartArea>
        </ChartContainer>
    );
} 