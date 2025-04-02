import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { CalendarIcon } from 'lucide-react';

// Mock Data (Replace with actual data loading)
const generateDailyData = (startDate: Date, days: number) => {
    const data: { date: string; sales: number; transactions: number; revenue: number; aov: number }[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
        const day = format(currentDate, 'yyyy-MM-dd');
        const sales = Math.floor(Math.random() * 100) + 50; // Random sales between 50 and 150
        const transactions = Math.floor(Math.random() * 50) + 20; // Random transactions between 20 and 70
        const revenue = sales * (Math.random() * 10 + 5); // Random price between 5 and 15
        const aov = transactions > 0 ? revenue / transactions : 0;

        data.push({
            date: day,
            sales,
            transactions,
            revenue: parseFloat(revenue.toFixed(2)),
            aov: parseFloat(aov.toFixed(2)),
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
};

const generateMonthlyData = (dailyData: { date: string; sales: number; transactions: number; revenue: number; aov: number }[]) => {
    const monthlyData: { date: string; sales: number; transactions: number; revenue: number; aov: number }[] = [];
    const monthlyMap = new Map<string, { sales: number; transactions: number; revenue: number }>();

    dailyData.forEach((item) => {
        const month = item.date.substring(0, 7); // "yyyy-MM"
        if (monthlyMap.has(month)) {
            const { sales, transactions, revenue } = monthlyMap.get(month)!;
            monthlyMap.set(month, {
                sales: sales + item.sales,
                transactions: transactions + item.transactions,
                revenue: revenue + item.revenue,
            });
        } else {
            monthlyMap.set(month, {
                sales: item.sales,
                transactions: item.transactions,
                revenue: item.revenue,
            });
        }
    });

    monthlyMap.forEach((value, key) => {
        monthlyData.push({
            date: key,
            sales: value.sales,
            transactions: value.transactions,
            revenue: parseFloat(value.revenue.toFixed(2)),
            aov: parseFloat((value.transactions > 0 ? value.revenue / value.transactions : 0).toFixed(2)),
        });
    });
    return monthlyData;
};

// Simple Calendar Component (for local execution)
const Calendar = ({
    selected,
    onSelect,
    numberOfMonths = 1,
    defaultMonth
}: {
    selected: { from: Date | undefined; to?: Date | undefined } | undefined;
    onSelect: (date: { from: Date | undefined; to?: Date | undefined } | undefined) => void;
    numberOfMonths?: number;
    defaultMonth?: Date;
}) => {
    const [currentMonth, setCurrentMonth] = useState(defaultMonth || new Date());
    const today = new Date();

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    };

    const renderMonth = (monthIndex: number) => {
        const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthIndex);
        const daysInMonth = getDaysInMonth(displayMonth);
        const firstDayOfMonth = getFirstDayOfMonth(displayMonth);
        const monthName = displayMonth.toLocaleString('default', { month: 'long' });
        const year = displayMonth.getFullYear();

        let dayCounter = 1;
        const weeks = [];
        for (let i = 0; i < 6; i++) { // Max 6 weeks
            const days = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || dayCounter > daysInMonth) {
                    days.push(<td key={`${monthIndex}-${i}-${j}`} style={{ padding: '8px' }}></td>);
                } else {
                    const fullDate = new Date(year, displayMonth.getMonth(), dayCounter);
                    const isSelected = selected?.from && format(selected.from, 'yyyy-MM-dd') === format(fullDate, 'yyyy-MM-dd') ||
                        (selected?.to && format(selected.to, 'yyyy-MM-dd') === format(fullDate, 'yyyy-MM-dd'));
                    const isInRange = selected?.from && selected?.to &&
                        fullDate >= selected.from && fullDate <= selected.to;
                    const isToday = format(today, 'yyyy-MM-dd') === format(fullDate, 'yyyy-MM-dd');

                    days.push(
                        <td
                            key={`${monthIndex}-${i}-${j}`}
                            style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#8884d8' : isInRange ? '#8884d833' : 'white',
                                color: isSelected ? 'white' : isToday ? '#e55353' : 'inherit',
                                borderRadius: '4px',
                                fontWeight: isToday ? 'bold' : 'normal',
                            }}
                            onClick={() => {
                                if (!selected?.from) {
                                    onSelect({ from: fullDate });
                                } else if (!selected.to) {
                                    if (fullDate < selected.from) {
                                        onSelect({ from: fullDate, to: selected.from });
                                    }
                                    else {
                                        onSelect({ from: selected.from, to: fullDate });
                                    }

                                } else {
                                    onSelect({ from: fullDate });
                                }
                            }}
                        >
                            {dayCounter}
                        </td>
                    );
                    dayCounter++;
                }
            }
            weeks.push(<tr key={`${monthIndex}-${i}`}>{days}</tr>);
        }

        return (
            <div style={{ margin: '10px', minWidth: '250px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>{monthName} {year}</h3>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '4px', textAlign: 'center' }}>Sun</th>
                            <th style={{ padding: '4px', textAlign: 'center' }}>Mon</th>
                            <th style={{ padding: '4px', textAlign: 'center' }}>Tue</th>
                            <th style={{ padding: '4px', textAlign: 'center' }}>Wed</th>
                            <th style={{ padding: '4px', textAlign: 'center' }}>Thu</th>
                            <th style={{ padding: '4px', textAlign: 'center' }}>Fri</th>
                            <th style={{ padding: '4px', textAlign: 'center' }}>Sat</th>
                        </tr>
                    </thead>
                    <tbody>{weeks}</tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button onClick={() => setCurrentMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))} style={{ padding: '5px 10px' }}>Previous Month</button>
                    <button onClick={() => setCurrentMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))} style={{ padding: '5px 10px' }}>Next Month</button>
                </div>
            </div>
        );
    };

    const months = [];
    for (let i = 0; i < numberOfMonths; i++) {
        months.push(renderMonth(i));
    }

    return (
        <div style={{ display: 'flex' }}>
            {months}
        </div>
    )
};


