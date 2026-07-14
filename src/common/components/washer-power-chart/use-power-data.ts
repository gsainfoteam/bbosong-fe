import type { PowerData } from './power-data';

export function usePowerData(): PowerData[] {
  return [
    { time: '10:00', power: 15 },
    { time: '10:10', power: 20 },
    { time: '10:20', power: 350 },
    { time: '10:30', power: 610 },
    { time: '10:40', power: 590 },
    { time: '10:50', power: 430 },
    { time: '11:00', power: 170 },
    { time: '11:10', power: 85 },
    { time: '11:20', power: 50 },
    { time: '11:30', power: 70 },
    { time: '11:40', power: 210 },
    { time: '11:50', power: 300 },
    { time: '12:00', power: 430 },
    { time: '12:10', power: 200 },
    { time: '12:20', power: 180 },
  ];
}