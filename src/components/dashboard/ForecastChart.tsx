import React from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/finance';
import { useFinance } from '../../store/FinanceContext';

interface ForecastChartProps {
  className?: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ className }) => {
  const { getHouseholdNetWorth, getHouseholdIncome, getPersonalTotalIncome, getHouseholdFixedCosts, data, getWeightedInvestmentReturn, viewMode } = useFinance();

  const netWorth = getHouseholdNetWorth();
  const monthlyIncome = viewMode === 'personal' ? getPersonalTotalIncome() : getHouseholdIncome();
  const fixedCosts = getHouseholdFixedCosts();
  const monthlySavings = monthlyIncome - (fixedCosts + data.variableSpending);
  
  // Annual return rate (default to 5% if no data)
  const annualRate = getWeightedInvestmentReturn() || 0.05;
  const monthlyRate = annualRate / 12;

  // Generate 5-year forecast (60 months)
  // But for dashboard readability, maybe just display next 12 months? 
  // Or yearly points for 10 years?
  // Let's do monthly for 1 year, then yearly? 
  // Let's do 12 months for now to replace the hardcoded "dataHistory".
  
  const generateForecast = () => {
    const points = [];
    let currentWealth = netWorth;
    const today = new Date();

    for (let i = 0; i <= 12; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = date.toLocaleDateString('en-GB', { month: 'short' });
        
        points.push({
            name: monthName,
            value: Math.round(currentWealth),
            savings: Math.round(monthlySavings * i), // Cumulative savings part
        });

        // Add savings and apply growth
        currentWealth += monthlySavings;
        currentWealth *= (1 + monthlyRate);
    }
    return points;
  };

  const chartData = generateForecast();

  // Safety check: ensure we have valid data before rendering
  if (!chartData || chartData.length === 0) {
    return (
      <div className={className} style={{ width: '100%', height: '100%', minHeight: '200px' }}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--color-muted-foreground)', fontSize: 12}} 
                />
                <Tooltip 
                    contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-foreground)'
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Projected Wealth"]}
                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 2 }}
                />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};