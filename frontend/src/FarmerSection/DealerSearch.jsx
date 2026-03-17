import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Search, MapPin, Phone, Star, ShieldCheck, Package, ShoppingCart,
  ChevronDown, ChevronUp, Eye, Loader2, Plus, Minus, X, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiMessage } from '../utils/apiMessage';
import PaginationControls from '../components/PaginationControls';

export default function FarmerDealerSearch() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ count: 0, next: null, previous: null });
  const [expandedId, setExpandedId] = useState(null);
  const [dealerProducts, setDealerProducts] = useState({});
  const [productsLoading, setProductsLoading] = useState(null);

  // Cart state
  const [cart, setCart] = useState({});
  const [orderModal, setOrderModal] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => { fetchDealers(page, search); }, [page, search]);

  const fetchDealers = async (targetPage, query) => {
    try {
      const { data } = await api.get('/dealers/', {
        params: {
          page: targetPage,
          page_size: 12,
          search: query || undefined,
        },
      });
      setDealers(data.results || []);
      setPageMeta({ count: data.count || 0, next: data.next, previous: data.previous });
    } catch (err) {
      toast.error('Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (dealerId) => {
    if (dealerProducts[dealerId]) return;
    setProductsLoading(dealerId);
    try {
      const { data } = await api.get(`/dealers/${dealerId}/products/`);
      setDealerProducts(prev => ({ ...prev, [dealerId]: data }));
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(null);
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchProducts(id);
    }
  };

  const updateCart = (dealerId, productId, price, delta) => {
    setCart(prev => {
      const key = `${dealerId}-${productId}`;
      const curr = prev[key]?.qty || 0;
      const newQty = Math.max(0, curr + delta);
      if (newQty === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { dealerId, productId, price, qty: newQty } };
    });
  };

  const getCartForDealer = (dealerId) => {
    return Object.values(cart).filter(item => item.dealerId === dealerId);
  };

  const getDealerCartTotal = (dealerId) => {
    return getCartForDealer(dealerId).reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const placeOrder = async (dealerId) => {
    const items = getCartForDealer(dealerId);
    if (items.length === 0) return;
    setOrderLoading(true);
    try {
      await api.post('/orders/', {
        dealer: dealerId,
        total_amount: getDealerCartTotal(dealerId),
        items: items.map(i => ({
          product: i.productId,
          quantity: i.qty,
          price_at_time: i.price,
        })),
      });
      toast.success('Order placed successfully!');
      // Clear cart for this dealer
      setCart(prev => {
        const newCart = { ...prev };
        Object.keys(newCart).forEach(key => {
          if (key.startsWith(`${dealerId}-`)) delete newCart[key];
        });
        return newCart;
      });
      setOrderModal(null);
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to place order'));
    } finally {
      setOrderLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil((pageMeta.count || 0) / 12));

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-display font-black text-3xl text-brand-base mb-6">Find Dealers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton-shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow">
          <Search size={20} />
        </div>
        <div>
          <h1 className="font-display font-black text-3xl text-brand-base">Find Dealers</h1>
          <p className="text-brand-muted text-sm">Browse verified dealers and their products</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-brand-elevated border border-brand-border rounded-xl focus-within:border-green-400 transition-all mb-6">
        <Search className="mx-3 text-brand-muted" size={17} />
        <input type="text" placeholder="Search by dealer name, shop or location..."
          className="flex-1 bg-transparent border-none outline-none text-brand-base text-sm py-3 pr-4 placeholder-brand-muted"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Results */}
      {dealers.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-brand-muted">
          <Search size={48} className="opacity-30" />
          <p className="text-lg font-medium">No verified dealers found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {dealers.map(dealer => {
            const isExpanded = expandedId === dealer.id;
            const products = dealerProducts[dealer.id] || [];
            const cartItems = getCartForDealer(dealer.id);
            const cartTotal = getDealerCartTotal(dealer.id);

            return (
              <div key={dealer.id}
                className="bg-brand-surface border border-brand-subtle rounded-2xl overflow-hidden hover:border-green-400/30 transition-all">
                {/* Dealer Row */}
                <div className="flex flex-wrap items-center gap-4 p-5 cursor-pointer" onClick={() => toggleExpand(dealer.id)}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {dealer.shop_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-brand-base text-base truncate">{dealer.shop_name}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/25 text-green-400 text-[11px] font-bold uppercase">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    </div>
                    <p className="text-brand-muted text-sm truncate flex items-center gap-1">
                      <MapPin size={12} /> {dealer.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1 text-sm font-bold">
                      <Star size={14} className={dealer.trust_score >= 3 ? 'text-green-400' : 'text-red-400'} />
                      <span className={dealer.trust_score >= 3 ? 'text-green-400' : 'text-red-400'}>{dealer.trust_score}</span>
                    </div>
                    {cartItems.length > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-bold">
                        {cartItems.length} in cart
                      </span>
                    )}
                    <div className="text-brand-muted">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded: Products + Details */}
                {isExpanded && (
                  <div className="border-t border-brand-subtle bg-brand-elevated/50 p-5 animate-fade-down">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="bg-brand-surface border border-brand-subtle rounded-xl p-3 flex items-center gap-3">
                        <Phone size={16} className="text-green-400" />
                        <div>
                          <div className="text-[11px] text-brand-muted">Phone</div>
                          <div className="text-sm text-brand-base font-medium">{dealer.phone}</div>
                        </div>
                      </div>
                      <div className="bg-brand-surface border border-brand-subtle rounded-xl p-3 flex items-center gap-3">
                        <Star size={16} className="text-green-400" />
                        <div>
                          <div className="text-[11px] text-brand-muted">Trust Score</div>
                          <div className="text-sm text-brand-base font-medium">{dealer.trust_score} / 5.0</div>
                        </div>
                      </div>
                      <div className="bg-brand-surface border border-brand-subtle rounded-xl p-3 flex items-center gap-3">
                        <Package size={16} className="text-green-400" />
                        <div>
                          <div className="text-[11px] text-brand-muted">Specializations</div>
                          <div className="text-sm text-brand-base font-medium">{dealer.specializations || 'General'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <h4 className="font-semibold text-brand-base text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Package size={15} className="text-green-400" /> Available Products
                    </h4>

                    {productsLoading === dealer.id ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-green-500" size={24} />
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-8 text-brand-muted text-sm">
                        <Package size={32} className="mx-auto mb-2 opacity-30" />
                        <p>No products listed yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {products.map(dp => {
                          const key = `${dealer.id}-${dp.product.id}`;
                          const qty = cart[key]?.qty || 0;
                          return (
                            <div key={dp.id} className="bg-brand-surface border border-brand-subtle rounded-xl p-4 flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-semibold text-brand-base text-sm">{dp.product.name}</h5>
                                  <p className="text-brand-muted text-xs">{dp.product.brand}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/25 text-green-400 text-[11px] font-bold capitalize">
                                  {dp.product.category}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-auto pt-2 border-t border-brand-subtle">
                                <span className="font-bold text-green-400 text-sm">₹{dp.price || '0'}</span>
                                <div className="flex items-center gap-2">
                                  {qty > 0 && (
                                    <button onClick={() => updateCart(dealer.id, dp.product.id, Number(dp.price) || 0, -1)}
                                      className="w-7 h-7 rounded-lg bg-red-400/10 border border-red-400/25 text-red-400 flex items-center justify-center hover:bg-red-400/20 transition-all">
                                      <Minus size={14} />
                                    </button>
                                  )}
                                  {qty > 0 && <span className="text-brand-base font-bold text-sm min-w-[20px] text-center">{qty}</span>}
                                  <button onClick={() => updateCart(dealer.id, dp.product.id, Number(dp.price) || 0, 1)}
                                    className="w-7 h-7 rounded-lg bg-green-400/10 border border-green-400/25 text-green-400 flex items-center justify-center hover:bg-green-400/20 transition-all">
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Cart Summary for this dealer */}
                    {cartItems.length > 0 && (
                      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-brand-base">{cartItems.length} item{cartItems.length > 1 ? 's' : ''} selected</div>
                          <div className="text-green-400 font-bold text-lg">Total: ₹{cartTotal.toFixed(2)}</div>
                        </div>
                        <button onClick={() => setOrderModal(dealer.id)}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                          <ShoppingCart size={16} /> Place Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            count={pageMeta.count}
            itemLabel="dealers"
            hasPrevious={!!pageMeta.previous}
            hasNext={!!pageMeta.next}
            onPrevious={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => p + 1)}
          />
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl animate-fade-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-base text-lg">Confirm Order</h3>
              <button onClick={() => setOrderModal(null)} className="text-brand-muted hover:text-brand-base">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-2 mb-4 max-h-60 overflow-y-auto">
              {getCartForDealer(orderModal).map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-brand-elevated border border-brand-border rounded-lg p-3 text-sm">
                  <span className="text-brand-base">Product #{item.productId} × {item.qty}</span>
                  <span className="text-green-400 font-bold">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center py-3 border-t border-brand-border mb-4">
              <span className="font-bold text-brand-base">Total</span>
              <span className="font-bold text-green-400 text-xl">₹{getDealerCartTotal(orderModal).toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setOrderModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-base font-medium transition-all">
                Cancel
              </button>
              <button onClick={() => placeOrder(orderModal)} disabled={orderLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 transition-all">
                {orderLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
