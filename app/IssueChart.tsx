'use client';

import { Card } from '@radix-ui/themes';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Cell,
  Tooltip
} from 'recharts';
import React from 'react';

interface Props {
  open: number;
  inProgress: number;
  closed: number;
}

const IssueChart = ({ open, inProgress, closed }: Props) => {
  const data = [
    { label: 'Open', value: open, color: '#f87171' },
    { label: 'In Progress', value: inProgress, color: '#60a5fa' },
    { label: 'Closed', value: closed, color: '#4ade80' },
  ];

  return (
    <Card className='p-4'>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip 
            cursor={{fill: 'transparent'}} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar
            dataKey="value"
            barSize={60}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default IssueChart;
