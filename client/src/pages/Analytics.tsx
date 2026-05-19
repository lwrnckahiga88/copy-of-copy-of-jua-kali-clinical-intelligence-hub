import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, Zap, CreditCard, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Analytics() {
  const { user } = useAuth();
  const { data: credits, isLoading: creditsLoading } = trpc.payment.getCredits.useQuery();
  const { data: usageStats, isLoading: usageLoading } = trpc.payment.getUsageStats.useQuery({ days: 30 });
  const { data: paymentHistory, isLoading: historyLoading } = trpc.payment.getPaymentHistory.useQuery();

  if (!user) {
    return <div className="p-8 text-center">Please log in to view analytics</div>;
  }

  const isAdmin = user.role === 'admin';

  // Prepare chart data from usage stats
  const agentUsageData = usageStats?.agentUsageMap
    ? Object.entries(usageStats.agentUsageMap).map(([agent, count]) => ({
        name: agent,
        usage: count,
      }))
    : [];

  // Prepare payment history chart data
  const paymentChartData = paymentHistory
    ? paymentHistory.slice(-10).map(payment => ({
        date: new Date(payment.createdAt).toLocaleDateString(),
        amount: Number(payment.amount),
        credits: payment.credits,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your platform usage and credit consumption</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Credit Balance Card */}
              <Card className="p-6 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Credit Balance</p>
                    <p className="text-3xl font-bold text-foreground">
                      {creditsLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        credits?.balance || 0
                      )}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-accent" />
                </div>
              </Card>

              {/* Total Spent Card */}
              <Card className="p-6 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-foreground">
                      {creditsLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        credits?.totalSpent || 0
                      )}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-red-500" />
                </div>
              </Card>

              {/* Total Earned Card */}
              <Card className="p-6 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                    <p className="text-3xl font-bold text-foreground">
                      {creditsLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        credits?.totalEarned || 0
                      )}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              {/* Agent Usages Card */}
              <Card className="p-6 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Agent Usages</p>
                    <p className="text-3xl font-bold text-foreground">
                      {usageLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        usageStats?.totalUsages || 0
                      )}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card className="p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-4">Agent Usage Distribution (Last 30 Days)</h2>
              {usageLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : agentUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No usage data available</p>
              )}
            </Card>

            {/* Agent Usage List */}
            {agentUsageData.length > 0 && (
              <Card className="p-6 border border-border/50">
                <h2 className="text-xl font-bold mb-4">Usage Breakdown</h2>
                <div className="space-y-3">
                  {agentUsageData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-border rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{
                              width: `${(item.usage / Math.max(...agentUsageData.map(d => d.usage))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{item.usage}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-4">Payment History</h2>
              {historyLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : paymentHistory && paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/30"
                    >
                      <div>
                        <p className="font-medium">
                          {payment.status === 'completed' ? '✓' : payment.status === 'pending' ? '⏳' : '✗'} Transaction{' '}
                          {payment.transactionId.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${Number(payment.amount).toFixed(2)}</p>
                        <p className="text-sm text-accent">{payment.credits} credits</p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-500/10 text-green-700'
                              : payment.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-700'
                              : 'bg-red-500/10 text-red-700'
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No payment history</p>
              )}
            </Card>

            {/* Payment Chart */}
            {paymentChartData.length > 0 && (
              <Card className="p-6 border border-border/50">
                <h2 className="text-xl font-bold mb-4">Payment Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={paymentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      name="Amount ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="credits"
                      stroke="#10b981"
                      name="Credits"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
