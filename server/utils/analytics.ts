export const getDateFilter = (dateRange: string, startDate?: string, endDate?: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let filter: any = {};
  let days = 1;

  if (dateRange === "custom" && startDate) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : today;
    end.setHours(23, 59, 59, 999);
    
    filter = { createdAt: { gte: start, lte: end } };
    const diffTime = Math.abs(end.getTime() - start.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "today") {
    filter = { createdAt: { gte: today, lt: tomorrow } };
    days = 1;
  } else if (dateRange === "week") {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    filter = { createdAt: { gte: weekStart, lt: tomorrow } };
    const diffTime = Math.abs(tomorrow.getTime() - weekStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    filter = { createdAt: { gte: monthStart, lt: tomorrow } };
    const diffTime = Math.abs(tomorrow.getTime() - monthStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "last_month") {
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    filter = { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } };
    const diffTime = Math.abs(lastMonthEnd.getTime() - lastMonthStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "quarter") {
    const quarterStart = new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 3), 1);
    filter = { createdAt: { gte: quarterStart, lt: tomorrow } };
    const diffTime = Math.abs(tomorrow.getTime() - quarterStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "all") {
    filter = {};
    days = 0; // Will be handled in summary API by fetching first tx
  }
  
  return { filter, days };
};
