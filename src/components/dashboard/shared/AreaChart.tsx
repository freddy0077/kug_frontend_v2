import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AreaChartProps {
  data: any[];
  xKey: string;
  areaKey: string;
  color: string;
  fillOpacity?: number;
  height?: number;
}

const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  xKey, 
  areaKey, 
  color, 
  fillOpacity = 0.3,
  height = 300 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey={xKey} 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          width={40}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '0.375rem',
            border: 'none',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '0.5rem'
          }}
          itemStyle={{ 
            color: '#111827',
            fontSize: '0.875rem'
          }}
        />
        <Area 
          type="monotone" 
          dataKey={areaKey} 
          stroke={color} 
          fill={color} 
          fillOpacity={fillOpacity} 
          strokeWidth={2}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
