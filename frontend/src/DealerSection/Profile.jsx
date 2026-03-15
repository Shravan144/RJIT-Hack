import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Upload, Edit2, User, FileText, Store, ShieldCheck, Phone, Hash, Calendar, Package, MapPin, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrivateDealerProfile() {
  const { user } = useAuth();
  
  // App State
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    dealerName: '',
    shopAddress: '',
    phoneNumber: '',
    gstNumber: '',
    licenseNumber: '',
    licenseValidity: '',
    authorizedProducts: [],
    licenseDoc: null, 
    aadhaarDoc: null,
    shopPhoto: null,
    isSubmitted: false
  });

  // Calculate Storage Key
  const storageKey = `dealer_profile_${user?.id || user?.username || 'draft'}`;

  // On Mount: Load from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.data || parsed); // Handle potential structure changes
        setCompletedSteps(parsed.completedSteps || []);
        
        // If all 5 steps are completed, jump to step 5 (Review)
        if (parsed.completedSteps && parsed.completedSteps.length >= 4) {
          setCurrentStep(5);
        } else if (parsed.completedSteps?.length > 0) {
          // Jump to first uncompleted step
          const maxCompleted = Math.max(...parsed.completedSteps);
          setCurrentStep(Math.min(maxCompleted + 1, 5));
        }
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setIsInitializing(false);
    }
  }, [storageKey]);

  // Save to localStorage wrapper
  const saveToStorage = (updatedData, updatedSteps) => {
    localStorage.setItem(storageKey, JSON.stringify({
      data: updatedData,
      completedSteps: updatedSteps
    }));
  };

  const handleNext = (e) => {
    e?.preventDefault();
    
    // Mark current step complete
    const updatedSteps = [...new Set([...completedSteps, currentStep])];
    setCompletedSteps(updatedSteps);
    
    // Save to storage
    saveToStorage(formData, updatedSteps);
    toast.success('Progress saved');

    if (currentStep < 5) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const jumpToStep = (step) => {
    // Only allow jumping to completed steps or the immediate next uncompleted step
    if (completedSteps.includes(step) || step === Math.max(0, ...completedSteps) + 1) {
      setCurrentStep(step);
    }
  };

  const handleProductToggle = (product) => {
    setFormData(prev => ({
      ...prev,
      authorizedProducts: prev.authorizedProducts.includes(product)
        ? prev.authorizedProducts.filter(p => p !== product)
        : [...prev.authorizedProducts, product]
    }));
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, [fieldName]: event.target.result }));
    };
    reader.onerror = () => toast.error(`Failed to read ${fieldName}`);
    reader.readAsDataURL(file);
  };

  const handleSubmitProfile = (e) => {
    e?.preventDefault();
    const finalData = { ...formData, isSubmitted: true };
    setFormData(finalData);
    saveToStorage(finalData, completedSteps);
    toast.success('Dealer Profile successfully submitted!', { duration: 4000 });
  };

  // ---------------------------------------------------------------------------
  // Sub-Components
  // ---------------------------------------------------------------------------

  const ProgressBar = () => {
    const steps = [
      { num: 1, label: "Info" },
      { num: 2, label: "License" },
      { num: 3, label: "Docs" },
      { num: 4, label: "Photo" },
      { num: 5, label: "Review" }
    ];

    return (
      <div className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md pt-6 pb-4 mb-8 w-full flex justify-center">
        <div className="flex items-center w-full max-w-3xl px-4">
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.num) || (step.num === 5 && completedSteps.length >= 4);
            const isActive = currentStep === step.num;
            const isClickable = completedSteps.includes(step.num) || step.num === Math.max(0, ...completedSteps) + 1;

            return (
              <div key={step.num} className="flex items-center flex-1 last:flex-none relative">
                <div className="flex flex-col items-center relative z-10 group">
                  <button
                    onClick={() => jumpToStep(step.num)}
                    disabled={!isClickable && !isActive}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                      ${isCompleted && !isActive ? 'bg-[#22c55e] text-[#111] shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-[#1ea84f]' : ''}
                      ${isActive ? 'bg-transparent border-2 border-[#22c55e] text-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.2)]' : ''}
                      ${!isCompleted && !isActive ? 'bg-[#1a1a1a] border-2 border-[#333] text-gray-500' : ''}
                      ${isClickable && !isActive ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    {isCompleted && !isActive ? <CheckCircle size={20} /> : step.num}
                  </button>
                  <span className={`absolute top-12 text-xs font-medium whitespace-nowrap transition-colors
                    ${isActive ? 'text-[#22c55e]' : isCompleted ? 'text-gray-300' : 'text-gray-600'}
                  `}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-[2px] w-full mx-2 rounded transition-colors duration-500
                    ${completedSteps.includes(step.num) ? 'bg-[#22c55e]' : 'bg-[#333]'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Step Renderers
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <form onSubmit={handleNext} className="flex flex-col gap-6 animate-fade-down">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <User className="text-[#22c55e]" size={24} /> Personal & Shop Info
        </h2>
        <p className="text-gray-400 text-sm">Update your basic dealership information.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Dealer Name</label>
          <input 
            type="text" required
            value={formData.dealerName}
            onChange={e => setFormData({...formData, dealerName: e.target.value})}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#22c55e] focus:outline-none focus:ring-1 focus:ring-[#22c55e] transition-all"
            placeholder="e.g. Ram Agricultural Stores"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
           <input 
             type="tel" required
             value={formData.phoneNumber}
             onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
             className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#22c55e] focus:outline-none focus:ring-1 focus:ring-[#22c55e] transition-all"
             placeholder="+91 98765 43210"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-300 mb-1.5">GST Number</label>
           <input 
             type="text" required
             value={formData.gstNumber}
             onChange={e => setFormData({...formData, gstNumber: e.target.value})}
             className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#22c55e] focus:outline-none focus:ring-1 focus:ring-[#22c55e] transition-all"
             placeholder="22AAAAA0000A1Z5"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-300 mb-1.5">Shop Address</label>
           <textarea 
             required rows={3}
             value={formData.shopAddress}
             onChange={e => setFormData({...formData, shopAddress: e.target.value})}
             className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#22c55e] focus:outline-none focus:ring-1 focus:ring-[#22c55e] transition-all resize-none"
             placeholder="Full shop address including PIN code"
           />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button type="submit" className="bg-[#22c55e] text-[#111] hover:bg-[#1ea84f] font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#22c55e]/20">
          Save & Continue
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => {
    const products = ['Fertilizer', 'Pesticide', 'Fungicide', 'Herbicide', 'Seed'];

    return (
      <form onSubmit={handleNext} className="flex flex-col gap-6 animate-fade-down">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <ShieldCheck className="text-[#22c55e]" size={24} /> License Details
          </h2>
          <p className="text-gray-400 text-sm">Provide your official agricultural license credentials.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">License Number</label>
             <input 
               type="text" required
               value={formData.licenseNumber}
               onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
               className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#22c55e] focus:outline-none focus:ring-1 focus:ring-[#22c55e] transition-all"
               placeholder="LIC-2026-XYZ"
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">License Validity Date</label>
             <input 
               type="date" required
               value={formData.licenseValidity}
               onChange={e => setFormData({...formData, licenseValidity: e.target.value})}
               className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#22c55e] focus:outline-none focus:ring-1 focus:ring-[#22c55e] transition-all [color-scheme:dark]"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Authorized Products (Select all that apply)</label>
             <div className="flex flex-wrap gap-2">
               {products.map(prod => {
                 const isSelected = formData.authorizedProducts.includes(prod);
                 return (
                   <button
                     key={prod}
                     type="button"
                     onClick={() => handleProductToggle(prod)}
                     className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                       isSelected 
                         ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]'
                         : 'bg-[#1a1a1a] text-gray-400 border border-[#333] hover:border-gray-500'
                     }`}
                   >
                     {prod}
                   </button>
                 );
               })}
             </div>
             {formData.authorizedProducts.length === 0 && (
                <p className="text-xs text-red-400 mt-2">Please select at least one authorized product.</p>
             )}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button type="button" onClick={handleBack} className="bg-transparent border border-[#333] text-white hover:bg-[#1a1a1a] font-semibold py-3 px-8 rounded-xl transition-colors">
            Back
          </button>
          <button 
             type="submit" 
             disabled={formData.authorizedProducts.length === 0}
             className="bg-[#22c55e] text-[#111] hover:bg-[#1ea84f] disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#22c55e]/20"
          >
            Save & Continue
          </button>
        </div>
      </form>
    );
  };

  const renderStep3 = () => (
    <form onSubmit={handleNext} className="flex flex-col gap-6 animate-fade-down">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <FileText className="text-[#22c55e]" size={24} /> Document Uploads
        </h2>
        <p className="text-gray-400 text-sm">Upload clear images or PDFs of your official documents.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* License Document Upload */}
        <div>
           <label className="block text-sm font-medium text-gray-300 mb-2">Agricultural License Document</label>
           <div className={`relative w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${formData.licenseDoc ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-[#333] bg-[#1a1a1a] hover:border-gray-500'}`}>
             <input 
               type="file" accept=".pdf,image/*" required={!formData.licenseDoc}
               onChange={e => handleFileUpload(e, 'licenseDoc')}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             {formData.licenseDoc ? (
               <div className="flex flex-col items-center gap-2 text-[#22c55e]">
                  <CheckCircle size={32} />
                  <span className="text-sm font-medium">Document Uploaded Successfully</span>
                  <span className="text-xs text-gray-500 mt-1">Click or drag to replace</span>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={32} />
                  <span className="text-sm">Click or drag file to upload</span>
                  <span className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</span>
               </div>
             )}
           </div>
        </div>

        {/* Aadhaar Upload */}
        <div>
           <label className="block text-sm font-medium text-gray-300 mb-2">Aadhaar Card</label>
           <div className={`relative w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${formData.aadhaarDoc ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-[#333] bg-[#1a1a1a] hover:border-gray-500'}`}>
             <input 
               type="file" accept=".pdf,image/*" required={!formData.aadhaarDoc}
               onChange={e => handleFileUpload(e, 'aadhaarDoc')}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             {formData.aadhaarDoc ? (
               <div className="flex flex-col items-center gap-2 text-[#22c55e]">
                  <CheckCircle size={32} />
                  <span className="text-sm font-medium">Document Uploaded Successfully</span>
                  <span className="text-xs text-gray-500 mt-1">Click or drag to replace</span>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={32} />
                  <span className="text-sm">Click or drag file to upload</span>
                  <span className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</span>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button type="button" onClick={handleBack} className="bg-transparent border border-[#333] text-white hover:bg-[#1a1a1a] font-semibold py-3 px-8 rounded-xl transition-colors">
          Back
        </button>
        <button type="submit" className="bg-[#22c55e] text-[#111] hover:bg-[#1ea84f] font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#22c55e]/20">
          Save & Continue
        </button>
      </div>
    </form>
  );

  const renderStep4 = () => (
    <form onSubmit={handleNext} className="flex flex-col gap-6 animate-fade-down">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Store className="text-[#22c55e]" size={24} /> Shop Photo
        </h2>
        <p className="text-gray-400 text-sm">Upload a clear photo of your store front showing the signage.</p>
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-300 mb-2">Store Front Image</label>
         <div className={`relative w-full overflow-hidden border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${formData.shopPhoto ? 'border-[#22c55e] h-64' : 'border-[#333] bg-[#1a1a1a] hover:border-gray-500 h-48'}`}>
           <input 
             type="file" accept="image/*" required={!formData.shopPhoto}
             onChange={e => handleFileUpload(e, 'shopPhoto')}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
           />
           {formData.shopPhoto ? (
             <>
               <img src={formData.shopPhoto} alt="Shop preview" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
               <div className="relative z-0 flex flex-col items-center gap-2 text-white bg-black/40 px-6 py-4 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="text-[#22c55e]" size={32} />
                  <span className="text-sm font-medium">Looks good!</span>
                  <span className="text-xs text-gray-300">Click or drag to change image</span>
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload size={32} />
                <span className="text-sm">Click or drag an image here</span>
                <span className="text-xs text-gray-500">JPG, PNG up to 5MB</span>
             </div>
           )}
         </div>
      </div>

      <div className="flex justify-between mt-4">
        <button type="button" onClick={handleBack} className="bg-transparent border border-[#333] text-white hover:bg-[#1a1a1a] font-semibold py-3 px-8 rounded-xl transition-colors">
          Back
        </button>
        <button type="submit" className="bg-[#22c55e] text-[#111] hover:bg-[#1ea84f] font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#22c55e]/20">
          Save & Continue
        </button>
      </div>
    </form>
  );

  const renderStep5 = () => {
    if (formData.isSubmitted) {
      return (
        <div className="flex flex-col gap-8 animate-fade-down pb-10">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mt-4">
            {formData.shopPhoto ? (
              <img src={formData.shopPhoto} alt="Shop Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#1a1a1a] shadow-xl mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-4 border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] mb-4 text-3xl font-bold">
                {formData.dealerName ? formData.dealerName.charAt(0).toUpperCase() : 'D'}
              </div>
            )}
            <h2 className="text-[28px] font-bold text-white leading-tight mb-2">{formData.dealerName || 'Dealer Name'}</h2>
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-bold px-3 py-1 rounded-full tracking-wider mb-3">
              DEALER
            </div>
            <p className="text-gray-400 text-sm max-w-sm flex items-center justify-center gap-1.5">
               <MapPin size={14} /> {formData.shopAddress || 'Address not provided'}
            </p>
          </div>

          {/* Details Grid */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-widest mb-4">Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Phone */}
               <div className="bg-[#1a1a1a] hover:bg-[#22c55e]/5 transition-colors border border-[#333] border-l-[3px] border-l-[#22c55e] rounded-xl p-4 flex items-start gap-4">
                 <div className="p-2 bg-[#111] rounded-lg text-[#22c55e]"><Phone size={18} /></div>
                 <div>
                   <p className="text-xs text-gray-500 font-medium mb-1">Phone Number</p>
                   <p className="text-sm text-white font-bold">{formData.phoneNumber || '-'}</p>
                 </div>
               </div>
               
               {/* GST */}
               <div className="bg-[#1a1a1a] hover:bg-[#22c55e]/5 transition-colors border border-[#333] border-l-[3px] border-l-[#22c55e] rounded-xl p-4 flex items-start gap-4">
                 <div className="p-2 bg-[#111] rounded-lg text-[#22c55e]"><Hash size={18} /></div>
                 <div>
                   <p className="text-xs text-gray-500 font-medium mb-1">GST Number</p>
                   <p className="text-sm text-white font-bold">{formData.gstNumber || '-'}</p>
                 </div>
               </div>

               {/* License */}
               <div className="bg-[#1a1a1a] hover:bg-[#22c55e]/5 transition-colors border border-[#333] border-l-[3px] border-l-[#22c55e] rounded-xl p-4 flex items-start gap-4">
                 <div className="p-2 bg-[#111] rounded-lg text-[#22c55e]"><FileText size={18} /></div>
                 <div>
                   <p className="text-xs text-gray-500 font-medium mb-1">License Number</p>
                   <p className="text-sm text-white font-bold">{formData.licenseNumber || '-'}</p>
                 </div>
               </div>

               {/* Validity */}
               <div className="bg-[#1a1a1a] hover:bg-[#22c55e]/5 transition-colors border border-[#333] border-l-[3px] border-l-[#22c55e] rounded-xl p-4 flex items-start gap-4">
                 <div className="p-2 bg-[#111] rounded-lg text-[#22c55e]"><Calendar size={18} /></div>
                 <div>
                   <p className="text-xs text-gray-500 font-medium mb-1">License Validity</p>
                   <p className="text-sm text-white font-bold">{formData.licenseValidity || '-'}</p>
                 </div>
               </div>

               {/* Categories */}
               <div className="bg-[#1a1a1a] hover:bg-[#22c55e]/5 transition-colors border border-[#333] border-l-[3px] border-l-[#22c55e] rounded-xl p-4 flex items-start gap-4 md:col-span-2">
                 <div className="p-2 bg-[#111] rounded-lg text-[#22c55e]"><Package size={18} /></div>
                 <div className="w-full">
                   <p className="text-xs text-gray-500 font-medium mb-2">Authorized Categories</p>
                   <div className="flex flex-wrap gap-2">
                     {formData.authorizedProducts?.length > 0 ? formData.authorizedProducts.map(p => (
                       <span key={p} className="bg-[#22c55e]/10 text-[#22c55e] text-xs px-2.5 py-1 rounded-md border border-[#22c55e]/20">{p}</span>
                     )) : <span className="text-sm text-gray-400">-</span>}
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-widest mb-4">Uploaded Documents</h3>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden text-sm">
               <div className="flex items-center justify-between p-4 border-b border-[#333] hover:bg-[#111] transition-colors">
                  <span className="text-gray-300 font-medium">License Document</span>
                  {formData.licenseDoc ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-md border border-[#22c55e]/20"><CheckCircle size={14}/> Uploaded &check;</span>
                  ) : (
                    <span className="text-xs text-gray-500">Not uploaded</span>
                  )}
               </div>
               <div className="flex items-center justify-between p-4 hover:bg-[#111] transition-colors">
                  <span className="text-gray-300 font-medium">Aadhaar Card</span>
                  {formData.aadhaarDoc ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded-md border border-[#22c55e]/20"><CheckCircle size={14}/> Uploaded &check;</span>
                  ) : (
                    <span className="text-xs text-gray-500">Not uploaded</span>
                  )}
               </div>
            </div>
          </div>

          {/* Shop Photo Section */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-widest mb-4">Shop Photo</h3>
            {formData.shopPhoto ? (
              <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-[#333] shadow-lg">
                <img src={formData.shopPhoto} alt="Shop" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-[140px] rounded-2xl border-2 border-dashed border-[#333] bg-[#1a1a1a] flex flex-col items-center justify-center text-gray-500">
                <Camera size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No shop photo provided</span>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <div className="flex justify-center mt-4">
            <button onClick={() => jumpToStep(1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors font-medium text-sm">
              <Edit2 size={16} /> Edit Profile Details
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 animate-fade-down">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Review & Submit</h2>
          <p className="text-gray-400 text-sm">Please review your credentials before final submission.</p>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* Step 1 Review */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 relative group">
            <button onClick={() => jumpToStep(1)} className="absolute top-4 right-4 text-gray-500 hover:text-[#22c55e] transition-colors p-1" title="Edit Info">
               <Edit2 size={16} />
            </button>
            <h3 className="text-sm font-semibold text-[#22c55e] mb-3 uppercase tracking-wider">Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <span className="block text-gray-500 text-xs mb-0.5">Dealer Name</span>
                 <span className="text-slate-200">{formData.dealerName || '-'}</span>
               </div>
               <div>
                 <span className="block text-gray-500 text-xs mb-0.5">Phone Number</span>
                 <span className="text-slate-200">{formData.phoneNumber || '-'}</span>
               </div>
               <div className="col-span-2">
                 <span className="block text-gray-500 text-xs mb-0.5">Shop Address</span>
                 <span className="text-slate-200">{formData.shopAddress || '-'}</span>
               </div>
            </div>
          </div>

          {/* Step 2 Review */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 relative group">
            <button onClick={() => jumpToStep(2)} className="absolute top-4 right-4 text-gray-500 hover:text-[#22c55e] transition-colors p-1" title="Edit License">
               <Edit2 size={16} />
            </button>
            <h3 className="text-sm font-semibold text-[#22c55e] mb-3 uppercase tracking-wider">License Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <span className="block text-gray-500 text-xs mb-0.5">License Number</span>
                 <span className="text-slate-200">{formData.licenseNumber || '-'}</span>
               </div>
               <div>
                 <span className="block text-gray-500 text-xs mb-0.5">Validity</span>
                 <span className="text-slate-200">{formData.licenseValidity || '-'}</span>
               </div>
               <div className="col-span-2">
                 <span className="block text-gray-500 text-xs mb-0.5">Products</span>
                 <div className="flex flex-wrap gap-1.5 mt-1">
                   {formData.authorizedProducts?.map(p => (
                     <span key={p} className="bg-[#22c55e]/10 text-[#22c55e] text-xs px-2 py-0.5 rounded border border-[#22c55e]/20">{p}</span>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          {/* Step 3 & 4 Mini Review */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 relative group">
            <button onClick={() => jumpToStep(3)} className="absolute top-4 right-4 text-gray-500 hover:text-[#22c55e] transition-colors p-1" title="Edit Documents">
               <Edit2 size={16} />
            </button>
            <h3 className="text-sm font-semibold text-[#22c55e] mb-3 uppercase tracking-wider">Uploads</h3>
            <div className="flex gap-4 text-xs">
               <div className={`px-3 py-1.5 rounded flex items-center gap-1.5 ${formData.licenseDoc ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#111] text-gray-500 border border-[#333]'}`}>
                 {formData.licenseDoc ? <CheckCircle size={14}/> : <Upload size={14}/>} License
               </div>
               <div className={`px-3 py-1.5 rounded flex items-center gap-1.5 ${formData.aadhaarDoc ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#111] text-gray-500 border border-[#333]'}`}>
                 {formData.aadhaarDoc ? <CheckCircle size={14}/> : <Upload size={14}/>} Aadhaar
               </div>
               <div className={`px-3 py-1.5 rounded flex items-center gap-1.5 ${formData.shopPhoto ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#111] text-gray-500 border border-[#333]'}`}>
                 {formData.shopPhoto ? <CheckCircle size={14}/> : <Upload size={14}/>} Photo
               </div>
            </div>
          </div>

        </div>

        <div className="flex justify-between mt-4">
          <button type="button" onClick={handleBack} className="bg-transparent border border-[#333] text-white hover:bg-[#1a1a1a] font-semibold py-3 px-8 rounded-xl transition-colors">
            Back
          </button>
          <button onClick={handleSubmitProfile} className="bg-[#22c55e] text-[#111] hover:bg-[#1ea84f] font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-[#22c55e]/20">
            Submit Profile
          </button>
        </div>
      </div>
    );
  };

  if (isInitializing) return <div className="p-8 text-white">Loading profile...</div>;

  return (
    <div className="min-h-full bg-[#0d0d0d] relative pb-20">
      <ProgressBar />
      
      <div className="max-w-[600px] mx-auto px-6 w-full mt-4">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>
        </div>
      </div>
    </div>
  );
}
