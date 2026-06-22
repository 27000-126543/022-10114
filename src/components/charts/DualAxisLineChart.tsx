import React from 'react';
import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface SeriesItem {
  name: string;
  data: number[];
  color?: string;
  dashed?: boolean;
}

interface DualAxisLineChartProps {
  xAxisData: string[];
  leftSeries: SeriesItem[];
  rightSeries: SeriesItem[];
  leftUnit?: string;
  rightUnit?: string;
  title?: string;
  height?: number | string;
  loading?: boolean;
}

const INDIGO_COLORS = ['#1E3A5F', '#416EB4', '#678BC3'];
const ROSE_COLORS = ['#C9A96E', '#DDC084', '#E05A5A'];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 30, g: 58, b: 95 };
};

const hexToRgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const DualAxisLineChart: React.FC<DualAxisLineChartProps> = ({
  xAxisData,
  leftSeries,
  rightSeries,
  leftUnit = '',
  rightUnit = '',
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
      trigger: 'axis',
      className: 'echarts-tooltip',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: 'rgba(30, 58, 95, 0.2)',
          type: 'dashed',
        },
        crossStyle: {
          color: 'rgba(30, 58, 95, 0.2)',
        },
      },
    },
    legend: {
      top: title ? 48 : 16,
      right: 16,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 4,
      itemGap: 18,
      textStyle: {
        fontFamily: 'Noto Sans SC',
        fontSize: 12,
        color: 'rgba(30, 58, 95, 0.7)',
      },
    },
    grid: {
      left: 48,
      right: 56,
      top: title ? 96 : 64,
      bottom: 32,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: {
        lineStyle: { color: 'rgba(30, 58, 95, 0.08)' },
      },
      axisTick: { show: false },
      axisLabel: {
        fontFamily: 'Noto Sans SC',
        fontSize: 12,
        color: 'rgba(30, 58, 95, 0.6)',
      },
    },
    yAxis: [
      {
        type: 'value',
        name: leftUnit,
        nameTextStyle: {
          fontFamily: 'Noto Sans SC',
          fontSize: 11,
          color: 'rgba(30, 58, 95, 0.5)',
          padding: [0, 0, 0, 8],
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: {
            color: 'rgba(30, 58, 95, 0.05)',
            type: 'dashed',
          },
        },
        axisLabel: {
          fontFamily: 'Noto Sans SC',
          fontSize: 11,
          color: 'rgba(30, 58, 95, 0.5)',
        },
      },
      {
        type: 'value',
        name: rightUnit,
        nameTextStyle: {
          fontFamily: 'Noto Sans SC',
          fontSize: 11,
          color: 'rgba(201, 169, 110, 0.7)',
          padding: [0, 8, 0, 0],
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          fontFamily: 'Noto Sans SC',
          fontSize: 11,
          color: 'rgba(201, 169, 110, 0.7)',
        },
      },
    ],
    series: [
      ...leftSeries.map((s, idx) => ({
        name: s.name,
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: s.color || INDIGO_COLORS[idx % INDIGO_COLORS.length],
        },
        itemStyle: {
          color: s.color || INDIGO_COLORS[idx % INDIGO_COLORS.length],
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle:
          idx === 0
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: hexToRgba(s.color || INDIGO_COLORS[0], 0.12) },
                    { offset: 1, color: hexToRgba(s.color || INDIGO_COLORS[0], 0) },
                  ],
                },
              }
            : undefined,
        data: s.data,
      })),
      ...rightSeries.map((s, idx) => ({
        name: s.name,
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          type: s.dashed ? 'dashed' : 'solid',
          color: s.color || ROSE_COLORS[idx % ROSE_COLORS.length],
        },
        itemStyle: {
          color: s.color || ROSE_COLORS[idx % ROSE_COLORS.length],
          borderWidth: 2,
          borderColor: '#fff',
        },
        data: s.data,
      })),
    ] as unknown as EChartsOption['series'],
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default DualAxisLineChart;
