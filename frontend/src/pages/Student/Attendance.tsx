import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, AlertCircle, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

// Data Types
interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'holiday';
  subject: string;
}

interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  holidays: number;
  attendance: number;
}

// Helper Functions
const calculateStats = (data: Record<string, AttendanceDay>): AttendanceStats => {
  let totalClasses = 0;
  let present = 0;
  let absent = 0;
  let holidays = 0;

  for (const day of Object.values(data)) {
    if (day.status === 'holiday') {
      holidays++;
    } else {
      totalClasses++;
      if (day.status === 'present') {
        present++;
      } else if (day.status === 'absent') {
        absent++;
      }
    }
  }

  const attendance = totalClasses > 0 ? (present / totalClasses) * 100 : 0;

  return { totalClasses, present, absent, holidays, attendance };
};

const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const getLineData = (data: Record<string, AttendanceDay>, selectedSubject: string | null): { date: string; percentage: number }[] => {
  const dates = Object.keys(data).sort();
  if (dates.length === 0) return [];
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  const allDates = getDatesBetween(minDate, maxDate);
  let cumulativeTotal = 0;
  let cumulativePresent = 0;
  const lineData = [];

  for (const date of allDates) {
    const day = data[date];
    if (day && (selectedSubject === null || day.subject === selectedSubject) && day.status !== 'holiday') {
      cumulativeTotal++;
      if (day.status === 'present') {
        cumulativePresent++;
      }
    }
    const percentage = cumulativeTotal > 0 ? (cumulativePresent / cumulativeTotal) * 100 : 0;
    lineData.push({ date, percentage });
  }
  return lineData;
};

const getBarData = (data: Record<string, AttendanceDay>): { subject: string; percentage: number }[] => {
  const subjectStats: Record<string, { total: number; present: number }> = {};
  for (const day of Object.values(data)) {
    if (day.status !== 'holiday') {
      if (!subjectStats[day.subject]) {
        subjectStats[day.subject] = { total: 0, present: 0 };
      }
      subjectStats[day.subject].total++;
      if (day.status === 'present') {
        subjectStats[day.subject].present++;
      }
    }
  }
  return Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    percentage: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
  }));
};

// Chart Components
const COLORS = ['#00C49F', '#FF8042', '#FFBB28'];

const AttendancePieChart = ({ data, theme }: { data: { name: string; value: number }[], theme: 'dark' | 'light' }) => (
  <PieChart width={300} height={300}>
    <Pie
      data={data}
      cx={150}
      cy={150}
      labelLine={false}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <RechartsTooltip />
    <RechartsLegend />
  </PieChart>
);

const AttendanceLineChart = ({ data, theme }: { data: { date: string; percentage: number }[], theme: 'dark' | 'light' }) => (
  <LineChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <RechartsTooltip />
    <RechartsLegend />
    <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
  </LineChart>
);

const AttendanceBarChart = ({ data, selectedSubject, theme }: { data: { subject: string; percentage: number }[], selectedSubject: string | null, theme: 'dark' | 'light' }) => (
  <BarChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="subject" />
    <YAxis />
    <RechartsTooltip />
    <RechartsLegend />
    <Bar dataKey="percentage" fill="#8884d8" />
  </BarChart>
);

// StatCard Component
const StatCard = ({ label, value, icon, theme }: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  theme: 'dark' | 'light' 
}) => (
  <Card className={`p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} shadow-md`}>
    <div className="flex items-center justify-between">
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
      </div>
    </div>
  </Card>
);

// Main Attendance Component
const AttendancePage: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const attendanceData: Record<string, AttendanceDay> = {
    '2025-02-01': { date: '2025-02-01', status: 'present', subject: 'Mathematics' },
    '2025-02-02': { date: '2025-02-02', status: 'present', subject: 'Physics' },
    '2025-02-03': { date: '2025-02-03', status: 'absent', subject: 'Mathematics' },
    '2025-02-04': { date: '2025-02-04', status: 'present', subject: 'Chemistry' },
    '2025-02-05': { date: '2025-02-05', status: 'holiday', subject: 'Holiday' },
    '2025-02-06': { date: '2025-02-06', status: 'present', subject: 'Mathematics' },
    '2025-02-07': { date: '2025-02-07', status: 'absent', subject: 'Physics' },
  };

  const stats = calculateStats(attendanceData);
  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent },
    { name: 'Holidays', value: stats.holidays },
  ];
  const lineData = getLineData(attendanceData, selectedSubject);
  const barData = getBarData(attendanceData);

  const subjects = Array.from(new Set(Object.values(attendanceData).map(day => day.subject).filter(subject => subject !== 'Holiday')));

  // Debugging: Log theme changes
  useEffect(() => {
    console.log('Current theme:', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#121212] text-white p-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <Button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="bg-[#1d1d1d] hover:bg-[#151515] border border-gray-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Overall Attendance */}
        <div className="mb-6 bg-[#0c0c0c] border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold">Overall Attendance</h2>
          <div className="text-4xl font-bold text-[#00ffd0]">{stats.attendance.toFixed(2)}%</div>
          {stats.attendance < 75 && (
            <div className="mt-2 p-2 bg-[#ff5555]/10 text-[#ff5555] rounded-lg border border-[#ff5555]/20">
              <AlertCircle className="inline mr-2" /> Warning: Attendance below 75%!
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            label="Total Classes" 
            value={stats.totalClasses} 
            icon={<Calendar className="w-5 h-5 text-[#00ffd0]" />} 
            theme={theme} 
          />
          <StatCard 
            label="Present" 
            value={stats.present} 
            icon={<Check className="w-5 h-5 text-[#00ffd0]" />} 
            theme={theme} 
          />
          <StatCard 
            label="Absent" 
            value={stats.absent} 
            icon={<X className="w-5 h-5 text-[#ff5555]" />} 
            theme={theme} 
          />
          <StatCard 
            label="Holidays" 
            value={stats.holidays} 
            icon={<Calendar className="w-5 h-5 text-[#ffcb6b]" />} 
            theme={theme} 
          />
        </div>

        {/* Subject Filter */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Subject Filter</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedSubject === subject 
                    ? 'bg-[#00ffd0] text-black' 
                    : 'bg-[#0c0c0c] text-gray-400 hover:bg-[#151515] border border-gray-800'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Analytics */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Attendance Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Attendance Distribution</h3>
              <AttendancePieChart data={pieData} theme={theme} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Attendance Trend</h3>
              <AttendanceLineChart data={lineData} theme={theme} />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-2">Subject-wise Attendance</h3>
              <AttendanceBarChart data={barData} selectedSubject={selectedSubject} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;