import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Timestamp } from 'firebase/firestore';

const screenWidth = Dimensions.get('window').width;

/** 
 * Generate fake data for each range:
 * - 1D => 24 data points (hourly)
 * - 1W => 14 data points (2/day)
 * - 1M => 15 data points (~1 every 2 days)
 * - 6M => 24 data points (~4/month)
 * - 1Y => 24 data points (~2/month)
 */
function generateFakeStats(range: string) {
  let count = 14; // default to 1W
  let rangeMs = 7 * 24 * 60 * 60 * 1000; // 1W in ms

  switch (range) {
    case '1D':
      count = 24;
      rangeMs = 24 * 60 * 60 * 1000;
      break;
    case '1W':
      count = 14; // 2/day for 7 days
      rangeMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '1M':
      count = 15; // ~1 every 2 days
      rangeMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case '6M':
      count = 24; // ~4 per month, total 6 months
      rangeMs = 180 * 24 * 60 * 60 * 1000;
      break;
    case '1Y':
      count = 24; // ~2 per month for 12 months
      rangeMs = 365 * 24 * 60 * 60 * 1000;
      break;
  }

  const now = Date.now();
  const step = rangeMs / Math.max(1, count - 1);

  const fakeData: StatData[] = [];
  for (let i = 0; i < count; i++) {
    const t = new Date(now - rangeMs + step * i);
    fakeData.push({
      weight: Number((Math.random() * 50).toFixed(2)),
      temperature: Number((Math.random() * 50).toFixed(2)),
      humidity: Number((Math.random() * 70).toFixed(2)),
      timestamp: { toDate: () => t } as Timestamp,
    });
  }
  return fakeData;
}

interface StatData {
  weight?: number;
  temperature?: number;
  humidity?: number;
  timestamp: Timestamp;
}

interface ProcessedChartData {
  values: number[];
  unit: string;
  min: number;
  max: number;
}

/** For the chart tooltip */
interface TooltipData {
  x: number;
  y: number;
  index: number;
  value: number;
}

