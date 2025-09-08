import type { HistoricalDataPoint, ProcessedDataPoint } from "../types/dashboard";

export const processMonthlyData = (
  rawData: HistoricalDataPoint[]
): ProcessedDataPoint[] => {
  if (!rawData || rawData.length === 0) return [];

  const sortedData = rawData.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const monthlyData: ProcessedDataPoint[] = [];
  const monthlyGroups: Record<string, HistoricalDataPoint[]> = {};

  for (const dataPoint of sortedData) {
    const date = new Date(dataPoint.timestamp);
    if (date < twelveMonthsAgo) continue;

    const monthKey = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth()
    ).padStart(2, "0")}`;

    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = [];
    }
    monthlyGroups[monthKey].push(dataPoint);
  }

  Object.keys(monthlyGroups)
    .sort()
    .forEach((monthKey) => {
      const monthData = monthlyGroups[monthKey];
      const bestPoint =
        monthData.find(
          (point) => new Date(point.timestamp).getUTCDate() === 1
        ) ||
        monthData.find(
          (point) => new Date(point.timestamp).getUTCDate() <= 5
        ) ||
        monthData[0];

      if (bestPoint) {
        const date = new Date(bestPoint.timestamp);
        monthlyData.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }),
          timestamp: bestPoint.timestamp,
          apy: bestPoint.apy || 0,
          tvl: bestPoint.tvlUsd || 0,
          actualDay: date.getUTCDate(),
          fullDate: date.toISOString().split("T")[0],
        });
      }
    });

  return monthlyData
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .slice(-12);
};