const Dashboard = () => {
    const [date, setDate] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        to: new Date(),
    });
    const [dailyData, setDailyData] = useState<{ date: string; sales: number; transactions: number; revenue: number; aov: number }[]>([]);
    const [monthlyData, setMonthlyData] = useState<{ date: string; sales: number; transactions: number; revenue: number; aov: number }[]>([]);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false); // State to control the popover
    const datePickerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (date?.from && date.to) {
            const days = Math.ceil(
                (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)
            );
            const newDailyData = generateDailyData(date.from, days);
            setDailyData(newDailyData);
            setMonthlyData(generateMonthlyData(newDailyData));
        }
    }, [date]);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target as Node)
            ) {
                setDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDateRange = (date: { from: Date | undefined; to?: Date | undefined } | undefined) => {
        if (!date) {
            return 'Select Date Range';
        }
        const start = date.from ? format(date.from, 'PPP') : 'Start Date';
        const end = date.to ? format(date.to, 'PPP') : 'End Date';
        return `${start} - ${end}`;
    };

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#666' }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={`item-${index}`} style={{ margin: 0, fontSize: '14px' }}>
                            <span style={{ fontWeight: 'bold', color: entry.color }}>
                                {entry.name}:
                            </span>{' '}
                            {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ padding: '16px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
                    E-commerce Data Visualization Dashboard
                </h1>
                <p style={{ color: '#666' }}>
                    Visualize key metrics and trends for your e-commerce storefront.
                </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }} ref={datePickerRef}>
                    <button
                        id="date"
                        onClick={() => setDatePickerOpen(!isDatePickerOpen)}
                        style={{
                            width: '300px',
                            textAlign: 'left',
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <CalendarIcon style={{ marginRight: '8px', height: '16px', width: '16px', opacity: 0.5 }} />
                        {formatDateRange(date)}
                    </button>
                    {isDatePickerOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 10,
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            marginTop: '8px'
                        }}>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                style={{ width: 'auto' }}

                            />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                {/* Daily Sales Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                }}>
                    <div style={{ padding: '16px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Daily Sales</h2>
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Total sales per day</p>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.3}
                                    name="Sales"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Sales Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                }}>
                    <div style={{ padding: '16px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Monthly Sales</h2>
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Total sales per month</p>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#82ca9d"
                                    fill="#82ca9d"
                                    fillOpacity={0.3}
                                    name="Sales"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Number of Transactions Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                }}>
                    <div style={{ padding: '16px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Transactions</h2>
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Daily and monthly transactions</p>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="transactions"
                                    stroke="#8884d8"
                                    name="Daily Transactions"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="transactions"
                                    data={monthlyData}
                                    stroke="#82ca9d"
                                    name="Monthly Transactions"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Trends Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                }}>
                    <div style={{ padding: '16px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Revenue Trends</h2>
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Daily and monthly revenue</p>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8884d8"
                                    name="Daily Revenue"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    data={monthlyData}
                                    stroke="#82ca9d"
                                    name="Monthly Revenue"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Average Order Value (AOV) Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                }}>
                    <div style={{ padding: '16px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Average Order Value (AOV)</h2>
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Daily and monthly AOV</p>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="aov"
                                    stroke="#e55353"
                                    name="Daily AOV"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="aov"
                                    data={monthlyData}
                                    stroke="#f4a460"
                                    name="Monthly AOV"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Analysis Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                    gridColumn: '1 / span 1',
                }}>
                    <div style={{ padding: '16px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Trend Analysis</h2>
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Sales trend over time</p>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#8e44ad"
                                    name="Sales Trend"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

