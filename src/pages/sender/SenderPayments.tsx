import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, CheckCircle, Clock, XCircle, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { Payment } from '../../data/types';

export function SenderPayments() {
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

  const totalPaid = payments
    .filter((p) => p.payer_id === user?.user_id && p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.payer_id === user?.user_id && p.payment_status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground">Your payment history for all deliveries (in Indian Rupees ₹).</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Paid</p>
              <p className="text-2xl font-bold flex items-center gap-0.5">
                <IndianRupee className="h-5 w-5" />{totalPaid.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pending Amount</p>
              <p className="text-2xl font-bold flex items-center gap-0.5">
                <IndianRupee className="h-5 w-5" />{pendingAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Payment History</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No payment records yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Payments appear here once a traveller completes your delivery.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((payment, i) => (
              <motion.div
                key={payment.payment_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{payment.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-base font-bold">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${getStatusClass(payment.payment_status)}`}>
                    {getStatusIcon(payment.payment_status)}
                    {payment.payment_status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
