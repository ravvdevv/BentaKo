import { useMemo } from "react";
import { useInventoryList, useLowStockItems } from "../hooks/useInventory";
import { useDebtList } from "../hooks/useDebt";
import { useSalesList } from "../hooks/useSales";
import {
  PageContainer, HeaderSection, PageTitle, Subtitle, ReportsGrid, Card,
  CardHeader, SectionTitle, IconWrapper, InsightText, SummaryContainer,
  SummaryItem, LabelContainer, ItemIcon, SummaryLabel, ValueContainer,
  SummaryValue, TrendIndicator, FooterNote, FooterText, LoadingSpinner, ErrorText
} from './reports/newStyles';

// Error component for displaying error states
const ErrorIndicator = ({ message }: { message: string }) => (
  <ErrorText>
    <span>⚠️</span>
    <span>{message}</span>
  </ErrorText>
);

const Spinner = () => <LoadingSpinner />;

// Helper functions for insights
const getInventoryInsight = (_total: number, lowStock: number, outOfStock: number, inventoryValue?: number) => {
  if (outOfStock > 0) {
    return `${outOfStock} ${outOfStock === 1 ? 'item needs' : 'items need'} restocking urgently`;
  }
  if (lowStock > 0) {
    return `${lowStock} ${lowStock === 1 ? 'item is' : 'items are'} running low`;
  }
  return inventoryValue ? `Total inventory value: ₱${inventoryValue.toLocaleString()}` : "All items are well-stocked! 🎉";
};

const getSalesInsight = (revenue: number, _itemsSold: number, avgOrderValue: number, trend: number) => {
  if (revenue === 0) return "No sales recorded yet. Time to start selling!";
  
  const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️';
  const trendText = trend !== 0 ? `${Math.abs(trend)}% ${trend > 0 ? 'increase' : 'decrease'} from last period` : 'stable';
  
  return `Avg. order: ₱${avgOrderValue.toFixed(2)} • ${trendIcon} ${trendText}`;
};

const getDebtsInsight = (active: number, totalDue: number, avgDaysToPay: number) => {
  if (active === 0) return "All caught up! No outstanding debts 🎊";
  
  const insights = [];
  if (totalDue > 0) insights.push(`₱${totalDue.toLocaleString()} total due`);
  if (avgDaysToPay > 0) insights.push(`Avg. ${avgDaysToPay}d to pay`);
  
  return insights.length > 0 ? insights.join(' • ') : `${active} ${active === 1 ? 'debt' : 'debts'} to follow up`;
};

