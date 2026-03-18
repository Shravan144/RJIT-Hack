import { 
  BarChart, 
  Users, 
  UserCircle, 
  Package, 
  AlertTriangle, 
  Search, 
  CheckSquare,
  ShoppingCart,
  ShieldCheck,
  Flag
} from 'lucide-react';

export const sidebarConfig = {
  admin: [
    {
      label: 'Profile',
      path: '/admin/profile',
      icon: <UserCircle size={20} />
    },
    {
      label: 'Dashboard',
      path: '/admin/analytics',
      icon: <BarChart size={20} />
    },
    {
      label: 'Dealer Verification',
      path: '/admin/dealers',
      icon: <ShieldCheck size={20} />
    },
    {
      label: 'Complaints',
      path: '/admin/complaints',
      icon: <AlertTriangle size={20} />
    },
    {
      label: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingCart size={20} />
    }
  ],
  dealer: [
    {
      label: 'Profile',
      path: '/dealer/profile',
      icon: <UserCircle size={20} />
    },
    {
      label: 'Products',
      path: '/dealer/products',
      icon: <Package size={20} />
    },
    {
      label: 'Orders',
      path: '/dealer/orders',
      icon: <ShoppingCart size={20} />
    },
    {
      label: 'Complaints',
      path: '/dealer/complaints',
      icon: <AlertTriangle size={20} />
    }
  ],
  farmer: [
    {
      label: 'Profile',
      path: '/farmer/profile',
      icon: <UserCircle size={20} />
    },
    {
      label: 'Dealer Search',
      path: '/farmer/dealers',
      icon: <Search size={20} />
    },
    {
      label: 'My Orders',
      path: '/farmer/orders',
      icon: <ShoppingCart size={20} />
    },
    {
      label: 'Complaint & Fraud',
      path: '/farmer/complaint',
      icon: <AlertTriangle size={20} />
    }
  ],
  inspector: [
    {
      label: 'Profile',
      path: '/inspector/profile',
      icon: <UserCircle size={20} />
    },
    {
      label: 'Complaints',
      path: '/inspector/complaints',
      icon: <AlertTriangle size={20} />
    }
  ]
};
