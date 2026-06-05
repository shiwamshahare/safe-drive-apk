/**
 * ScoreTimeline — Score degradation over time line chart
 *
 * Polished SVG implementation with Bezier curves, gradient fills, and event indicators.
 */
import { theme } from '@/theme/colors';
import { FontFamily } from '@/theme/fonts';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

interface ScoreTimelineProps {
  data: { time: number; score: number }[];
  width?: number;
  height?: number;
}

export function ScoreTimeline({
  data,
  width = 300,
  height = 140,
}: ScoreTimelineProps) {
  if (data.length < 2) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noData}>Not enough data for timeline</Text>
      </View>
    );
  }

  const padding = { top: 16, right: 16, bottom: 36, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const times = data.map((d) => d.time);
  const scores = data.map((d) => d.score);
  const maxTime = Math.max(...times);
  const minScore = Math.min(...scores);
  const maxScore = 100;

  // Ensure a reasonable vertical range
  const scoreRange = maxScore - Math.max(0, minScore - 10);

  const getX = (time: number) =>
    padding.left + (maxTime > 0 ? (time / maxTime) * chartWidth : 0);
  const getY = (score: number) =>
    padding.top + ((maxScore - score) / scoreRange) * chartHeight;

  const points = data.map((d) => [getX(d.time), getY(d.score)] as [number, number]);

  // Cubic Bezier curve algorithm helpers
  const controlPoint = (
    current: [number, number],
    previous: [number, number],
    next: [number, number],
    reverse?: boolean
  ): [number, number] => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.15;
    const lengthX = n[0] - p[0];
    const lengthY = n[1] - p[1];
    const angle = Math.atan2(lengthY, lengthX) + (reverse ? Math.PI : 0);
    const length = Math.sqrt(lengthX ** 2 + lengthY ** 2) * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
  };

  const bezierCommand = (
    point: [number, number],
    i: number,
    a: [number, number][]
  ): string => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
  };

  // Build the smooth path
  let pathData = '';
  if (points.length > 0) {
    pathData = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ' ' + bezierCommand(points[i], i, points);
    }
  }

  // Build the gradient fill path (closes the shape to the bottom of the chart area)
  const fillPathData = points.length > 0
    ? `${pathData} L ${getX(maxTime)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`
    : '';

  // Time axis labels
  const formatTime = (ms: number): string => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const timeLabels = [0, maxTime * 0.33, maxTime * 0.66, maxTime].map((t) => ({
    x: getX(t),
    label: formatTime(t),
  }));

  // Score axis labels
  const scoreLabels = [maxScore, Math.round((maxScore + minScore) / 2), Math.max(0, minScore)].map(
    (s) => ({
      y: getY(s),
      label: String(s),
    }),
  );

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.primary} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={theme.primary} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {scoreLabels.map((sl, i) => (
          <Line
            key={`grid-${i}`}
            x1={padding.left}
            y1={sl.y}
            x2={width - padding.right}
            y2={sl.y}
            stroke={theme.border}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Score labels */}
        {scoreLabels.map((sl, i) => (
          <SvgText
            key={`score-${i}`}
            x={padding.left - 8}
            y={sl.y + 4}
            fill={theme.textMuted}
            fontSize={9}
            fontFamily={FontFamily.medium}
            textAnchor="end"
          >
            {sl.label}
          </SvgText>
        ))}

        {/* Time labels */}
        {timeLabels.map((tl, i) => {
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (i === 0) textAnchor = "start";
          else if (i === timeLabels.length - 1) textAnchor = "end";

          return (
            <SvgText
              key={`time-${i}`}
              x={tl.x}
              y={height - 14}
              fill={theme.textMuted}
              fontSize={10}
              fontFamily={FontFamily.medium}
              textAnchor={textAnchor}
            >
              {tl.label}
            </SvgText>
          );
        })}

        {/* Gradient Area Fill */}
        {fillPathData ? (
          <Path d={fillPathData} fill="url(#scoreAreaGradient)" />
        ) : null}

        {/* Smooth Score Line */}
        {pathData ? (
          <Path
            d={pathData}
            stroke={theme.primary}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Highlight points of change / events */}
        {points.map((pt, i) => {
          const scoreVal = data[i].score;
          const prevScoreVal = i > 0 ? data[i - 1].score : 100;
          const isDrop = scoreVal < prevScoreVal;

          if (i === 0) {
            // Start point (Start Driving)
            return (
              <Circle
                key={`point-${i}`}
                cx={pt[0]}
                cy={pt[1]}
                r={4}
                fill={theme.primary}
                stroke={theme.cardAlt}
                strokeWidth={1.5}
              />
            );
          }

          if (i === points.length - 1) {
            // End point
            return (
              <Circle
                key={`point-${i}`}
                cx={pt[0]}
                cy={pt[1]}
                r={4}
                fill={isDrop ? theme.red : theme.green}
                stroke={theme.cardAlt}
                strokeWidth={1.5}
              />
            );
          }

          if (isDrop) {
            // Warning point (deduction event occurred)
            return (
              <React.Fragment key={`point-${i}`}>
                {/* Outer pulsing indicator halo */}
                <Circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={7}
                  fill={theme.red}
                  opacity={0.3}
                />
                {/* Inner dot */}
                <Circle
                  cx={pt[0]}
                  cy={pt[1]}
                  r={3.5}
                  fill={theme.red}
                  stroke={theme.cardAlt}
                  strokeWidth={1}
                />
              </React.Fragment>
            );
          }

          // Otherwise don't show a dot to keep it clean
          return null;
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  noData: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
});
