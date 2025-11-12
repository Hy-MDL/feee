'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Search, Filter, Network, Database,
  TrendingUp, Building2, Sliders, GitBranch, ChevronDown, ChevronRight,
  CheckCircle, AlertCircle, Info, BarChart3, Globe, DollarSign, Users, CreditCard, TrendingDown
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  MACRO_VARIABLES,
  MACRO_CATEGORIES,
  MacroCategory,
  getVariablesByCategory
} from '@/data/macroVariables';
import { companies, Company } from '@/data/companies';
import { Card, Button, Badge, SectionHeader } from '@/components/ui/DesignSystem';

type AdminTab = 'overview' | 'companies' | 'connections' | 'add-data' | 'api-keys';
type ViewMode = 'list' | 'grid' | 'circuit';

// Sector colors for visualization
const SECTOR_COLORS: Record<string, string> = {
  BANKING: '#06B6D4',
  REALESTATE: '#00FF9F',
  MANUFACTURING: '#8B5CF6',
  SEMICONDUCTOR: '#F59E0B',
  DEFAULT: '#9CA3AF'
};

interface APIKey {
  id: string;
  name: string;
  key: string;
  service: 'openai' | 'alpha-vantage' | 'coinmarketcap' | 'newsapi' | 'other';
  createdAt: string;
  lastUsed?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // API Keys State
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'OpenAI API',
      key: 'sk-••••••••••••••••••••',
      service: 'openai',
      createdAt: '2025-01-01',
      lastUsed: '2025-01-10'
    },
    {
      id: '2',
      name: 'Alpha Vantage',
      key: 'DEMO••••••••••••',
      service: 'alpha-vantage',
      createdAt: '2025-01-05',
      lastUsed: '2025-01-09'
    }
  ]);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    key: '',
    service: 'openai' as APIKey['service']
  });

  // Statistics
  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const sectorCounts = companies.reduce((acc, c) => {
      acc[c.sector] = (acc[c.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgICR = companies.reduce((sum, c) => sum + (c.ratios?.icr || 0), 0) / totalCompanies;
    const healthyCompanies = companies.filter(c => (c.ratios?.icr || 0) > 2.5).length;

    return {
      totalCompanies,
      sectorCounts,
      totalMacroVariables: MACRO_VARIABLES.length,
      totalSectors: Object.keys(sectorCounts).length,
      avgICR: avgICR.toFixed(2),
      healthyCompanies,
      healthPercentage: ((healthyCompanies / totalCompanies) * 100).toFixed(1)
    };
  }, []);

  // Payment & Subscription Analytics
  const paymentData = useMemo(() => {
    const totalUsers = 14253;
    const proUsers = 1847;
    const freeUsers = totalUsers - proUsers;
    const conversionRate = (proUsers / totalUsers * 100).toFixed(1);
    const mrr = proUsers * 29; // $29/month per pro user
    const churnRate = 3.2; // 3.2%

    // Monthly revenue trend (last 6 months)
    const revenueHistory = [
      { month: 'Aug', revenue: 42000, users: 1520 },
      { month: 'Sep', revenue: 45500, users: 1630 },
      { month: 'Oct', revenue: 48200, users: 1710 },
      { month: 'Nov', revenue: 50100, users: 1780 },
      { month: 'Dec', revenue: 52000, users: 1840 },
      { month: 'Jan', revenue: 53600, users: 1847 }
    ];

    // P&L Data
    const monthlyRevenue = mrr;
    const costs = {
      server: 8500,
      api: 4200,
      dataProviders: 6800,
      staff: 15000,
      marketing: 3500,
      other: 2000
    };
    const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    const netProfit = monthlyRevenue - totalCosts;
    const profitMargin = ((netProfit / monthlyRevenue) * 100).toFixed(1);

    // Recent transactions (mock)
    const recentTransactions = [
      { id: 1, user: 'john.doe@email.com', plan: 'Pro', amount: 29, date: '2025-01-06', status: 'success' },
      { id: 2, user: 'jane.smith@email.com', plan: 'Pro', amount: 29, date: '2025-01-06', status: 'success' },
      { id: 3, user: 'mike.wilson@email.com', plan: 'Pro', amount: 29, date: '2025-01-05', status: 'success' },
      { id: 4, user: 'sarah.j@email.com', plan: 'Pro', amount: 29, date: '2025-01-05', status: 'failed' },
      { id: 5, user: 'alex.kim@email.com', plan: 'Pro', amount: 29, date: '2025-01-04', status: 'success' }
    ];

    return {
      totalUsers,
      proUsers,
      freeUsers,
      conversionRate,
      mrr,
      churnRate,
      revenueHistory,
      monthlyRevenue,
      costs,
      totalCosts,
      netProfit,
      profitMargin,
      recentTransactions
    };
  }, []);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.ticker.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === 'all' || c.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [searchTerm, selectedSector]);

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  // API Key handlers
  const handleAddApiKey = () => {
    if (newKeyForm.name && newKeyForm.key) {
      const newKey: APIKey = {
        id: Date.now().toString(),
        name: newKeyForm.name,
        key: newKeyForm.key,
        service: newKeyForm.service,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyForm({ name: '', key: '', service: 'openai' });
      setIsAddingKey(false);
    }
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••••••' + key.substring(key.length - 4);
  };

  const getServiceIcon = (service: APIKey['service']) => {
    switch (service) {
      case 'openai': return '🤖';
      case 'alpha-vantage': return '📈';
      case 'coinmarketcap': return '💰';
      case 'newsapi': return '📰';
      default: return '🔑';
    }
  };

  const getServiceColor = (service: APIKey['service']) => {
    switch (service) {
      case 'openai': return '#10B981';
      case 'alpha-vantage': return '#06B6D4';
      case 'coinmarketcap': return '#F59E0B';
      case 'newsapi': return '#8B5CF6';
      default: return '#9CA3AF';
    }
  };

  return (
    <div className="min-h-screen bg-black text-text-primary">
      {/* Header */}
      <div className="border-b border-border-primary px-6 py-4 bg-black/50 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-light text-accent-cyan mb-1">Admin Dashboard</h1>
            <p className="text-xs text-text-secondary font-light">
              Comprehensive Data Management & System Overview
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-text-tertiary">Total Companies</div>
              <div className="text-2xl font-light text-accent-cyan">{stats.totalCompanies}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-tertiary">Macro Variables</div>
              <div className="text-2xl font-light text-accent-magenta">{stats.totalMacroVariables}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-tertiary">Health Score</div>
              <div className="text-2xl font-light text-accent-emerald">{stats.healthPercentage}%</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['overview', 'companies', 'connections', 'api-keys', 'add-data'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-light whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan'
                  : 'text-text-secondary hover:text-text-primary border border-border-primary hover:border-[#2A2A3F]'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
            {/* System Health */}
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-accent-cyan" />
                <h3 className="text-base font-semibold text-text-primary">System Overview</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">Total Companies</div>
                  <div className="text-2xl font-bold text-text-primary">{stats.totalCompanies}</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">Sectors</div>
                  <div className="text-2xl font-bold text-accent-cyan">{stats.totalSectors}</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">Healthy (ICR&gt;2.5)</div>
                  <div className="text-2xl font-bold text-accent-emerald">{stats.healthyCompanies}</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">Avg ICR</div>
                  <div className="text-2xl font-bold text-accent-magenta">{stats.avgICR}x</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Sector Distribution</h4>
                {Object.entries(stats.sectorCounts).map(([sector, count]) => (
                  <div key={sector}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-text-secondary">{sector}</span>
                      <span className="text-xs font-mono text-accent-cyan">
                        {count} ({((count / stats.totalCompanies) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(count / stats.totalCompanies) * 100}%`,
                          backgroundColor: SECTOR_COLORS[sector] || SECTOR_COLORS.DEFAULT
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Plus size={18} className="text-accent-emerald" />
                <h3 className="text-base font-semibold text-text-primary">Quick Actions</h3>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setActiveTab('add-data')}
                  variant="secondary"
                  size="md"
                  className="w-full justify-start bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan text-accent-cyan"
                >
                  <Plus size={16} className="mr-2" />
                  Add New Company
                </Button>
                <Button
                  onClick={() => setActiveTab('connections')}
                  variant="secondary"
                  size="md"
                  className="w-full justify-start bg-accent-magenta/10 hover:bg-accent-magenta/20 border border-accent-magenta text-accent-magenta"
                >
                  <GitBranch size={16} className="mr-2" />
                  View Connections
                </Button>
                <Button
                  onClick={() => setActiveTab('connections')}
                  variant="secondary"
                  size="md"
                  className="w-full justify-start bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald text-accent-emerald"
                >
                  <Sliders size={16} className="mr-2" />
                  View Network
                </Button>
              </div>

              <div className="mt-6 p-3 bg-background-secondary rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-accent-cyan mt-0.5" />
                  <div className="text-xs text-text-secondary">
                    <p className="font-semibold text-text-primary mb-1">System Status</p>
                    <p>All data pipelines operational. Last sync: 2 minutes ago.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Macro Variables Summary */}
            <Card className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-accent-magenta" />
                <h3 className="text-base font-semibold text-text-primary">Macro Variables Summary</h3>
                <span className="text-xs text-text-tertiary">({MACRO_VARIABLES.length} total)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(MACRO_CATEGORIES).map(([key, category]) => {
                  const vars = getVariablesByCategory(key as MacroCategory);
                  return (
                    <div key={key} className="bg-background-secondary rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{category.icon}</span>
                        <span className="text-xs font-semibold text-text-primary">{category.label}</span>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: category.color }}>
                        {vars.length}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {vars[0]?.name || 'Variables'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Payment & Subscription Analytics */}
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-accent-emerald" />
                <h3 className="text-base font-semibold text-text-primary">Payment & Subscriptions</h3>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">Total Users</div>
                  <div className="text-2xl font-bold text-text-primary">{paymentData.totalUsers.toLocaleString()}</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">Pro Users</div>
                  <div className="text-2xl font-bold text-accent-emerald">{paymentData.proUsers.toLocaleString()}</div>
                  <div className="text-xs text-text-tertiary mt-1">{paymentData.conversionRate}% conversion</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">MRR</div>
                  <div className="text-2xl font-bold text-accent-cyan">${paymentData.mrr.toLocaleString()}</div>
                </div>
                <div className="bg-background-secondary rounded-lg p-3">
                  <div className="text-xs text-text-tertiary mb-1">Churn Rate</div>
                  <div className="text-2xl font-bold text-status-caution">{paymentData.churnRate}%</div>
                </div>
              </div>

              {/* Revenue Trend Chart */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Revenue Trend (6 Months)</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paymentData.revenueHistory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: '#1A1A1F' }}
                      />
                      <YAxis
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        tickLine={false}
                        axisLine={{ stroke: '#1A1A1F' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0D0D0F', border: '1px solid #1A1A1F', borderRadius: '8px' }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Split */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-text-primary mb-3">User Distribution</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-text-secondary">Pro Users</span>
                      <span className="text-xs font-mono text-accent-emerald">
                        {paymentData.proUsers} ({paymentData.conversionRate}%)
                      </span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-emerald transition-all duration-300"
                        style={{ width: `${paymentData.conversionRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-text-secondary">Free Users</span>
                      <span className="text-xs font-mono text-text-tertiary">
                        {paymentData.freeUsers} ({(100 - parseFloat(paymentData.conversionRate)).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-text-tertiary transition-all duration-300"
                        style={{ width: `${100 - parseFloat(paymentData.conversionRate)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* P&L (Profit & Loss) */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={18} className="text-accent-cyan" />
                <h3 className="text-base font-semibold text-text-primary">P&L Statement</h3>
              </div>

              {/* Profitability Overview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="text-xs text-green-400 mb-1">Monthly Revenue</div>
                  <div className="text-2xl font-bold text-green-400">${paymentData.monthlyRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="text-xs text-red-400 mb-1">Total Costs</div>
                  <div className="text-2xl font-bold text-red-400">${paymentData.totalCosts.toLocaleString()}</div>
                </div>
              </div>

              {/* Net Profit */}
              <div className={`p-4 rounded-lg mb-6 ${
                paymentData.netProfit >= 0
                  ? 'bg-accent-emerald/10 border border-accent-emerald/20'
                  : 'bg-status-danger/10 border border-status-danger/20'
              }`}>
                <div className={`text-xs mb-1 ${paymentData.netProfit >= 0 ? 'text-accent-emerald' : 'text-status-danger'}`}>
                  Net Profit
                </div>
                <div className={`text-3xl font-bold ${paymentData.netProfit >= 0 ? 'text-accent-emerald' : 'text-status-danger'}`}>
                  ${Math.abs(paymentData.netProfit).toLocaleString()}
                </div>
                <div className="text-xs text-text-tertiary mt-1">
                  Margin: {paymentData.profitMargin}%
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(paymentData.costs).map(([category, amount]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-text-secondary capitalize">{category}</span>
                        <span className="text-xs font-mono text-text-primary">
                          ${amount.toLocaleString()} ({((amount / paymentData.totalCosts) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-background-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-status-danger transition-all duration-300"
                          style={{ width: `${(amount / paymentData.totalCosts) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-accent-magenta" />
                <h3 className="text-base font-semibold text-text-primary">Recent Transactions</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-primary">
                      <th className="text-left py-3 text-text-secondary font-semibold">User</th>
                      <th className="text-left py-3 text-text-secondary font-semibold">Plan</th>
                      <th className="text-right py-3 text-text-secondary font-semibold">Amount</th>
                      <th className="text-left py-3 text-text-secondary font-semibold">Date</th>
                      <th className="text-left py-3 text-text-secondary font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentData.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border-primary/50">
                        <td className="py-3 text-text-primary">{transaction.user}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-accent-cyan/20 text-accent-cyan text-xs rounded">
                            {transaction.plan}
                          </span>
                        </td>
                        <td className="text-right py-3 font-mono text-text-primary">${transaction.amount}</td>
                        <td className="py-3 text-text-tertiary">{transaction.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            transaction.status === 'success'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* COMPANIES TAB */}
        {activeTab === 'companies' && (
          <div className="max-w-7xl">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background-secondary border border-border-primary rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-background-secondary border border-border-primary rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
              >
                <option value="all">All Sectors</option>
                {Object.keys(stats.sectorCounts).map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              <div className="flex gap-2 border-l border-border-primary pl-4">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                  <Database size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                  <BarChart3 size={18} />
                </button>
              </div>
            </div>

            {/* Companies List */}
            <div className="space-y-3">
              {filteredCompanies.map(company => (
                <Card key={company.ticker} className="hover:border-[#2A2A3F] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: SECTOR_COLORS[company.sector] || SECTOR_COLORS.DEFAULT }}
                      >
                        {company.ticker.substring(0, 2)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-text-primary">{company.name}</h4>
                          <span className="px-2 py-0.5 bg-background-secondary text-text-tertiary text-xs rounded">
                            {company.ticker}
                          </span>
                          <span
                            className="px-2 py-0.5 text-xs rounded"
                            style={{
                              backgroundColor: `${SECTOR_COLORS[company.sector]}20`,
                              color: SECTOR_COLORS[company.sector]
                            }}
                          >
                            {company.sector}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-text-tertiary">Revenue:</span>
                            <span className="ml-2 font-mono text-text-primary">
                              ${company.financials.revenue.toLocaleString()}M
                            </span>
                          </div>
                          <div>
                            <span className="text-text-tertiary">Net Income:</span>
                            <span className="ml-2 font-mono text-text-primary">
                              ${company.financials.net_income.toLocaleString()}M
                            </span>
                          </div>
                          <div>
                            <span className="text-text-tertiary">ICR:</span>
                            <span className={`ml-2 font-mono font-semibold ${
                              (company.ratios?.icr || 0) > 2.5 ? 'text-accent-emerald' :
                              (company.ratios?.icr || 0) > 2 ? 'text-status-caution' : 'text-status-danger'
                            }`}>
                              {company.ratios?.icr?.toFixed(2) || 'N/A'}x
                            </span>
                          </div>
                          <div>
                            <span className="text-text-tertiary">Debt:</span>
                            <span className="ml-2 font-mono text-text-primary">
                              ${company.financials.total_debt.toLocaleString()}M
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 text-text-tertiary hover:text-accent-cyan transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-text-tertiary hover:text-status-danger transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <Database size={48} className="mx-auto mb-3 text-text-tertiary opacity-50" />
                <p className="text-text-secondary">No companies found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* CONNECTIONS TAB - Circuit Diagram View */}
        {activeTab === 'connections' && (
          <div className="max-w-7xl">
            <div className="mb-6">
              <h2 className="text-xl font-light text-text-primary mb-2">System Connections & Relationships</h2>
              <p className="text-sm text-text-secondary">
                Visualize how macro variables, sectors, and companies are interconnected
              </p>
            </div>

            <Card>
              <div className="text-center py-12">
                <Network size={64} className="mx-auto mb-4 text-accent-cyan opacity-50" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Circuit Diagram Visualization
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  Interactive 4-Level Ontology: Macro → Sector → Company → Asset
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
                  <div className="bg-background-secondary rounded-lg p-4 border-l-4 border-accent-cyan">
                    <div className="text-2xl mb-2">🌐</div>
                    <h4 className="text-sm font-semibold text-accent-cyan mb-1">Level 1: Macro</h4>
                    <p className="text-xs text-text-tertiary">{MACRO_VARIABLES.length} variables</p>
                  </div>

                  <div className="bg-background-secondary rounded-lg p-4 border-l-4 border-accent-magenta">
                    <div className="text-2xl mb-2">🏭</div>
                    <h4 className="text-sm font-semibold text-accent-magenta mb-1">Level 2: Sector</h4>
                    <p className="text-xs text-text-tertiary">{stats.totalSectors} sectors</p>
                  </div>

                  <div className="bg-background-secondary rounded-lg p-4 border-l-4 border-accent-emerald">
                    <div className="text-2xl mb-2">🏢</div>
                    <h4 className="text-sm font-semibold text-accent-emerald mb-1">Level 3: Company</h4>
                    <p className="text-xs text-text-tertiary">{stats.totalCompanies} companies</p>
                  </div>

                  <div className="bg-background-secondary rounded-lg p-4 border-l-4 border-yellow-400">
                    <div className="text-2xl mb-2">💎</div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-1">Level 4: Asset</h4>
                    <p className="text-xs text-text-tertiary">Individual products</p>
                  </div>
                </div>

                <Button
                  onClick={() => window.location.href = '/network-graph'}
                  variant="primary"
                  size="lg"
                  className="mt-8"
                >
                  Open Interactive Network Graph
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* API KEYS TAB */}
        {activeTab === 'api-keys' && (
          <div className="max-w-5xl">
            <div className="mb-6">
              <h2 className="text-xl font-light text-text-primary mb-2">API Keys Management</h2>
              <p className="text-sm text-text-secondary">
                Securely manage API keys for third-party services used across the platform
              </p>
            </div>

            {/* API Keys List */}
            <div className="space-y-4 mb-6">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="hover:border-[#2A2A3F] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Service Icon */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${getServiceColor(apiKey.service)}20` }}
                      >
                        {getServiceIcon(apiKey.service)}
                      </div>

                      {/* Key Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-text-primary">{apiKey.name}</h4>
                          <span
                            className="px-2 py-0.5 text-xs rounded font-medium"
                            style={{
                              backgroundColor: `${getServiceColor(apiKey.service)}20`,
                              color: getServiceColor(apiKey.service)
                            }}
                          >
                            {apiKey.service.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-text-tertiary">API Key:</span>
                            <span className="ml-2 font-mono text-text-primary">
                              {maskApiKey(apiKey.key)}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-tertiary">Created:</span>
                            <span className="ml-2 text-text-primary">{apiKey.createdAt}</span>
                          </div>
                          <div>
                            <span className="text-text-tertiary">Last Used:</span>
                            <span className="ml-2 text-accent-emerald">
                              {apiKey.lastUsed || 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey.key);
                          alert('API key copied to clipboard!');
                        }}
                        className="p-2 text-text-tertiary hover:text-accent-cyan transition-colors"
                        title="Copy API Key"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        className="p-2 text-text-tertiary hover:text-status-danger transition-colors"
                        title="Delete API Key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {apiKeys.length === 0 && (
                <Card className="text-center py-12">
                  <Database size={48} className="mx-auto mb-3 text-text-tertiary opacity-50" />
                  <p className="text-text-secondary mb-4">No API keys configured yet</p>
                  <Button
                    onClick={() => setIsAddingKey(true)}
                    variant="primary"
                    size="md"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First API Key
                  </Button>
                </Card>
              )}
            </div>

            {/* Add New Key Form */}
            {isAddingKey ? (
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <Plus size={20} className="text-accent-cyan" />
                  <h3 className="text-lg font-semibold text-text-primary">Add New API Key</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-text-tertiary mb-2">Service *</label>
                    <select
                      value={newKeyForm.service}
                      onChange={(e) => setNewKeyForm({ ...newKeyForm, service: e.target.value as APIKey['service'] })}
                      className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                    >
                      <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
                      <option value="alpha-vantage">Alpha Vantage (Stock Data)</option>
                      <option value="coinmarketcap">CoinMarketCap (Crypto Data)</option>
                      <option value="newsapi">NewsAPI (News Sentiment)</option>
                      <option value="other">Other Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-text-tertiary mb-2">Key Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., OpenAI Production Key"
                      value={newKeyForm.name}
                      onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                      className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-text-tertiary mb-2">API Key *</label>
                    <input
                      type="password"
                      placeholder="sk-••••••••••••••••••••"
                      value={newKeyForm.key}
                      onChange={(e) => setNewKeyForm({ ...newKeyForm, key: e.target.value })}
                      className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border-primary">
                    <Button
                      onClick={() => {
                        setIsAddingKey(false);
                        setNewKeyForm({ name: '', key: '', service: 'openai' });
                      }}
                      variant="secondary"
                      size="md"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddApiKey}
                      variant="primary"
                      size="md"
                      className="flex-1"
                      disabled={!newKeyForm.name || !newKeyForm.key}
                    >
                      <Plus size={16} className="mr-2" />
                      Add API Key
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-blue-400 mt-0.5" />
                    <div className="text-xs text-blue-400">
                      <p className="font-semibold mb-1">Security Note:</p>
                      <p>API keys are stored locally in your browser. Never share your keys publicly or commit them to version control.</p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              apiKeys.length > 0 && (
                <Button
                  onClick={() => setIsAddingKey(true)}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Add New API Key
                </Button>
              )
            )}

            {/* Service Documentation Links */}
            <Card className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Info size={18} className="text-accent-cyan" />
                <h3 className="text-base font-semibold text-text-primary">Getting API Keys</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background-secondary rounded-lg p-3 hover:bg-background-tertiary transition-colors border border-border-primary hover:border-accent-cyan"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">OpenAI</h4>
                      <p className="text-xs text-text-tertiary">Get your API key →</p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background-secondary rounded-lg p-3 hover:bg-background-tertiary transition-colors border border-border-primary hover:border-accent-cyan"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Alpha Vantage</h4>
                      <p className="text-xs text-text-tertiary">Get your API key →</p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://coinmarketcap.com/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background-secondary rounded-lg p-3 hover:bg-background-tertiary transition-colors border border-border-primary hover:border-accent-cyan"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">CoinMarketCap</h4>
                      <p className="text-xs text-text-tertiary">Get your API key →</p>
                    </div>
                  </div>
                </a>

                <a
                  href="https://newsapi.org/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background-secondary rounded-lg p-3 hover:bg-background-tertiary transition-colors border border-border-primary hover:border-accent-cyan"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📰</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">NewsAPI</h4>
                      <p className="text-xs text-text-tertiary">Get your API key →</p>
                    </div>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        )}

        {/* ADD DATA TAB */}
        {activeTab === 'add-data' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <Plus size={20} className="text-accent-cyan" />
                <h2 className="text-xl font-light text-text-primary">Add New Company</h2>
              </div>

              <form className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Company Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Samsung Electronics"
                        className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Ticker Symbol *</label>
                      <input
                        type="text"
                        placeholder="e.g., SSNLF"
                        className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs text-text-tertiary mb-1">Sector *</label>
                  <select className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan">
                    <option value="">Select a sector...</option>
                    <option value="BANKING">Banking</option>
                    <option value="REALESTATE">Real Estate</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="SEMICONDUCTOR">Semiconductor</option>
                  </select>
                </div>

                {/* Financials */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Financial Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Revenue (M) *</label>
                      <input
                        type="number"
                        placeholder="e.g., 200000"
                        className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Net Income (M) *</label>
                      <input
                        type="number"
                        placeholder="e.g., 25000"
                        className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Total Debt (M) *</label>
                      <input
                        type="number"
                        placeholder="e.g., 50000"
                        className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border-primary">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                  >
                    Add Company
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-blue-400 mt-0.5" />
                  <div className="text-xs text-blue-400">
                    <p className="font-semibold mb-1">Note:</p>
                    <p>All financial data should be in millions (M). ICR and other ratios will be automatically calculated.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
