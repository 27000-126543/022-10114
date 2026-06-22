import React from 'react';
import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface GroupItem {
  name: string;
  data: number[];
  color?: string;
}

interface GroupedBarChartProps {
  categories: string[];
  groups: GroupItem[];
  title?: string;
  unit?: string;
  horizontal?: boolean;
  height?: number | string;
  loading?: boolean;
}

const GRADIENT_COLORS = [
  ['#1E3A5F', '#678BC3'],
  ['#C9A96E', '#E8D4A8'],
  ['#8B7EC8', '#B5A8DE'],
];

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

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  categories,
  groups,
  title,
  unit = '',
  horizontal = false,
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
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(30, 58, 95, 0.04)',
        },
      },
    },
    legend: {
      top: title ? 48 : 16,
      right: 16,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 10,
      itemGap: 18,
      textStyle: {
        fontFamily: 'Noto Sans SC',
        fontSize: 12,
        color: 'rgba(30, 58, 95, 0.7)',
      },
    },
    grid: {
      left: horizontal ? 96 : 48,
      right: 32,
      top: title ? 96 : 64,
      bottom: categories.length > 8 ? 56 : 32,
    },
    dataZoom:
      categories.length > 8
        ? [
            {
              type: 'slider',
              show: true,
              xAxisIndex: horizontal ? undefined : 0,
              yAxisIndex: horizontal ? 0 : undefined,
              bottom: horizontal ? undefined : 8,
              left: horizontal ? 8 : undefined,
              height: horizontal ? undefined : 18,
              width: horizontal ? 18 : undefined,
              borderColor: 'transparent',
              backgroundColor: 'rgba(30, 58, 95, 0.04)',
              fillerColor: 'rgba(30, 58, 95, 0.1)',
              handleStyle: {
                color: '#C9A96E',
                borderColor: '#fff',
                borderWidth: 1,
              },
              textStyle: {
                color: 'rgba(30, 58, 95, 0.5)',
                fontFamily: 'Noto Sans SC',
                fontSize: 10,
              },
            },
          ]
        : undefined,
    xAxis: horizontal
      ? {
          type: 'value',
          name: unit,
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
        }
      : {
          type: 'category',
          data: categories,
          axisLine: {
            lineStyle: { color: 'rgba(30, 58, 95, 0.08)' },
          },
          axisTick: { show: false },
          axisLabel: {
            fontFamily: 'Noto Sans SC',
            fontSize: 11,
            color: 'rgba(30, 58, 95, 0.6)',
            interval: 0,
            rotate: categories.length > 6 ? 20 : 0,
          },
        },
    yAxis: horizontal
      ? {
          type: 'category',
          data: categories,
          axisLine: {
            lineStyle: { color: 'rgba(30, 58, 95, 0.08)' },
          },
          axisTick: { show: false },
          axisLabel: {
            fontFamily: 'Noto Sans SC',
            fontSize: 11,
            color: 'rgba(30, 58, 95, 0.6)',
          },
        }
      : {
          type: 'value',
          name: unit,
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
    series: groups.map((g, idx) => {
      const gradient = g.color
        ? [g.color, g.color]
        : GRADIENT_COLORS[idx % GRADIENT_COLORS.length];
      const rgb0 = hexToRgb(gradient[0]);
      const rgb1 = hexToRgb(gradient[1]);

      return {
        name: g.name,
        type: 'bar',
        barGap: '30%',
        barCategoryGap: '40%',
        itemStyle: {
          borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
          color: {
            type: horizontal ? 'linear' : 'linear',
            x: horizontal ? 0 : 0,
            y: horizontal ? 0 : 1,
            x2: horizontal ? 1 : 0,
            y2: horizontal ? 0 : 0,
            colorStops: [
              { offset: 0, color: `rgba(${rgb0.r}, ${rgb0.g}, ${rgb0.b}, 1)` },
              { offset: 1, color: `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.85)` },
            ],
          },
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 12,
            shadowColor: `rgba(${rgb0.r}, ${rgb0.g}, ${rgb0.b}, 0.4)`,
          },
        },
        data: g.data,
        animationDuration: 600,
        animationEasing: 'cubicOut',
      };
    }) as unknown as EChartsOption['series'],
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default GroupedBarChart;
