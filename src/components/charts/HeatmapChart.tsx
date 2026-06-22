import React from 'react';
import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

type HeatmapDataItem = [number, number, number];

interface HeatmapChartProps {
  xCategories: string[];
  yCategories: string[];
  data: HeatmapDataItem[];
  min?: number;
  max?: number;
  title?: string;
  height?: number | string;
  loading?: boolean;
}

const HEATMAP_COLORS = [
  [0, '#E05A5A'],
  [0.3, '#F2994A'],
  [0.5, '#F2C94C'],
  [0.7, '#9DD96F'],
  [0.85, '#6FCF97'],
  [1, '#27AE60'],
];

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  xCategories,
  yCategories,
  data,
  min = 0,
  max = 100,
  title,
  height,
  loading,
}) => {
  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          left: 16,
          top: 12,
          textStyle: {
            fontFamily: 'Noto Serif SC',
            fontSize: 16,
            fontWeight: 600,
            color: '#1E3A5F',
          },
        }
      : undefined,
    tooltip: {
      className: 'echarts-tooltip',
      position: 'top',
      formatter: (params: unknown) => {
        const p = params as { value: number[] };
        const v = p.value;
        return `
          <div style="font-weight:500;margin-bottom:4px;">
            ${yCategories[v[1]]} / ${xCategories[v[0]]}
          </div>
          <div>得分：<span style="color:#C9A96E;font-weight:600;">${v[2]}</span></div>
        `;
      },
    },
    grid: {
      left: yCategories.reduce((m, s) => Math.max(m, s.length * 12), 80) + 16,
      right: 72,
      top: title ? 80 : 56,
      bottom: xCategories.length > 6 ? 80 : 56,
    },
    xAxis: {
      type: 'category',
      data: xCategories,
      axisLine: {
        lineStyle: { color: 'rgba(30, 58, 95, 0.08)' },
      },
      axisTick: { show: false },
      splitArea: { show: false },
      axisLabel: {
        fontFamily: 'Noto Sans SC',
        fontSize: 11,
        color: 'rgba(30, 58, 95, 0.6)',
        interval: 0,
        rotate: xCategories.length > 6 ? 35 : 0,
      },
    },
    yAxis: {
      type: 'category',
      data: yCategories,
      axisLine: {
        lineStyle: { color: 'rgba(30, 58, 95, 0.08)' },
      },
      axisTick: { show: false },
      splitArea: { show: false },
      axisLabel: {
        fontFamily: 'Noto Sans SC',
        fontSize: 11,
        color: 'rgba(30, 58, 95, 0.6)',
      },
    },
    visualMap: {
      min,
      max,
      calculable: true,
      orient: 'vertical',
      right: 12,
      top: 'center',
      itemWidth: 12,
      itemHeight: 140,
      text: ['高', '低'],
      textGap: 8,
      textStyle: {
        fontFamily: 'Noto Sans SC',
        fontSize: 10,
        color: 'rgba(30, 58, 95, 0.5)',
      },
      inRange: {
        color: HEATMAP_COLORS.map((c) => c[1]),
      },
      pieces: [
        { gte: 90, label: '≥90', color: '#27AE60' },
        { gte: 80, lt: 90, label: '80-90', color: '#6FCF97' },
        { gte: 60, lt: 80, label: '60-80', color: '#F2C94C' },
        { lt: 60, label: '<60', color: '#E05A5A' },
      ],
    },
    series: [
      {
        name: 'Heatmap',
        type: 'heatmap',
        data: data.map((d) => [...d]),
        label: {
          show: true,
          fontFamily: 'Noto Sans SC',
          fontSize: 10,
          color: 'rgba(15, 31, 52, 0.7)',
          formatter: (params: unknown) => {
            const p = params as { value: number[] };
            return p.value[2] != null ? String(p.value[2]) : '';
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(30, 58, 95, 0.3)',
            borderColor: '#1E3A5F',
            borderWidth: 1.5,
          },
          label: {
            fontWeight: 600,
            color: '#1E3A5F',
          },
        },
        itemStyle: {
          borderRadius: 3,
          borderWidth: 2,
          borderColor: 'transparent',
        },
      },
    ] as EChartsOption['series'],
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default HeatmapChart;
