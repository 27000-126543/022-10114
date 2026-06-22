import React from 'react';
import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface PieDataItem {
  name: string;
  value: number;
  color?: string;
}

interface RosePieChartProps {
  data: PieDataItem[];
  title?: string;
  center?: [string | number, string | number];
  height?: number | string;
  loading?: boolean;
}

const BRAND_COLORS = ['#1E3A5F', '#C9A96E', '#8B7EC8', '#6FCF97', '#F2994A', '#E05A5A', '#416EB4', '#DDC084'];

const RosePieChart: React.FC<RosePieChartProps> = ({
  data,
  title,
  center = ['40%', '55%'],
  height,
  loading,
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

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
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number };
        return `
          <div style="font-weight:500;margin-bottom:4px;">${p.name}</div>
          <div>数量：<span style="color:#C9A96E;font-weight:600;">${p.value}</span></div>
          <div>占比：<span style="color:#C9A96E;font-weight:600;">${p.percent}%</span></div>
        `;
      },
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      top: 'center',
      right: 8,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 12,
      textStyle: {
        fontFamily: 'Noto Sans SC',
        fontSize: 12,
        color: 'rgba(30, 58, 95, 0.75)',
      },
      formatter: (name: string) => {
        const item = data.find((d) => d.name === name);
        if (!item) return name;
        const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
        return `${name}  ${percent}%`;
      },
    },
    series: [
      {
        name: title || '数据分布',
        type: 'pie',
        radius: ['28%', '72%'],
        center: center as [string, string],
        roseType: 'area',
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          fontFamily: 'Noto Sans SC',
          fontSize: 11,
          color: 'rgba(30, 58, 95, 0.7)',
          formatter: '{d}%',
          alignTo: 'none',
        },
        labelLine: {
          length: 8,
          length2: 10,
          smooth: true,
          lineStyle: {
            color: 'rgba(30, 58, 95, 0.25)',
            width: 1,
          },
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(30, 58, 95, 0.2)',
          },
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 600,
            color: '#1E3A5F',
          },
        },
        data: data.map((d, idx) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: d.color || BRAND_COLORS[idx % BRAND_COLORS.length],
          },
        })),
      },
    ] as EChartsOption['series'],
  };

  return <BaseChart option={option} height={height} loading={loading} />;
};

export default RosePieChart;
