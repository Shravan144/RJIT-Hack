import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Image as ImageIcon, X, Printer, Download, Maximize2, AlertTriangle, Package, AlertCircle } from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: 'PROD-0001', name: 'Super Seed X1', manufacturer: 'AgriCorp', category: 'Seed', batch: 'BCH-8821A', expiryDate: '2026-10-15', imageUrl: '' },
  { id: 'PROD-0002', name: 'PestControl Pro', manufacturer: 'ChemAgri', category: 'Pesticide', batch: 'BCH-992B', expiryDate: '2026-04-10', imageUrl: '' },
  { id: 'PROD-0003', name: 'Urea Fertilizer 50kg', manufacturer: 'FertCo', category: 'Fertilizer', batch: 'FERT-001', expiryDate: '2027-01-01', imageUrl: '' },
  { id: 'PROD-0004', name: 'Wheat Seed Alpha', manufacturer: 'AgriCorp', category: 'Seed', batch: 'WHT-A1', expiryDate: '2026-03-25', imageUrl: '' },
  { id: 'PROD-0005', name: 'Weed-X Max', manufacturer: 'ChemAgri', category: 'Pesticide', batch: 'WX-77', expiryDate: '2026-02-10', imageUrl: '' },
  { id: 'PROD-0006', name: 'Potash Plus', manufacturer: 'FertCo', category: 'Fertilizer', batch: 'POT-992', expiryDate: '2026-04-05', imageUrl: '' },
  { id: 'PROD-0007', name: 'Corn Seed Beta', manufacturer: 'AgriCorp', category: 'Seed', batch: 'CRN-B2', expiryDate: '2025-11-20', imageUrl: '' },
  { id: 'PROD-0008', name: 'Fungicide Gold', manufacturer: 'BioProtect', category: 'Pesticide', batch: 'FG-001', expiryDate: '2026-12-10', imageUrl: '' },
  { id: 'PROD-0009', name: 'Organic Compost Heap', manufacturer: 'EcoFarm', category: 'Fertilizer', batch: 'COMP-11', expiryDate: '2028-02-28', imageUrl: '' },
  { id: 'PROD-0010', name: 'Tomato Seed Gamma', manufacturer: 'AgriCorp', category: 'Seed', batch: 'TOM-G3', expiryDate: '2027-04-20', imageUrl: '' }
];

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
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [jsBarcodeLoaded, setJsBarcodeLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expiryFilter, setExpiryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', manufacturer: '', category: 'Seed', batch: '', expiryDate: '', imageUrl: '' });
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [activeBarcodeProd, setActiveBarcodeProd] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (window.JsBarcode) { setJsBarcodeLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
    script.async = true;
    script.onload = () => setJsBarcodeLoaded(true);
    document.body.appendChild(script);
  }, []);

  const getExpiryStatus = (dateString) => {
    const diffDays = Math.ceil((new Date(dateString) - new Date('2026-03-17')) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays <= 30) return 'Expiring Soon';
    return 'Valid';
  };

  const filteredProducts = products.filter(p => {
    const status = getExpiryStatus(p.expiryDate);
    return (p.name.toLowerCase().includes(search.toLowerCase()) || p.batch.toLowerCase().includes(search.toLowerCase())) &&
      (categoryFilter === 'All' || p.category === categoryFilter) &&
      (expiryFilter === 'All' || (expiryFilter === 'Expiring Soon' && status === 'Expiring Soon') || (expiryFilter === 'Expired' && status === 'Expired'));
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setDeletingId(id);
      setTimeout(() => { setProducts(products.filter(p => p.id !== id)); setDeletingId(null); }, 300);
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
    if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    else setProducts([{ ...formData, id: `PROD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` }, ...products]);
    setIsModalOpen(false);
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
              <option value="All">All Categories</option><option value="Seed">Seeds</option><option value="Pesticide">Pesticides</option><option value="Fertilizer">Fertilizers</option>
            </select>
            <select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)} className="bg-[#2d4a2d] border border-[#3e5f3e] text-[#f5f0e8] px-3 py-2 rounded-lg text-sm w-full sm:w-auto focus:border-amber-500 outline-none">
              <option value="All">All Status</option><option value="Expiring Soon">Expiring Soon</option><option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={() => openModal()} className="fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-400 text-amber-950 p-4 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.5)] hover:scale-105 transition-all flex items-center gap-2 group">
        <Plus size={24} /><span className="hidden md:block font-bold max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-300">ADD PRODUCT</span>
      </button>

      {/* Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filteredProducts.map(product => {
          const status = getExpiryStatus(product.expiryDate);
          const isSoon = status === 'Expiring Soon', isExp = status === 'Expired';
          const catColor = product.category === 'Seed' ? 'bg-green-950 text-green-400 border-green-700' : product.category === 'Pesticide' ? 'bg-red-950 text-red-400 border-red-700' : 'bg-amber-950 text-amber-400 border-amber-700';

          return (
            <div key={product.id} className={`group relative bg-[#2d4a2d] border border-[#3e5f3e] rounded-xl flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 ${deletingId === product.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => openModal(product)} className="p-2 bg-[#1a2e1a]/90 text-white hover:text-amber-400 rounded-lg backdrop-blur shadow-sm border border-[#3e5f3e]"><Edit size={14} /></button>
                <button onClick={() => handleDelete(product.id)} className="p-2 bg-[#1a2e1a]/90 text-white hover:text-red-400 rounded-lg backdrop-blur shadow-sm border border-[#3e5f3e]"><Trash2 size={14} /></button>
              </div>

              <div className="h-44 bg-[#1a2e1a] rounded-t-xl flex flex-col justify-center items-center overflow-hidden border-b border-[#3e5f3e] relative">
                {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /> : <><Package size={40} className="text-[#3e5f3e] mb-2"/><span className="text-[#3e5f3e] font-space text-[10px] uppercase">No Image</span></>}
                <span className={`absolute bottom-2 left-2 text-[10px] uppercase font-bold px-2 py-1 rounded border ${catColor} backdrop-blur-md`}>{product.category}</span>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-barlow text-2xl font-bold text-[#f5f0e8] leading-none mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-[#7a997a] truncate mb-4">{product.manufacturer}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-5 mt-auto">
                  <div className="bg-[#1a2e1a] p-2 rounded-lg border border-[#3e5f3e] flex flex-col justify-center">
                    <span className="text-[#7a997a] text-[10px] uppercase font-bold mb-0.5">Batch</span>
                    <span className="font-space text-[#f5f0e8] truncate">{product.batch}</span>
                  </div>
                  <div className={`p-2 rounded-lg border flex flex-col justify-center ${isExp ? 'bg-red-950/40 border-red-700/50 text-red-400' : isSoon ? 'bg-amber-950/40 border-amber-700/50 text-amber-400' : 'bg-[#1a2e1a] border-[#3e5f3e] text-[#f5f0e8]'}`}>
                    <span className="text-[10px] uppercase font-bold mb-0.5 opacity-80">Expiry</span>
                    <span className="font-space font-bold truncate flex mt-0.5 items-center gap-1">{(isExp || isSoon) && <AlertTriangle size={10}/>} {product.expiryDate}</span>
                  </div>
                </div>
                <div onClick={() => { setActiveBarcodeProd(product); setBarcodeModalOpen(true); }} className="bg-[#f5f0e8] rounded-lg p-2 flex justify-center cursor-pointer hover:bg-white border-2 border-transparent hover:border-amber-400 transition-colors">
                  <Barcode value={product.id} width={1.2} height={35} showValue={false} jsBarcodeLoaded={jsBarcodeLoaded} />
                </div>
                <div className="text-center mt-1"><span className="font-space text-[10px] text-[#7a997a]">{product.id}</span></div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && <div className="col-span-full py-20 text-center text-[#7a997a]"><Package size={48} className="mx-auto mb-4 opacity-50"/><h3 className="font-barlow text-2xl text-[#f5f0e8]">No products found</h3></div>}
      </div>

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
            <div className="print-area p-8 text-center bg-white flex flex-col items-center border-b border-gray-200">
              <Package size={32} className="text-amber-500 mb-2"/>
              <h2 className="font-barlow text-3xl font-bold text-gray-900">{activeBarcodeProd.name}</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">{activeBarcodeProd.manufacturer}</p>
              <Barcode value={activeBarcodeProd.id} dynamicId="barcode-canvas-lg" width={2} height={80} showValue={false} jsBarcodeLoaded={jsBarcodeLoaded} />
              <p className="font-space text-xl font-bold text-gray-800 mt-2 tracking-widest">{activeBarcodeProd.id}</p>
            </div>
            <div className="bg-gray-50 flex gap-2 p-4 print:hidden">
              <button onClick={downloadBarcode} className="flex-1 flex justify-center items-center gap-2 bg-[#1a2e1a] text-white py-3 rounded-lg font-bold hover:bg-[#2d4a2d] transition-colors"><Download size={18}/> Save</button>
              <button onClick={() => window.print()} className="flex-1 flex justify-center items-center gap-2 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-white transition-colors"><Printer size={18}/> Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
