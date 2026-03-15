import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LanguageToggle from './components/LanguageToggle';
import Home from './pages/Home';
import DealerSearch from './pages/DealerSearch';
import DealerProfile from './pages/DealerProfile';
import ProductSearch from './pages/ProductSearch';
import ReportFiling from './pages/ReportFiling';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';

// Layout & Config
import DashboardLayout from './components/DashboardLayout';

// Admin Pages
import DataAnalyticsDashboard from './AdminSection/DataAnalyticsDashboard';
import HandleDealer from './AdminSection/HandleDealer';
import AdminProfile from './AdminSection/Profile';

// Dealer Pages
import DealerAnalyticsDashboard from './DealerSection/AnalyticsDashboard';
import ComplaintManagement from './DealerSection/ComplaintManagement';
import DealerProducts from './DealerSection/Products';
import PrivateDealerProfile from './DealerSection/Profile';

// Farmer Pages
import FarmerComplaintAndFraud from './FarmerSection/ComplaintAndFraud';
import FarmerDealerSearch from './FarmerSection/DealerSearch';
import ProductVerification from './FarmerSection/ProductVerification';
import FarmerProfile from './FarmerSection/Profile';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* Public Routes - Keep original Navbar layout here if desired, or let them manage their own */}
        <Route path="/" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-[hsl(220,16%,12%)] border-b border-[hsl(220,14%,20%)]">
              <LanguageToggle />
            </div>
            <Home />
          </>
        } />
        
        <Route path="/dealers" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-[hsl(220,16%,12%)] border-b border-[hsl(220,14%,20%)]">
              <LanguageToggle />
            </div>
            <DealerSearch />
          </>
        } />

        <Route path="/dealers/:id" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-[hsl(220,16%,12%)] border-b border-[hsl(220,14%,20%)]">
              <LanguageToggle />
            </div>
            <DealerProfile />
          </>
        } />

        <Route path="/products" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-[hsl(220,16%,12%)] border-b border-[hsl(220,14%,20%)]">
              <LanguageToggle />
            </div>
            <ProductSearch />
          </>
        } />

        <Route path="/report" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-[hsl(220,16%,12%)] border-b border-[hsl(220,14%,20%)]">
              <LanguageToggle />
            </div>
            <ReportFiling />
          </>
        } />
        {/* Protected Dashboard Routes - Uses the dynamic layout */}
        {/* Note: Adjust 'admin', 'dealer', 'farmer' values to whatever your auth context uses for user.role */}
        <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="analytics" element={<DataAnalyticsDashboard />} />
          <Route path="dealers" element={<HandleDealer />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/dealer" element={<DashboardLayout allowedRoles={['dealer']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="dashboard" element={<DealerAnalyticsDashboard />} />
          <Route path="products" element={<DealerProducts />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="profile" element={<PrivateDealerProfile />} />
        </Route>

        <Route path="/farmer" element={<DashboardLayout allowedRoles={['farmer', 'user']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="dealers" element={<FarmerDealerSearch />} />
          <Route path="verify" element={<ProductVerification />} />
          <Route path="complaint" element={<FarmerComplaintAndFraud />} />
          <Route path="profile" element={<FarmerProfile />} />
        </Route>

        <Route path="*" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <NotFound />
          </>
        } />
      </Routes>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
