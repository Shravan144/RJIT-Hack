import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LanguageToggle from './components/LanguageToggle';
import { Toaster } from 'react-hot-toast';

const Home = lazy(() => import('./pages/Home'));
const DealerSearch = lazy(() => import('./pages/DealerSearch'));
const DealerProfile = lazy(() => import('./pages/DealerProfile'));
const ProductSearch = lazy(() => import('./pages/ProductSearch'));
const ReportFiling = lazy(() => import('./pages/ReportFiling'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const DataAnalyticsDashboard = lazy(() => import('./AdminSection/DataAnalyticsDashboard'));
const HandleDealer = lazy(() => import('./AdminSection/HandleDealer'));
const HandleComplaints = lazy(() => import('./AdminSection/HandleComplaints'));
const AdminOrders = lazy(() => import('./AdminSection/AdminOrders'));
const AdminProfile = lazy(() => import('./AdminSection/Profile'));
const ComplaintManagement = lazy(() => import('./DealerSection/ComplaintManagement'));
const DealerProducts = lazy(() => import('./DealerSection/Products'));
const PrivateDealerProfile = lazy(() => import('./DealerSection/Profile'));
const DealerOrders = lazy(() => import('./DealerSection/Orders'));
const FarmerComplaintAndFraud = lazy(() => import('./FarmerSection/ComplaintAndFraud'));
const FarmerDealerSearch = lazy(() => import('./FarmerSection/DealerSearch'));
const FarmerProfile = lazy(() => import('./FarmerSection/Profile'));
const FarmerOrders = lazy(() => import('./FarmerSection/Orders'));

function RouteLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-brand-muted text-sm">
      Loading page...
    </div>
  );
}

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999, top: 70 }} toastOptions={{ duration: 2000 }} />
      <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public Routes - Keep original Navbar layout here if desired, or let them manage their own */}
        <Route path="/" element={
          user ? <Navigate to={`/${user.role}`} replace /> : (
            <>
              <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
              <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
                <LanguageToggle />
              </div>
              <Home />
            </>
          )
        } />
        
        <Route path="/dealers" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
              <LanguageToggle />
            </div>
            <DealerSearch />
          </>
        } />

        <Route path="/dealers/:id" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
              <LanguageToggle />
            </div>
            <DealerProfile />
          </>
        } />

        <Route path="/products" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
              <LanguageToggle />
            </div>
            <ProductSearch />
          </>
        } />

        <Route path="/report" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <div className="flex justify-end px-6 py-1.5 bg-brand-surface border-b border-brand-subtle">
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
          <Route path="complaints" element={<HandleComplaints />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/dealer" element={<DashboardLayout allowedRoles={['dealer']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="products" element={<DealerProducts />} />
          <Route path="orders" element={<DealerOrders />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="profile" element={<PrivateDealerProfile />} />
        </Route>

        <Route path="/farmer" element={<DashboardLayout allowedRoles={['farmer', 'user']} />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="dealers" element={<FarmerDealerSearch />} />
          <Route path="orders" element={<FarmerOrders />} />
          <Route path="complaint" element={<FarmerComplaintAndFraud />} />
          <Route path="profile" element={<FarmerProfile />} />
        </Route>

        <Route path="/inspector" element={<DashboardLayout allowedRoles={['inspector']} />}>
          <Route index element={<Navigate to="complaints" replace />} />
          <Route path="complaints" element={<HandleComplaints />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={
          <>
            <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
            <NotFound />
          </>
        } />
      </Routes>
      </Suspense>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
