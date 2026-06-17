import { useEffect, useState } from 'react';
import {
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Wallet,
  History } from
'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { Payment } from '../../data/types';


const weeklyData = [
{ name: 'Mon', earnings: 1200 },
{ name: 'Tue', earnings: 3500 },
{ name: 'Wed', earnings: 2800 },
{ name: 'Thu', earnings: 6000 },
{ name: 'Fri', earnings: 4500 },
{ name: 'Sat', earnings: 8200 },
{ name: 'Sun', earnings: 7000 }];

export function EarningsDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    deliveryService.getPaymentsForUser(user.user_id).then((data) => {
      setPayments(data);
      setIsLoading(false);
    });
  }, [user]);

  const completedDeliveries = payments.filter((p) => p.receiver_id === user?.user_id && p.payment_status === 'completed').length;
  const totalEarnings = payments
    .filter((p) => p.receiver_id === user?.user_id && p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = Math.floor(totalEarnings * 0.8); // mock: 80% available

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Earnings</h1>
        <p className="text-muted-foreground">
          Track your income and manage your wallet.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Earnings (This Week)
              </p>
              <h2 className="text-4xl font-bold text-foreground flex items-center gap-1">
                <IndianRupee className="h-8 w-8" />
                {totalEarnings.toLocaleString('en-IN')}
              </h2>
            </div>
            <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" /> +15%
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyData}
                margin={{
                  top: 10,
                  right: 0,
                  left: -20,
                  bottom: 0
                }}>
                
                <defs>
                  <linearGradient
                    id="colorEarnings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--secondary))"
                      stopOpacity={0.3} />
                    
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--secondary))"
                      stopOpacity={0} />
                    
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 12
                  }}
                  dy={10} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 12
                  }}
                  tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px'
                  }}
                  itemStyle={{
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Earnings']} />
                
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEarnings)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-3xl p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Available Balance
            </p>
            <h3 className="text-3xl font-bold mb-2 flex items-center gap-1">
              <IndianRupee className="h-6 w-6" />
              {availableBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Based on {completedDeliveries} completed deliveries
            </p>
            <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Withdraw to Bank <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" /> Payment History
            </h3>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
                ))
              ) : payments.length > 0 ? (
                payments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.payment_id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                    
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-medium truncate">{payment.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span
                    className={`text-sm font-bold whitespace-nowrap ${
                      payment.receiver_id === user?.user_id ? 'text-green-500' : 'text-foreground'
                    }`}>
                    
                      {payment.receiver_id === user?.user_id ? '+ ' : '- '}
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No payment history yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}