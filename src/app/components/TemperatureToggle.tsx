'use client';

import styled from 'styled-components';

interface TemperatureToggleProps {
    unit: 'celsius' | 'fahrenheit';
    onUnitChange: (unit: 'celsius' | 'fahrenheit') => void;
}

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: var(--foreground);
  opacity: 0.8;
`;

const ToggleButton = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'isActive'
}) <{ isActive: boolean }>`
  padding: 6px 12px;
  border: 1px solid var(--gray-alpha-200);
  background: ${props => props.isActive ? '#0070f3' : 'transparent'};
  color: ${props => props.isActive ? 'white' : 'var(--foreground)'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isActive ? '#0051cc' : 'var(--gray-alpha-100)'};
  }

  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }
`;

export default function TemperatureToggle({ unit, onUnitChange }: TemperatureToggleProps) {
    return (
        <ToggleContainer>
            <ToggleLabel>Temperature:</ToggleLabel>
            <ToggleButton
                isActive={unit === 'celsius'}
                onClick={() => onUnitChange('celsius')}
            >
                °C
            </ToggleButton>
            <ToggleButton
                isActive={unit === 'fahrenheit'}
                onClick={() => onUnitChange('fahrenheit')}
            >
                °F
            </ToggleButton>
        </ToggleContainer>
    );
} 