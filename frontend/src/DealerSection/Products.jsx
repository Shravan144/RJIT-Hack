import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Image as ImageIcon, X, Printer, Download, Maximize2, AlertTriangle, Package, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getApiData, getApiMessage } from '../utils/apiMessage';

const Barcode = ({ value, width = 1.5, height = 40, showValue = true, jsBarcodeLoaded, dynamicId }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (jsBarcodeLoaded && window.JsBarcode && canvasRef.current && value) {
      try {
        window.JsBarcode(canvasRef.current, value, {
          format: "CODE128", width, height, displayValue: showValue,
          background: "#ffffff", lineColor: "#000000", margin: 0, fontSize: 14, fontOptions: "bold"
        });
      } catch (e) {
        console.error("Barcode generation error", e);
      }
    }
  }, [value, width, height, showValue, jsBarcodeLoaded]);

  return <canvas id={dynamicId} ref={canvasRef} className="max-w-full h-auto mx-auto" />;
};

export default function DealerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [dealerId, setDealerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jsBarcodeLoaded, setJsBarcodeLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expiryFilter, setExpiryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', manufacturer: '', category: 'Seed', batch: '', expiryDate: '', imageUrl: '' });
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [activeBarcodeProd, setActiveBarcodeProd] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDealerProducts();
    fetchAvailableProducts();
    if (window.JsBarcode) { setJsBarcodeLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
    script.async = true;
    script.onload = () => setJsBarcodeLoaded(true);
    document.body.appendChild(script);
  }, []);

  const fetchDealerProducts = async () => {
    try {
      setLoading(true);
      const dealerRes = await api.get('/dealers/me/');
      const myDealer = dealerRes.data;
      
      if (myDealer) {
        setDealerId(myDealer.id);
        // Get products for this dealer
        const productsRes = await api.get(`/dealers/${myDealer.id}/products/`);
        setProducts(productsRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const res = await api.get('/products/');
      setAvailableProducts(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load available products');
    }
  };

  const getExpiryStatus = (dateString) => {
    if (!dateString) return 'Valid';
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays <= 30) return 'Expiring Soon';
    return 'Valid';
  };

  const filteredProducts = products.filter(p => {
    const product = p.product || {};
    const status = getExpiryStatus(product.expiryDate);
    const matchesSearch = !search || 
      (product.name?.toLowerCase().includes(search.toLowerCase())) ||
      (product.brand?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter.toLowerCase();
    const matchesExpiry = expiryFilter === 'All' || 
      (expiryFilter === 'Expiring Soon' && status === 'Expiring Soon') || 
      (expiryFilter === 'Expired' && status === 'Expired');
    return matchesSearch && matchesCategory && matchesExpiry;
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      setDeletingId(id);
      try {
        await api.delete(`/dealers/${dealerId}/products/${id}/`);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product removed');
      } catch (err) {
        toast.error('Failed to remove product');
        setDeletingId(null);
      }
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProductId || !productPrice) {
      toast.error('Please select a product and enter a price');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/dealers/${dealerId}/products/`, {
        product: selectedProductId,
        price: parseFloat(productPrice),
        in_stock: true
      });
      toast.success('Product added to your catalog');
      const createdOrUpdated = getApiData(res.data);
      setProducts([...products, createdOrUpdated]);
      setIsAddProductModalOpen(false);
      setSelectedProductId('');
      setProductPrice('');
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to add product'));
    } finally {
      setSaving(false);
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    setFormData(product ? { ...product } : { name: '', manufacturer: '', category: 'Seed', batch: '', expiryDate: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Note: This would need a backend endpoint to create new products
    // For now, just close the modal
    setIsModalOpen(false);
    toast.info('Product creation requires admin approval');
  };

  const downloadBarcode = () => {
    const canvas = document.getElementById('barcode-canvas-lg');
    if (canvas) {
      const a = document.createElement('a');
      a.href = canvas.toDataURL("image/png");
      a.download = `${activeBarcodeProd.id}-barcode.png`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1a2e1a] font-sans pb-24 md:pb-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .font-barlow { font-family: 'Barlow Condensed', sans-serif; }
        .font-space { font-family: 'Space Mono', monospace; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a2e1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3e5f3e; border-radius: 4px; }
        @media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(2); } }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#1a2e1a]/95 backdrop-blur border-b border-[#3e5f3e] px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="font-barlow text-3xl font-bold text-[#f5f0e8] uppercase tracking-wide">Product Inventory</h1>
            <p className="text-[#a8bda8] text-sm flex items-center gap-2"><Package size={14} /> {filteredProducts.length} Listed</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a997a]" size={16} />
              <input type="text" placeholder="Search product or batch..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] placeholder-[#7a997a] pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-amber-500 font-space text-sm" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-3 py-2 rounded-lg text-sm w-full sm:w-auto focus:border-amber-500 outline-none">
              <option value="All">All Categories</option>
              <option value="seed">Seeds</option>
              <option value="pesticide">Pesticides</option>
              <option value="fertilizer">Fertilizers</option>
              <option value="herbicide">Herbicides</option>
              <option value="fungicide">Fungicides</option>
              <option value="equipment">Equipment</option>
            </select>
            <select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)} className="bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-3 py-2 rounded-lg text-sm w-full sm:w-auto focus:border-amber-500 outline-none">
              <option value="All">All Status</option><option value="Expiring Soon">Expiring Soon</option><option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={() => setIsAddProductModalOpen(true)} className="fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-400 text-amber-950 p-4 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.5)] hover:scale-105 transition-all flex items-center gap-2 group">
        <Plus size={24} /><span className="hidden md:block font-bold max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-300">ADD PRODUCT</span>
      </button>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      ) : (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filteredProducts.map(dealerProduct => {
          const product = dealerProduct.product || {};
          const status = getExpiryStatus(product.expiryDate);
          const isSoon = status === 'Expiring Soon', isExp = status === 'Expired';
          const catColor = product.category === 'seed' ? 'bg-green-950 text-green-400 border-green-700' : product.category === 'pesticide' ? 'bg-red-950 text-red-400 border-red-700' : product.category === 'fertilizer' ? 'bg-amber-950 text-amber-400 border-amber-700' : 'bg-blue-950 text-blue-400 border-blue-700';

          return (
            <div key={dealerProduct.id} className={`group relative bg-[#2d4a2d] border border-[#3e5f3e] rounded-xl flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 ${deletingId === dealerProduct.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => handleDelete(dealerProduct.id)} className="p-2 bg-[#1a2e1a]/90 text-white hover:text-red-400 rounded-lg backdrop-blur shadow-sm border border-[#3e5f3e]"><Trash2 size={14} /></button>
              </div>

              <div className="h-44 bg-[#1a2e1a] rounded-t-xl flex flex-col justify-center items-center overflow-hidden border-b border-[#3e5f3e] relative">
                {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /> : <><Package size={40} className="text-[#3e5f3e] mb-2"/><span className="text-[#3e5f3e] font-space text-[10px] uppercase">No Image</span></>}
                <span className={`absolute bottom-2 left-2 text-[10px] uppercase font-bold px-2 py-1 rounded border ${catColor} backdrop-blur-md capitalize`}>{product.category}</span>
                {dealerProduct.price && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded bg-green-600 text-white">₹{dealerProduct.price}</span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-barlow text-2xl font-bold text-[#f5f0e8] leading-none mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-[#7a997a] truncate mb-4">{product.brand || product.manufacturer}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-5 mt-auto">
                  <div className="bg-[#1a2e1a] p-2 rounded-lg border border-[#3e5f3e] flex flex-col justify-center">
                    <span className="text-[#7a997a] text-[10px] uppercase font-bold mb-0.5">Barcode</span>
                    <span className="font-space text-[#f5f0e8] truncate text-[10px]">{product.barcode?.substring(0, 12) || 'N/A'}</span>
                  </div>
                  <div className={`p-2 rounded-lg border flex flex-col justify-center ${isExp ? 'bg-red-950/40 border-red-700/50 text-red-400' : isSoon ? 'bg-amber-950/40 border-amber-700/50 text-amber-400' : 'bg-[#1a2e1a] border-[#3e5f3e] text-[#f5f0e8]'}`}>
                    <span className="text-[10px] uppercase font-bold mb-0.5 opacity-80">Stock</span>
                    <span className="font-space font-bold truncate flex mt-0.5 items-center gap-1">{dealerProduct.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                </div>
                <div onClick={() => { setActiveBarcodeProd(product); setBarcodeModalOpen(true); }} className="bg-[#f5f0e8] rounded-lg p-2 flex justify-center cursor-pointer hover:bg-brand-surface border-2 border-transparent hover:border-amber-400 transition-colors">
                  <Barcode value={product.barcode || dealerProduct.id} width={1.2} height={35} showValue={false} jsBarcodeLoaded={jsBarcodeLoaded} />
                </div>
                <div className="text-center mt-1"><span className="font-space text-[10px] text-[#7a997a]">{product.barcode || product.id}</span></div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && <div className="col-span-full py-20 text-center text-[#7a997a]"><Package size={48} className="mx-auto mb-4 opacity-50"/><h3 className="font-barlow text-2xl text-[#f5f0e8]">No products found</h3><p className="text-[#7a997a] text-sm mt-2">Click the + button to add products to your catalog</p></div>}
      </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          <div className="bg-[#1a2e1a] border border-[#3e5f3e] rounded-2xl w-full max-w-xl shadow-2xl my-auto animate-fade-down">
            <div className="bg-[#2d4a2d] px-6 py-4 flex justify-between items-center border-b border-[#3e5f3e] rounded-t-2xl">
              <h2 className="font-barlow text-2xl font-bold text-[#f5f0e8] uppercase">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a8bda8] hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-4 py-2 rounded-lg outline-none focus:border-amber-500 font-medium" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Manufacturer</label>
                  <input required type="text" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-4 py-2 rounded-lg outline-none focus:border-amber-500 font-medium" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-4 py-2 rounded-lg outline-none focus:border-amber-500 font-medium">
                    <option value="Seed">Seed</option><option value="Pesticide">Pesticide</option><option value="Fertilizer">Fertilizer</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Batch No</label>
                  <input required type="text" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-4 py-2 rounded-lg outline-none focus:border-amber-500 font-space text-sm" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Expiry Date</label>
                  <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-4 py-2 rounded-lg outline-none focus:border-amber-500 font-space text-sm" style={{colorScheme: 'dark'}} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Image Upload</label>
                  <div className="relative w-full h-32 bg-[#2d4a2d] border-2 border-dashed border-[#3e5f3e] hover:border-amber-500 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer group">
                    {formData.imageUrl ? <><img src={formData.imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60" /><span className="relative z-10 bg-black/70 px-4 py-1.5 rounded-lg text-white font-bold opacity-0 group-hover:opacity-100">Change</span></> : <div className="text-center text-[#7a997a] group-hover:text-amber-500"><ImageIcon size={24} className="mx-auto mb-2"/><span className="text-sm font-bold block">Upload Image</span></div>}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#3e5f3e]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-[#a8bda8] hover:bg-[#2d4a2d] font-bold">Cancel</button>
                <button type="submit" className="px-8 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold">{editingProduct ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Modal */}
      {barcodeModalOpen && activeBarcodeProd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#f5f0e8] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-fade-down print:shadow-none print:w-full">
            <button onClick={() => setBarcodeModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 z-10 print:hidden"><X size={24} /></button>
            <div className="print-area p-8 text-center bg-brand-surface flex flex-col items-center border-b border-gray-200">
              <Package size={32} className="text-amber-500 mb-2"/>
              <h2 className="font-barlow text-3xl font-bold text-gray-900">{activeBarcodeProd.name}</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">{activeBarcodeProd.brand || activeBarcodeProd.manufacturer}</p>
              <Barcode value={activeBarcodeProd.barcode || activeBarcodeProd.id} dynamicId="barcode-canvas-lg" width={2} height={80} showValue={false} jsBarcodeLoaded={jsBarcodeLoaded} />
              <p className="font-space text-xl font-bold text-gray-800 mt-2 tracking-widest">{activeBarcodeProd.barcode || activeBarcodeProd.id}</p>
            </div>
            <div className="bg-gray-50 flex gap-2 p-4 print:hidden">
              <button onClick={downloadBarcode} className="flex-1 flex justify-center items-center gap-2 bg-[#1a2e1a] text-white py-3 rounded-lg font-bold hover:bg-[#2d4a2d] transition-colors"><Download size={18}/> Save</button>
              <button onClick={() => window.print()} className="flex-1 flex justify-center items-center gap-2 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-brand-surface transition-colors"><Printer size={18}/> Print</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product to Catalog Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a2e1a] border border-[#3e5f3e] rounded-2xl w-full max-w-lg shadow-2xl animate-fade-down">
            <div className="bg-[#2d4a2d] px-6 py-4 flex justify-between items-center border-b border-[#3e5f3e] rounded-t-2xl">
              <h2 className="font-barlow text-2xl font-bold text-[#f5f0e8] uppercase">Add Product to Catalog</h2>
              <button onClick={() => setIsAddProductModalOpen(false)} className="text-[#a8bda8] hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Select Product</label>
                <select 
                  value={selectedProductId} 
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-4 py-3 rounded-lg outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">Choose a product...</option>
                  {availableProducts.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name} - {prod.brand} ({prod.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a997a] uppercase mb-1.5">Price (₹)</label>
                <input 
                  type="number" 
                  value={productPrice} 
                  onChange={e => setProductPrice(e.target.value)}
                  placeholder="Enter selling price"
                  className="w-full bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-4 py-3 rounded-lg outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#3e5f3e]">
                <button 
                  type="button" 
                  onClick={() => setIsAddProductModalOpen(false)} 
                  className="px-6 py-2 rounded-lg text-[#a8bda8] hover:bg-[#2d4a2d] font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProduct}
                  disabled={saving}
                  className="px-8 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add to Catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
