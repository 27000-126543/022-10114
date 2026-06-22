import React from 'react';
import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface Indicator {
  name: string;
  max?: number;
}

interface RadarSeriesItem {
  name: string;
  data: number[];
  color?: string;
}

interface RadarChartProps {
  indicators: Indicator[];
  series: RadarSeriesItem[];
  title?: string;
  height?: number | string;
  loading?: boolean;
}

const RADAR_COLORS = ['#1E3A5F', '#C9A96E', '#8B7EC8', '#6FCF97'];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 30, g: 58, b: 95 };
};

const RadarChart: React.FC<RadarChartProps> = ({
  indicators,
  series,
  title,
  height,
  loading,
}) => {
  const normalizedIndicators = indicators.map((i) => ({
    name: i.name,
    max: i.max || 100,
  }));

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
    radar: {
      center: ['50%', '55%'],
      radius: '62%',
      indicator: normalizedIndicators,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        fontFamily: 'Noto Sans SC',
        fontSize: 12,
        color: 'rgba(30, 58, 95, 0.7)',
        padding: [4, 4],
      },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(30, 58, 95, 0.02)',
            'rgba(30, 58, 95, 0.04)',
            'rgba(30, 58, 95, 0.02)',
            'rgba(30, 58, 95, 0.04)',
          ],
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(30, 58, 95, 0.12)',
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(30, 58, 95, 0.08)',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        type: 'radar',
        emphasis: {
          lineStyle: {
            width: 4,
          },
        },
        data: series.map((s, idx) => {
          const color = s.color || RADAR_COLORS[idx % RADAR_COLORS.length];
          const rgb = hexToRgb(color);
          return {
            name: s.name,
            value: s.data,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 2.5,
              color: color,
            },
            itemStyle: {
              color: color,
              borderWidth: 2,
              borderColor: '#fff',
            },
            areaStyle: {
              color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
            },
          };
        }),
      },
    ] as EChartsOption['series'],
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default RadarChart;