// Helper to calculate percentage change
const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export default function Reports() {
  const { 
    data: inventoryItems, 
    isLoading: isLoadingInventory, 
    error: inventoryError 
  } = useInventoryList();
  
  const { 
    data: lowStockItems, 
    isLoading: isLoadingLowStock,
    error: lowStockError
  } = useLowStockItems();
  
  const { 
    data: debts, 
    isLoading: isLoadingDebts,
    error: debtsError
  } = useDebtList();
  
  const { 
    data: sales, 
    isLoading: isLoadingSales,
    error: salesError
  } = useSalesList();
  
  // Memoize date helper functions and reference dates
  const dateHelpers = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    return {
      today,
      yesterday,
      firstDayOfWeek,
      weekAgo,
      twoWeeksAgo,
      isToday: (date: Date) => date.toDateString() === today.toDateString(),
      isThisWeek: (date: Date) => date >= firstDayOfWeek,
      isThisMonth: (date: Date) => 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear(),
    };
  }, []); // Only recalculate when component mounts

  // Memoize all sales calculations in one pass to avoid multiple iterations
  const salesMetrics = useMemo(() => {
    if (!sales || sales.length === 0) {
      return {
        todaysSales: 0,
        yesterdaySales: 0,
        weeklySales: 0,
        lastWeekSales: 0,
        monthlySales: 0,
        totalRevenue: 0,
        itemsSoldCount: 0,
      };
    }

    let todaysSales = 0;
    let yesterdaySales = 0;
    let weeklySales = 0;
    let lastWeekSales = 0;
    let monthlySales = 0;
    let totalRevenue = 0;
    let itemsSoldCount = 0;

    // Single pass through sales data
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const revenue = sale.price * sale.quantity;
      
      totalRevenue += revenue;
      itemsSoldCount += sale.quantity;

      if (dateHelpers.isToday(saleDate)) {
        todaysSales += revenue;
      }
      
      if (saleDate.toDateString() === dateHelpers.yesterday.toDateString()) {
        yesterdaySales += revenue;
      }
      
      if (dateHelpers.isThisWeek(saleDate)) {
        weeklySales += revenue;
      }
      
      if (saleDate >= dateHelpers.twoWeeksAgo && saleDate < dateHelpers.weekAgo) {
        lastWeekSales += revenue;
      }
      
      if (dateHelpers.isThisMonth(saleDate)) {
        monthlySales += revenue;
      }
    });

    return {
      todaysSales,
      yesterdaySales,
      weeklySales,
      lastWeekSales,
      monthlySales,
      totalRevenue,
      itemsSoldCount,
    };
  }, [sales, dateHelpers]);

  const outOfStockCount = useMemo(() => {
    if (!inventoryItems) return 0;
    return inventoryItems.filter(item => item.stock <= 0).length;
  }, [inventoryItems]);

  // Memoize debt calculations
  const debtMetrics = useMemo(() => {
    if (!debts || debts.length === 0) {
      return {
        activeDebts: [],
        paidDebts: [],
        totalAmountDue: 0,
        avgDaysToPay: 0,
      };
    }

    const activeDebts = debts.filter((debt) => debt.status !== "Paid");
    const paidDebts = debts.filter((debt) => debt.status === "Paid");
    const totalAmountDue = activeDebts.reduce((acc, debt) => acc + debt.amount, 0);
    
    const paidDebtsWithDate = paidDebts.filter(d => d.paidDate);
    const avgDaysToPay = paidDebtsWithDate.length > 0
      ? Math.round(paidDebtsWithDate.reduce((acc, debt) => {
          const created = new Date(debt.createdAt);
          const paid = new Date(debt.paidDate!);
          const diffTime = Math.abs(paid.getTime() - created.getTime());
          return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0) / paidDebtsWithDate.length)
      : 0;

    return {
      activeDebts,
      paidDebts,
      totalAmountDue,
      avgDaysToPay,
    };
  }, [debts]);
  
  // Calculate trends
  const dailyTrend = calculateTrend(salesMetrics.todaysSales, salesMetrics.yesterdaySales);
  const weeklyTrend = calculateTrend(salesMetrics.weeklySales, salesMetrics.lastWeekSales);
  
  // Calculate average order value
  const totalOrders = sales?.length || 1; // Avoid division by zero
  const avgOrderValue = salesMetrics.totalRevenue / totalOrders;
  
  // Inventory value calculation
  const inventoryValue = useMemo(() => 
    inventoryItems?.reduce((acc, item) => acc + (item.price * item.stock), 0) ?? 0,
  [inventoryItems]);

  const reportsData: ReportData[] = useMemo(() => [
    {
      category: "Inventory Overview",
      icon: "📦",
      color: "#3498db",
      insight: getInventoryInsight(
        inventoryItems?.length ?? 0,
        lowStockItems?.length ?? 0,
        outOfStockCount,
        inventoryValue
      ),
      summary: [
        {
          label: "Total Items",
          value: inventoryItems?.length ?? 0,
          isLoading: isLoadingInventory,
          error: inventoryError ? "Error loading inventory" : undefined,
          icon: "📋",
        },
        {
          label: "Inventory Value",
          value: `₱${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          isLoading: isLoadingInventory,
          error: inventoryError ? "Error loading inventory" : undefined,
          icon: "💰",
        },
        {
          label: "Low Stock",
          value: lowStockItems?.length ?? 0,
          isLoading: isLoadingLowStock,
          error: lowStockError ? "Error loading low stock items" : undefined,
          icon: "⚠️",
          highlight: (lowStockItems?.length ?? 0) > 0,
        },
        {
          label: "Out of Stock",
          value: outOfStockCount,
          isLoading: isLoadingInventory,
          error: inventoryError ? "Error loading inventory" : undefined,
          icon: "🚫",
          highlight: outOfStockCount > 0,
        },
      ],
    },
    {
      category: "Sales Performance",
      icon: "💰",
      color: "#27ae60",
      insight: getSalesInsight(salesMetrics.totalRevenue, salesMetrics.itemsSoldCount, avgOrderValue, dailyTrend),
      summary: [
        {
          label: "Today's Sales",
          value: salesMetrics.todaysSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          isLoading: isLoadingSales,
          error: salesError ? "Error loading sales data" : undefined,
          icon: "🛒",
          prefix: "₱",
          trend: dailyTrend,
          trendLabel: 'vs yesterday'
        },
        {
          label: "This Week's Sales",
          value: salesMetrics.weeklySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          isLoading: isLoadingSales,
          error: salesError ? "Error loading sales data" : undefined,
          icon: "📆",
          prefix: "₱",
          trend: weeklyTrend,
          trendLabel: 'vs last week'
        },
        {
          label: "This Month's Sales",
          value: salesMetrics.monthlySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          isLoading: isLoadingSales,
          error: salesError ? "Error loading sales data" : undefined,
          icon: "📅",
          prefix: "₱"
        },
        {
          label: "Avg. Order Value",
          value: avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          isLoading: isLoadingSales,
          error: salesError ? "Error loading sales data" : undefined,
          icon: "📊",
          prefix: "₱"
        },
        {
          label: "Total Items Sold",
          value: salesMetrics.itemsSoldCount.toLocaleString(),
          isLoading: isLoadingSales,
          error: salesError ? "Error loading sales data" : undefined,
          icon: "📦"
        },
      ],
    },
    {
      category: "Debt Tracking",
      icon: "📝",
      color: "#e67e22",
      insight: getDebtsInsight(debtMetrics.activeDebts.length, debtMetrics.totalAmountDue, debtMetrics.avgDaysToPay),
      summary: [
        {
          label: "Active Debts",
          value: debtMetrics.activeDebts.length,
          isLoading: isLoadingDebts,
          error: debtsError ? "Error loading debts" : undefined,
          icon: "⏳",
          highlight: debtMetrics.activeDebts.length > 0,
        },
        {
          label: "Total Amount Due",
          value: `₱${debtMetrics.totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          isLoading: isLoadingDebts,
          error: debtsError ? "Error loading debts" : undefined,
          icon: "💳",
          highlight: debtMetrics.totalAmountDue > 0,
        },
        {
          label: "Paid This Month",
          value: `₱${(debtMetrics.paidDebts.reduce((acc, debt) => acc + debt.amount, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          isLoading: isLoadingDebts,
          error: debtsError ? "Error loading debts" : undefined,
          icon: "✅",
        },
        {
          label: "Avg. Days to Pay",
          value: debtMetrics.avgDaysToPay > 0 ? `${debtMetrics.avgDaysToPay} days` : 'N/A',
          isLoading: isLoadingDebts,
          error: debtsError ? "Error loading debts" : undefined,
          icon: "⏱️"
        },
        {
          label: "Payment Success Rate",
          value: debts && debts.length > 0 && debtMetrics.paidDebts
            ? `${Math.round((debtMetrics.paidDebts.length / debts.length) * 100)}%` 
            : 'N/A',
          isLoading: isLoadingDebts,
          error: debtsError ? "Error loading debts" : undefined,
          icon: "📊"
        }
      ],
    },
  ], [
    inventoryItems,
    lowStockItems,
    outOfStockCount,
    inventoryValue,
    isLoadingInventory,
    inventoryError,
    isLoadingLowStock,
    lowStockError,
    salesMetrics,
    avgOrderValue,
    dailyTrend,
    weeklyTrend,
    isLoadingSales,
    salesError,
    debtMetrics,
    isLoadingDebts,
    debtsError,
    debts,
  ]);

  return (
    <PageContainer>
      <HeaderSection>
        <PageTitle>📈 Business Overview</PageTitle>
        <Subtitle>Here's a quick snapshot of how your business is doing today</Subtitle>
      </HeaderSection>
      
      <ReportsGrid>
        {reportsData.map((report) => (
          <Card key={report.category} borderColor={report.color}>
            <CardHeader>
              <SectionTitle>
                <IconWrapper>{report.icon}</IconWrapper>
                {report.category}
              </SectionTitle>
              <InsightText>{report.insight}</InsightText>
            </CardHeader>
            
            <SummaryContainer>
              {report.summary.map((item: SummaryItem) => {
                const hasHighlight = 'highlight' in item ? item.highlight : false;
                const hasTrend = 'trend' in item && item.trend !== undefined;
                
                return (
                  <SummaryItem 
                    key={item.label} 
                    borderColor={report.color}
                    highlight={hasHighlight}
                  >
                    <LabelContainer>
                      <ItemIcon>{item.icon}</ItemIcon>
                      <SummaryLabel>{item.label}</SummaryLabel>
                    </LabelContainer>
                    
                    <ValueContainer>
                      {item.isLoading ? (
                        <Spinner />
                      ) : item.error ? (
                        <ErrorIndicator message={item.error} />
                      ) : (
                        <>
                          <SummaryValue>
                            {('prefix' in item && item.prefix) || ''}{item.value}
                          </SummaryValue>
                          {hasTrend && (
                            <TrendIndicator trend={item.trend}>
                              {item.trend > 0 ? '↑' : item.trend < 0 ? '↓' : '→'}
                              {Math.abs(item.trend)}% {item.trendLabel}
                            </TrendIndicator>
                          )}
                        </>
                      )}
                    </ValueContainer>
                  </SummaryItem>
                );
              })}
            </SummaryContainer>
          </Card>
        ))}
      </ReportsGrid>
      
      <FooterNote>
        <FooterText>
          💡 <strong>Tip:</strong> Check your inventory regularly to avoid stockouts, 
          and follow up on active debts to maintain healthy cash flow!
        </FooterText>
      </FooterNote>
    </PageContainer>
  );
}

// Define base type for summary items
interface BaseSummaryItem {
  label: string;
  value: string | number;
  isLoading: boolean;
  error?: string;
  icon: string;
  highlight?: boolean;
  prefix?: string;
}

// Define type for items with trend data
interface SummaryItemWithTrend extends BaseSummaryItem {
  trend: number;
  trendLabel: string;
}

// Define type for items without trend data
interface SummaryItemWithoutTrend extends Omit<BaseSummaryItem, 'prefix'> {
  trend?: never;
  trendLabel?: never;
  prefix?: string;
}

// Combined type for all summary items
type SummaryItem = SummaryItemWithTrend | SummaryItemWithoutTrend;

// Define report data type
interface ReportData {
  category: string;
  icon: string;
  color: string;
  insight: string;
  summary: SummaryItem[];
}