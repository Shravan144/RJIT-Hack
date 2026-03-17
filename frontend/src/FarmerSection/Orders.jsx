import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  ShoppingCart, Clock, Truck, CheckCircle, XCircle, Package,
  Loader2, ChevronDown, ChevronUp, Store
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:   { cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', icon: <Clock size={14} />, label: 'Pending' },
  shipped:   { cls: 'bg-blue-400/10 border-blue-400/25 text-blue-400', icon: <Truck size={14} />, label: 'Shipped' },
  delivered: { cls: 'bg-green-400/10 border-green-400/25 text-green-400', icon: <CheckCircle size={14} />, label: 'Delivered' },
  cancelled: { cls: 'bg-red-400/10 border-red-400/25 text-red-400', icon: <XCircle size={14} />, label: 'Cancelled' },
};

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/');
      setOrders(data.results || data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => tab === 'all' || o.status === tab);

  const tabCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow">
          <ShoppingCart size={20} />
        </div>
        <div>
          <h1 className="font-display font-black text-3xl text-brand-base">My Orders</h1>
          <p className="text-brand-muted text-sm">Track your orders from dealers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-brand-subtle">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-all
              ${tab === t.key ? 'text-green-400 border-green-400' : 'text-brand-muted border-transparent hover:text-brand-base'}`}>
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === t.key ? 'bg-brand-elevated' : 'bg-brand-subtle text-brand-muted'}`}>
              {tabCounts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-brand-muted">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-sm mt-1">Browse dealers to place your first order</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id}
                className="bg-brand-surface border border-brand-subtle rounded-2xl overflow-hidden hover:border-brand-border transition-all">
                <div className="flex flex-wrap items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="w-10 h-10 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-muted">
                    <ShoppingCart size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-brand-base">Order #{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${st.cls}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <p className="text-brand-muted text-xs flex items-center gap-1 mt-0.5">
                      <Store size={11} /> {order.dealer_name} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-green-400 text-lg">₹{order.total_amount}</span>
                    {isExpanded ? <ChevronUp size={16} className="text-brand-muted" /> : <ChevronDown size={16} className="text-brand-muted" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-brand-subtle bg-brand-elevated/50 p-5 animate-fade-down">
                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Items</h4>
                        <div className="flex flex-col gap-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-brand-surface border border-brand-subtle rounded-lg p-3 text-sm">
                              <span className="text-brand-base">{item.product_name || `Product #${item.product}`} × {item.quantity}</span>
                              <span className="text-green-400 font-bold">₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Timeline */}
                    <div className="mt-4 pt-4 border-t border-brand-subtle">
                      <h4 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Order Timeline</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${order.status === 'pending' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-400' : 'bg-brand-subtle'}`}></div>
                        <div className={`flex-1 h-0.5 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-400' : 'bg-brand-subtle'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-400' : 'bg-brand-subtle'}`}></div>
                        <div className={`flex-1 h-0.5 ${order.status === 'delivered' ? 'bg-green-400' : 'bg-brand-subtle'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-400' : 'bg-brand-subtle'}`}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-brand-muted">
                        <span>Ordered</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* Status message */}
                    <div className="mt-4 p-3 rounded-xl bg-brand-surface border border-brand-subtle">
                      <p className="text-sm text-brand-muted">
                        {order.status === 'pending' && 'Your order is pending confirmation from the dealer.'}
                        {order.status === 'shipped' && 'Your order has been shipped and is on its way!'}
                        {order.status === 'delivered' && 'Your order has been delivered successfully.'}
                        {order.status === 'cancelled' && 'This order has been cancelled.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
