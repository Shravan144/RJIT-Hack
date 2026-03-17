import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-brand-muted">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-brand-base mb-6">Orders Monitor</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-brand-surface border border-brand-border p-4 text-brand-base rounded-xl">
            <div className="flex justify-between items-start border-b border-brand-border pb-3 mb-3">
              <div>
                <h3 className="text-lg font-semibold text-brand-base">Order #{order.id}</h3>
                <p className="text-sm text-brand-muted mt-1">From Farmer: {order.farmer_name} | To Dealer: {order.dealer_name}</p>
                <p className="text-sm text-brand-muted mt-1">Placed on: {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[#22c55e] font-bold">₹{order.total_amount}</p>
                <p className={`text-sm mt-1 capitalize ${order.status === 'pending' ? 'text-yellow-400' : 'text-brand-muted'}`}>{order.status}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-brand-base mb-2">Items</h4>
              <ul className="space-y-1">
                {order.items?.map(item => (
                  <li key={item.id} className="text-sm text-brand-muted flex justify-between">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span>₹{item.price_at_time}</span>
                  </li>
                ))}
                {(!order.items || order.items.length === 0) && <li className="text-sm text-brand-muted">No items listed.</li>}
              </ul>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-brand-muted">No orders found.</p>}
      </div>
    </div>
  );
}
