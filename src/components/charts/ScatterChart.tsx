import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { EChartsOption } from 'echarts';

interface ScatterPoint {
  x: number;
  y: number;
  value?: number;
  size?: number;
  label?: string;
  id?: string;
}

interface QuadrantLines {
  x?: number;
  y?: number;
}

interface ScatterChartProps {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  title?: string;
  quadrantLines?: QuadrantLines;
  colorRange?: [string, string];
  height?: number | string;
  loading?: boolean;
  onPointClick?: (id: string | undefined, point: ScatterPoint) => void;
}

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

const ScatterChart: React.FC<ScatterChartProps> = ({
  points,
  xLabel,
  yLabel,
  xUnit = '',
  yUnit = '',
  title,
  quadrantLines,
  colorRange,
  height,
  loading,
  onPointClick,
}) => {
  const values = points.map((p) => p.value ?? 0);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 100);
  const minSize = 10;
  const maxSize = 36;
  const sizes = points.map((p) => p.size);
  const minSizeVal = Math.min(...sizes.filter((s) => s !== undefined), 0);
  const maxSizeVal = Math.max(...sizes.filter((s) => s !== undefined), 100);

  const defaultColorRange: [string, string] = colorRange || ['#8DA8D2', '#C9A96E'];
  const rgb0 = hexToRgb(defaultColorRange[0]);
  const rgb1 = hexToRgb(defaultColorRange[1]);

  const xMin = Math.min(...points.map((p) => p.x)) * 0.9;
  const xMax = Math.max(...points.map((p) => p.x)) * 1.1;
  const yMin = Math.min(...points.map((p) => p.y)) * 0.9;
  const yMax = Math.max(...points.map((p) => p.y)) * 1.1;

  const qX = quadrantLines?.x ?? (xMin + xMax) / 2;
  const qY = quadrantLines?.y ?? (yMin + yMax) / 2;

  const getColor = (v: number) => {
    if (maxValue === minValue) return defaultColorRange[1];
    const t = (v - minValue) / (maxValue - minValue);
    const r = Math.round(rgb0.r + (rgb1.r - rgb0.r) * t);
    const g = Math.round(rgb0.g + (rgb1.g - rgb0.g) * t);
    const b = Math.round(rgb0.b + (rgb1.b - rgb0.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getSize = (s: number | undefined, v: number) => {
    if (s !== undefined) {
      if (maxSizeVal === minSizeVal) return (minSize + maxSize) / 2;
      const t = (s - minSizeVal) / (maxSizeVal - minSizeVal);
      return minSize + (maxSize - minSize) * t;
    }
    if (maxValue === minValue) return (minSize + maxSize) / 2;
    const t = (v - minValue) / (maxValue - minValue);
    return minSize + (maxSize - minSize) * t;
  };

  const scatterData = useMemo(
    () =>
      points.map((p) => ({
        value: [p.x, p.y, p.value ?? 0],
        itemStyle: {
          color: getColor(p.value ?? 0),
          opacity: 0.85,
          borderWidth: 2,
          borderColor: '#fff',
          shadowBlur: 8,
          shadowColor: `${getColor(p.value ?? 0)}55`,
        },
        symbolSize: getSize(p.size, p.value ?? 0),
        label: p.label
          ? {
              show: true,
              position: 'top',
              fontFamily: 'Noto Sans SC',
              fontSize: 10,
              color: 'rgba(30, 58, 95, 0.6)',
              formatter: p.label,
            }
          : undefined,
        _point: p,
      })),
    [points]
  );

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
        const p = params as { value: number[]; data: { _point?: ScatterPoint } };
        const pt = p.data?._point;
        const lines = [
          `<div style="font-weight:500;margin-bottom:4px;">${pt?.label || '数据点'}</div>`,
          `<div>${xLabel}：${p.value[0]}${xUnit}</div>`,
          `<div>${yLabel}：${p.value[1]}${yUnit}</div>`,
        ];
        if (pt?.value !== undefined) {
          lines.push(`<div>数值：${pt.value}</div>`);
        }
        return lines.join('');
      },
    },
    grid: {
      left: 56,
      right: 32,
      top: title ? 80 : 56,
      bottom: 56,
    },
    xAxis: {
      type: 'value',
      name: `${xLabel}${xUnit ? `(${xUnit})` : ''}`,
      nameLocation: 'middle',
      nameGap: 28,
      min: xMin,
      max: xMax,
      nameTextStyle: {
        fontFamily: 'Noto Sans SC',
        fontSize: 12,
        color: 'rgba(30, 58, 95, 0.7)',
      },
      axisLine: {
        lineStyle: { color: 'rgba(30, 58, 95, 0.08)' },
      },
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
    yAxis: {
      type: 'value',
      name: `${yLabel}${yUnit ? `(${yUnit})` : ''}`,
      nameLocation: 'middle',
      nameGap: 44,
      min: yMin,
      max: yMax,
      nameTextStyle: {
        fontFamily: 'Noto Sans SC',
        fontSize: 12,
        color: 'rgba(30, 58, 95, 0.7)',
      },
      axisLine: {
        lineStyle: { color: 'rgba(30, 58, 95, 0.08)' },
      },
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
    series: [
      {
        type: 'scatter',
        data: scatterData,
        emphasis: {
          scale: 1.2,
          itemStyle: {
            opacity: 1,
            shadowBlur: 16,
          },
        },
      },
      {
        type: 'line',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: 'rgba(30, 58, 95, 0.3)',
            type: 'dashed',
            width: 1,
          },
          label: { show: false },
          data: [
            { xAxis: qX },
            { yAxis: qY },
          ],
        },
        data: [],
      } as unknown as EChartsOption['series'],
      {
        type: 'scatter',
        symbol: 'none',
        label: {
          show: true,
          position: 'inside',
          fontFamily: 'Noto Sans SC',
          fontSize: 11,
          color: 'rgba(30, 58, 95, 0.35)',
          formatter: (params: unknown) => {
            const p = params as { value: number[] };
            const cx = p.value[0];
            const cy = p.value[1];
            if (cx < qX && cy > qY) return 'Ⅱ 高优改进';
            if (cx > qX && cy > qY) return 'Ⅰ 标杆优势';
            if (cx < qX && cy < qY) return 'Ⅲ 重点改进';
            if (cx > qX && cy < qY) return 'Ⅳ 潜力挖掘';
            return '';
          },
        },
        data: [
          { value: [(xMin + qX) / 2, (yMax + qY) / 2] },
          { value: [(qX + xMax) / 2, (yMax + qY) / 2] },
          { value: [(xMin + qX) / 2, (yMin + qY) / 2] },
          { value: [(qX + xMax) / 2, (yMin + qY) / 2] },
        ],
      },
    ] as EChartsOption['series'],
  };

  const onEvents = onPointClick
    ? {
        click: (params: unknown) => {
          const p = params as { data: { _point?: ScatterPoint } };
          if (p.data?._point) {
            onPointClick(p.data._point.id, p.data._point);
          }
        },
      }
    : undefined;

  return (
    <BaseChart
      option={option}
      height={height}
      loading={loading}
      onEvents={onEvents}
    />
  );
};

export default ScatterChart;