export default function HiveDetailScreen() {
  const router = useRouter();
  const { hiveId, hiveName } = useLocalSearchParams();

  const [statHistory, setStatHistory] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);

  // Ranges: 1D, 1W, 1M, 6M, 1Y
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '6M' | '1Y'>('1W');
  const [activeTab, setActiveTab] = useState<'weight' | 'temp' | 'humidity'>('weight');

  // For the custom tooltip
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Generate data on mount / timeRange change
  useEffect(() => {
    setLoading(true);
    const data = generateFakeStats(timeRange);
    setStatHistory(data);
    setTooltip(null); // reset tooltip on new data
    setLoading(false);
  }, [timeRange]);

  // Reset tooltip if user switches tab
  useEffect(() => {
    setTooltip(null);
  }, [activeTab]);

  // Convert data for chart
  const processChartData = (values: number[], maxVal: number): ProcessedChartData => {
    const clamped = values.map((v) => Math.min(v, maxVal));
    return {
      values: clamped,
      unit: activeTab === 'weight' ? 'kg' : activeTab === 'temp' ? '°C' : '%',
      min: 0,
      max: maxVal,
    };
  };

  /** Helper function to build the array of Y-values */
  const getActiveData = (): ProcessedChartData => {
    switch (activeTab) {
      case 'weight':
        return processChartData(statHistory.map((s) => s.weight ?? 0), 50);
      case 'temp':
        return processChartData(statHistory.map((s) => s.temperature ?? 0), 50);
      case 'humidity':
        return processChartData(statHistory.map((s) => s.humidity ?? 0), 70);
    }
  };

  const chartData = getActiveData();

  // Generate x-axis labels (e.g. "3/28"). You can refine further if desired.
  const formatLabels = () => {
    if (!statHistory.length) return [];
    return statHistory.map((s) => {
      const d = s.timestamp.toDate();
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
  };
  const labels = formatLabels();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating data...</Text>
      </View>
    );
  }

  // Optional min/avg/max for the current data
  const { values, unit } = chartData;
  const minVal = values.length ? Math.min(...values) : 0;
  const avgVal = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const maxVal = values.length ? Math.max(...values) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{hiveName || `Hive`}</Text>
      </View>

      {/* Time Range */}
      <View style={styles.timeRangeContainer}>
        {['1D', '1W', '1M', '6M', '1Y'].map((r) => (
          <Pressable
            key={r}
            style={[styles.timeRangeButton, timeRange === r && styles.activeTimeRange]}
            onPress={() => setTimeRange(r as typeof timeRange)}
          >
            <Text style={[styles.timeRangeText, timeRange === r && styles.activeTimeRangeText]}>
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab selection (weight, temp, humidity) */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === 'weight' && styles.activeTab]}
          onPress={() => setActiveTab('weight')}
        >
          <Text style={[styles.tabText, activeTab === 'weight' && styles.activeTabText]}>
            Weight
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === 'temp' && styles.activeTab]}
          onPress={() => setActiveTab('temp')}
        >
          <Text style={[styles.tabText, activeTab === 'temp' && styles.activeTabText]}>
            Temperature
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === 'humidity' && styles.activeTab]}
          onPress={() => setActiveTab('humidity')}
        >
          <Text style={[styles.tabText, activeTab === 'humidity' && styles.activeTabText]}>
            Humidity
          </Text>
        </Pressable>
      </View>

      {/* The Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#2D2D2D', // Match container color
            backgroundGradientFrom: '#2D2D2D',
            backgroundGradientTo: '#2D2D2D',
            fillShadowGradient: '#F5A124',
            fillShadowGradientOpacity: 0.5,
            color: () => '#F5A124',
            labelColor: () => '#F5A124',
            strokeWidth: 2,
            decimalPlaces: 0,
            propsForBackgroundLines: {
              strokeWidth: 0.2,
              stroke: '#F5A124',
            },
          }}
          style={{
            borderRadius: 8,
            marginLeft: -20, // shift chart left slightly
          }}
          bezier
          fromZero
          withHorizontalLines
          withVerticalLines={false}
          segments={5}
          formatYLabel={(val) => `${parseInt(val)}${unit}`}
          onDataPointClick={({ index, x, y, value }) => {
            setTooltip({ index, x, y, value });
          }}
          withVerticalLabels={false}
        />
        {/* Tooltip */}
        {tooltip && statHistory[tooltip.index] && (
          <View
            style={[
              styles.tooltip,
              {
                left: tooltip.x - 10, // shift tooltip horizontally to center
                top: tooltip.y + 10,  // position below the data point
              },
            ]}
          >
            <Text style={styles.tooltipText}>
              {formatDate(statHistory[tooltip.index].timestamp.toDate())}
            </Text>
            <Text style={styles.tooltipText}>
              {tooltip.value.toFixed(2)} {unit}
            </Text>
          </View>
        )}
      </View>

      {/* Stats summary (optional) */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{Math.round(minVal)} {unit}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>{Math.round(avgVal)} {unit}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={styles.statValue}>{Math.round(maxVal)} {unit}</Text>
        </View>
      </View>
    </View>
  );
}

/** Simple date formatting, e.g. "Mar 29 14:00" */
function formatDate(d: Date) {
  const mon = d.toLocaleString('default', { month: 'short' });
  return `${mon} ${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A124',
    paddingTop: 60,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5A124',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#5c3d2b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20, // Added padding
    color:'#5c3d2b',
  },
  backButton: {
    marginRight: 16,
    color:'#5c3d2b',    
  },
  backButtonText: {
    fontSize: 40,
    color: '#5c3d2b',
    fontWeight: 'bold',
  },
  title: {
    paddingTop:25,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#5c3d2b',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#F5CB24',
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 20, // Added margin
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timeRangeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTimeRange: {
    backgroundColor: '#5c3d2b',
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 14,
    color: '#5c3d2b',
    fontWeight: '500',
  },
  activeTimeRangeText: {
    color: '#F5CB24',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#5c3d2b',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 16,
    color: '#8C644D',
    fontWeight: '500',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#5c3d2b',
  },
  activeTabText: {
    color: '#5c3d2b',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#2D2D2D',
    paddingTop: 16,
    paddingBottom: 0,
    marginBottom: 20,
    elevation: 2,
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#F5CB24',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tooltipText: {
    color: '#5c3d2b',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5CB24',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    marginHorizontal: 20,
    fontSize: 20,
    color: '#5c3d2b',
    marginBottom: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5c3d2b',
  },
});
