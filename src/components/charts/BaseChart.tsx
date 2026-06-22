import React, { useEffect, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  height?: number | string;
  loading?: boolean;
  onEvents?: Record<string, (params: unknown) => void>;
}

const BaseChart: React.FC<BaseChartProps> = ({
  option,
  height = 320,
  loading = false,
  onEvents,
}) => {
  const chartRef = useRef<ReactECharts | null>(null);

  const handleResize = useCallback(() => {
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      instance && instance.resize();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const style = {
    height,
    width: '100%',
    position: 'relative' as const,
  };

  const loadingOption = {
    text: '',
    color: '#C9A96E',
    textColor: '#1E3A5F',
    maskColor: 'rgba(255, 255, 255, 0.85)',
    zlevel: 0,
    fontSize: 14,
    showSpinner: true,
    spinnerRadius: 14,
    lineWidth: 3,
    textFontFamily: 'Noto Sans SC',
  };

  return (
    <div style={style}>
      <ReactECharts
        ref={(el) => { chartRef.current = el; }}
        option={option}
        style={{ height: '100%', width: '100%' }}
        onEvents={onEvents}
        opts={{ renderer: 'canvas' }}
        showLoading={loading}
        loadingOption={loadingOption}
        notMerge
        lazyUpdate
      />
    </div>
  );
};

export default BaseChart;
