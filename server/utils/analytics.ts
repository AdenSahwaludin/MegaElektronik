// WIB = UTC+7
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

// Get current date/time components in WIB timezone
const getWibNow = () => {
  const now = new Date();
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS);
  return {
    year: wibNow.getUTCFullYear(),
    month: wibNow.getUTCMonth(),
    date: wibNow.getUTCDate(),
    day: wibNow.getUTCDay(),
  };
};

// Create a Date object for midnight WIB on a given year/month/day
// Midnight WIB = 17:00 UTC previous day (or year-month-day 00:00 WIB = year-month-(day-1) 17:00 UTC)
const wibMidnight = (year: number, month: number, day: number) => {
  // Create UTC date, subtract WIB offset to get the UTC equivalent of midnight WIB
  return new Date(Date.UTC(year, month, day) - WIB_OFFSET_MS);
};

export const getDateFilter = (dateRange: string, startDate?: string, endDate?: string) => {
  const wib = getWibNow();
  const today = wibMidnight(wib.year, wib.month, wib.date);
  const tomorrow = wibMidnight(wib.year, wib.month, wib.date + 1);

  let filter: any = {};
  let days = 1;

  if ((dateRange === "custom" || dateRange === "custom_month") && startDate) {
    // startDate/endDate are "YYYY-MM-DD" strings, treat them as WIB dates
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const start = wibMidnight(sy, sm - 1, sd);
    
    let end: Date;
    if (endDate) {
      const [ey, em, ed] = endDate.split('-').map(Number);
      end = wibMidnight(ey, em - 1, ed + 1); // End of that day = midnight next day
    } else {
      end = tomorrow;
    }
    
    filter = { createdAt: { gte: start, lt: end } };
    const diffTime = Math.abs(end.getTime() - start.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "today") {
    filter = { createdAt: { gte: today, lt: tomorrow } };
    days = 1;
  } else if (dateRange === "week") {
    const weekStart = wibMidnight(wib.year, wib.month, wib.date - wib.day);
    filter = { createdAt: { gte: weekStart, lt: tomorrow } };
    const diffTime = Math.abs(tomorrow.getTime() - weekStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "month") {
    const monthStart = wibMidnight(wib.year, wib.month, 1);
    filter = { createdAt: { gte: monthStart, lt: tomorrow } };
    const diffTime = Math.abs(tomorrow.getTime() - monthStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "last_month") {
    const lastMonthStart = wibMidnight(wib.year, wib.month - 1, 1);
    const lastMonthEnd = wibMidnight(wib.year, wib.month, 1);
    filter = { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } };
    const diffTime = Math.abs(lastMonthEnd.getTime() - lastMonthStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "quarter") {
    const quarterStart = wibMidnight(wib.year, wib.month - (wib.month % 3), 1);
    filter = { createdAt: { gte: quarterStart, lt: tomorrow } };
    const diffTime = Math.abs(tomorrow.getTime() - quarterStart.getTime());
    days = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
  } else if (dateRange === "all") {
    filter = {};
    days = 0; // Will be handled in summary API by fetching first tx
  }
  
  return { filter, days };
};
