import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { usePowerData } from './use-power-data';

type WasherPowerChartProps = {
  title?: string;
};

export function WasherPowerChart({
  title = '세탁기 전력 사용량',
}: WasherPowerChartProps) {
  const data = usePowerData();

  return (
    <div className="w-full rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-heading text-text-primary">{title}</h2>
        
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e5e5"
            />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              unit="W"
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              formatter={(value) => [`${value} W`, '전력']}
            />

            <Line
              type="monotone"
              dataKey="power"
              stroke="#d68f2a"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}