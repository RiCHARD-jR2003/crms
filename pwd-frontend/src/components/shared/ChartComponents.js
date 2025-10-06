import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

// Color palette for charts
const COLORS = ['#3498DB', '#27AE60', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C', '#34495E', '#E67E22'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'white', boxShadow: 3, border: '1px solid #E0E0E0' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C3E50', mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Line Chart Component
export const LineChartComponent = ({ data, title, xKey, yKey, color = '#3498DB', height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height: height }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey={xKey} 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <YAxis 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Area Chart Component
export const AreaChartComponent = ({ data, title, xKey, yKey, color = '#3498DB', height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height: height }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey={xKey} 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <YAxis 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Bar Chart Component
export const BarChartComponent = ({ data, title, xKey, yKey, color = '#3498DB', height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height: height }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey={xKey} 
            stroke="#7F8C8D"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={yKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Pie Chart Component
export const PieChartComponent = ({ data, title, dataKey, nameKey, height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height: height }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Multi-line Chart Component
export const MultiLineChartComponent = ({ data, title, lines, height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height: height }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey="month" 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <YAxis 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={{ fill: line.color || COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.color || COLORS[index % COLORS.length], strokeWidth: 2 }}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Stacked Bar Chart Component
export const StackedBarChartComponent = ({ data, title, bars, height = 300 }) => {
  return (
    <Box sx={{ width: '100%', height: height }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis 
            dataKey="name" 
            stroke="#7F8C8D"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#7F8C8D"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              stackId="a"
              fill={bar.color || COLORS[index % COLORS.length]}
              name={bar.name}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  MultiLineChartComponent,
  StackedBarChartComponent
};
