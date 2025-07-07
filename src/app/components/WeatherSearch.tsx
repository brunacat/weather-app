'use client';

import { useState } from 'react';
import styled from 'styled-components';
import WeatherForecast from './WeatherForecast';

const PageContainer = styled.div`
  --gray-rgb: 0, 0, 0;
  --gray-alpha-200: rgba(var(--gray-rgb), 0.08);
  --gray-alpha-100: rgba(var(--gray-rgb), 0.05);

  display: grid;
  grid-template-rows: 20px 1fr 20px;
  align-items: center;
  justify-items: center;
  padding: 80px;
  gap: 64px;

  @media (prefers-color-scheme: dark) {
    --gray-rgb: 255, 255, 255;
    --gray-alpha-200: rgba(var(--gray-rgb), 0.145);
    --gray-alpha-100: rgba(var(--gray-rgb), 0.06);
  }

  @media (max-width: 900px) {
    padding: 40px;
    gap: 32px;
  }
  @media (max-width: 600px) {
    padding: 16px;
    gap: 16px;
    padding-bottom: 80px;
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 32px;
  grid-row-start: 2;
  align-items: center;

  @media (max-width: 900px) {
    gap: 20px;
  }
  @media (max-width: 600px) {
    align-items: center;
    gap: 12px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: var(--foreground);
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--foreground);
  opacity: 0.8;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    gap: 8px;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--gray-alpha-200);
  border-radius: 8px;
  font-size: 16px;
  background: var(--background);
  color: var(--foreground);
  min-width: 250px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }

  @media (max-width: 900px) {
    min-width: 180px;
  }
  @media (max-width: 600px) {
    min-width: 0;
    width: 100%;
  }
`;

const SearchButton = styled.button`
  padding: 12px 24px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0051cc;
  }
  @media (max-width: 600px) {
    width: 100%;
  }
`;

export default function WeatherSearch() {
    const [city, setCity] = useState('');
    const [submittedCity, setSubmittedCity] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            setSubmittedCity(city.trim());
        }
    };

    return (
        <PageContainer>
            <Main>
                <Title>Weather App</Title>
                <Subtitle>Enter a city name to get the weather forecast</Subtitle>

                <SearchForm onSubmit={handleSubmit}>
                    <SearchInput
                        type="text"
                        placeholder="Enter a city name"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <SearchButton type="submit">
                        Get Weather
                    </SearchButton>
                </SearchForm>

                {submittedCity && <WeatherForecast city={submittedCity} />}
            </Main>
        </PageContainer>
    );
}