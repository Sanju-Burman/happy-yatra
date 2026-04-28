import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, ClipboardCheck, Zap, 
  TrendingUp, ArrowUpRight, BarChart, PieChart as PieChartIcon
} from 'lucide-react';
import { adminGetAnalytics } from '@/api.jsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ label, value, icon: Icon, description, trend }) => (
  <Card className="overflow-hidden border-none shadow-lg bg-card/60 backdrop-blur-md">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={24} />
        </div>
        {trend && (
           <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
             <TrendingUp size={12} /> {trend}
           </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await adminGetAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Platform performance and user insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Users" 
          value={analytics.totals.users} 
          icon={Users} 
          description="Registered travelers"
        />
        <StatCard 
          label="Destinations" 
          value={analytics.totals.destinations} 
          icon={MapPin} 
          description="Available in database"
        />
        <StatCard 
          label="Surveys Done" 
          value={analytics.totals.surveys} 
          icon={ClipboardCheck} 
          trend={`${analytics.surveyCompletionRate}% rate`}
        />
        <StatCard 
          label="Trending Now" 
          value={analytics.totals.trending} 
          icon={Zap} 
          description="Active highlights"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signups Chart */}
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="text-primary" size={20} /> User Signups
            </CardTitle>
            <CardDescription>Daily enrollment over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.signupsByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="_id" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Interests Chart */}
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="text-primary" size={20} /> Budget Preferences
            </CardTitle>
            <CardDescription>Travel style distribution from user surveys</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.surveyBudgets}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {analytics.surveyBudgets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         {/* interests bar chart */}
         <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Top Interests</CardTitle>
            <CardDescription>Common themes selected during onboarding</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.surveyInterests} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="_id" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Destinations Table */}
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Popular Spots
              <ArrowUpRight size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Most viewed destinations across the site</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 pb-6">
              <div className="space-y-4">
                {analytics.topDestinations.map((dest, i) => (
                  <div key={dest.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                         0{i+1}
                       </span>
                       <p className="font-medium group-hover:text-primary transition-colors">{dest.name}</p>
                       {dest.trending && <Badge className="h-4 px-1.5 text-[8px] bg-amber-500/10 text-amber-600 border-none">Trending</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-semibold">{dest.viewCount}</span>
                       <span className="text-[10px] text-muted-foreground uppercase">views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
