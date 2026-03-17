import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  UserCircle, Mail, Phone, Calendar, Globe, ShoppingCart,
  Package, Clock, CheckCircle, Truck, XCircle, Loader2
} from 'lucide-react';

const ORDER_STATUS = {
  pending: { cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', icon: <Clock size={12} />, label: 'Pending' },
  shipped: { cls: 'bg-blue-400/10 border-blue-400/25 text-blue-400', icon: <Truck size={12} />, label: 'Shipped' },
  delivered: { cls: 'bg-green-400/10 border-green-400/25 text-green-400', icon: <CheckCircle size={12} />, label: 'Delivered' },
  cancelled: { cls: 'bg-red-400/10 border-red-400/25 text-red-400', icon: <XCircle size={12} />, label: 'Cancelled' },
};

export default function FarmerProfile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/')
      .then(({ data }) => setOrders(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-brand-elevated border border-brand-border rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {user?.username?.[0]?.toUpperCase() || 'F'}
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-brand-base">{user?.username}</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/25 text-green-400 text-xs font-bold uppercase">
              Farmer
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: <Mail size={16} />, label: 'Email', value: user?.email || 'Not set' },
            { icon: <Phone size={16} />, label: 'Phone', value: user?.phone || 'Not set' },
            { icon: <Calendar size={16} />, label: 'Joined', value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-' },
            { icon: <Globe size={16} />, label: 'Language', value: user?.preferred_language?.toUpperCase() || 'EN' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-brand-surface border border-brand-subtle rounded-xl p-3">
              <div className="p-2 bg-brand-elevated rounded-lg text-green-500">{item.icon}</div>
              <div>
                <div className="text-[11px] text-brand-muted">{item.label}</div>
                <div className="text-sm text-brand-base font-medium">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order History */}
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart size={18} className="text-green-400" />
        <h2 className="font-bold text-brand-base text-lg">My Orders</h2>
        <span className="px-2 py-0.5 rounded-full bg-brand-elevated text-brand-muted text-xs font-bold">{orders.length}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-green-500" size={28} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-brand-muted bg-brand-elevated border border-brand-border rounded-2xl">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">Browse dealers and place your first order</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
            return (
              <div key={order.id} className="bg-brand-surface border border-brand-subtle rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-brand-base text-sm">Order #{order.id}</span>
                    <span className="text-brand-muted text-xs ml-2">from {order.dealer_name}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${st.cls}`}>
                    {st.icon} {st.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">{new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="font-bold text-green-400">₹{order.total_amount}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
