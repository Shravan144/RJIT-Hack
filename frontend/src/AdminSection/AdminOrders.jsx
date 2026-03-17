import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiData, getApiMessage } from '../utils/apiMessage';
import PaginationControls from '../components/PaginationControls';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ count: 0, next: null, previous: null });
  const [stats, setStats] = useState({ all: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil((pageMeta.count || 0) / 10));

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/', {
        params: {
          page,
          page_size: 10,
        },
      });
      setOrders(data.results || []);
      setPageMeta({ count: data.count || 0, next: data.next, previous: data.previous });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(getApiMessage(error, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/orders/stats/');
      setStats(getApiData(data) || { all: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0 });
    } catch (error) {
      toast.error(getApiMessage(error, 'Failed to load order statistics'));
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-brand-base mb-6 tracking-tight">Orders Monitor</h1>
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-brand-surface border border-brand-subtle rounded-3xl animate-pulse shadow-sm" />)}
        </div>
      </div>
    );
  }

  const STATUS_COLORS = {
    pending: 'text-amber-500 bg-amber-50 border-amber-200',
    shipped: 'text-blue-500 bg-blue-50 border-blue-200',
    delivered: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    cancelled: 'text-red-500 bg-red-50 border-red-200',
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Package size={24} className="stroke-2 text-emerald-400" />
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base tracking-tight">Orders Monitor</h1>
          </div>
          <p className="text-brand-muted font-medium md:ml-[64px]">Track and review all agricultural product orders across the platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-sm text-center md:text-left flex flex-col justify-center">
          <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-1.5 flex justify-center md:justify-start items-center gap-1.5"><Package size={14}/> Total</p>
          <p className="text-3xl font-display font-black text-brand-base">{stats.all}</p>
        </div>
        <div className="bg-brand-surface border border-amber-200 rounded-2xl p-4 shadow-sm text-center md:text-left flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full z-0"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex justify-center md:justify-start items-center gap-1.5"><Clock size={14}/> Pending</p>
            <p className="text-3xl font-display font-black text-amber-500">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-brand-surface border border-blue-200 rounded-2xl p-4 shadow-sm text-center md:text-left flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full z-0"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1.5 flex justify-center md:justify-start items-center gap-1.5"><Truck size={14}/> Shipped</p>
            <p className="text-3xl font-display font-black text-blue-500">{stats.shipped}</p>
          </div>
        </div>
        <div className="bg-brand-surface border border-emerald-200 rounded-2xl p-4 shadow-sm text-center md:text-left flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full z-0"></div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex justify-center md:justify-start items-center gap-1.5"><CheckCircle size={14}/> Delivered</p>
            <p className="text-3xl font-display font-black text-emerald-500">{stats.delivered}</p>
          </div>
        </div>
        <div className="bg-brand-surface border border-red-200 rounded-2xl p-4 shadow-sm text-center md:text-left flex flex-col justify-center relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full z-0"></div>
           <div className="relative z-10">
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1.5 flex justify-center md:justify-start items-center gap-1.5"><XCircle size={14}/> Cancelled</p>
            <p className="text-3xl font-display font-black text-red-500">{stats.cancelled}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-brand-surface border border-brand-border p-5 rounded-3xl shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-subtle pb-4 mb-4 gap-4">
              <div>
                <div className="flex items-center gap-3">
                   <h3 className="text-lg font-bold text-brand-base tracking-tight">Order #{order.id}</h3>
                   <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] || 'text-brand-muted bg-brand-bg border-brand-border'}`}>
                     {order.status}
                   </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5">
                   <p className="text-sm font-medium text-brand-muted">
                     From: <strong className="text-brand-base">{order.farmer_name}</strong>
                   </p>
                   <span className="hidden sm:inline text-slate-300">•</span>
                   <p className="text-sm font-medium text-brand-muted">
                     To: <strong className="text-brand-base">{order.dealer_name}</strong>
                   </p>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5 uppercase tracking-widest">
                  <Clock size={12} className="stroke-2"/> {new Date(order.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-left md:text-right w-full md:w-auto bg-brand-bg md:bg-transparent p-3 md:p-0 rounded-xl border border-brand-subtle md:border-none">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Value</p>
                <p className="text-2xl font-display font-black text-emerald-600">₹{order.total_amount}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-brand-base mb-3 uppercase tracking-widest flex items-center gap-1.5"><Package size={14} className="text-slate-400"/> Order Items</h4>
              <div className="bg-brand-bg border border-brand-border rounded-2xl overflow-hidden">
                <ul className="divide-y divide-slate-200/60">
                  {order.items?.map(item => (
                    <li key={item.id} className="text-sm flex flex-col sm:flex-row justify-between sm:items-center px-4 py-3 gap-2">
                       <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-slate-400 font-bold shrink-0">
                           {item.quantity}x
                         </div>
                         <div className="mt-1">
                           <span className="font-bold text-brand-base">{item.product_name}</span>
                         </div>
                       </div>
                       <div className="font-bold text-slate-600 sm:text-right pl-11 sm:pl-0">
                         ₹{item.price_at_time}
                       </div>
                    </li>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                     <li className="text-sm text-brand-muted px-4 py-4 text-center font-medium">No items listed.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
           <div className="bg-brand-surface border border-brand-border rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-slate-300 mb-4">
               <Package size={32} />
             </div>
             <p className="text-lg font-bold text-brand-base mb-1">No orders found</p>
             <p className="text-brand-muted font-medium">There are no orders matching your criteria yet.</p>
           </div>
        )}

        {orders.length > 0 && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            count={pageMeta.count}
            itemLabel="orders"
            hasPrevious={!!pageMeta.previous}
            hasNext={!!pageMeta.next}
            onPrevious={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => p + 1)}
          />
        )}
      </div>
    </div>
  );
}
