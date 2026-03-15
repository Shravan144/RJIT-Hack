import { 
  BarChart, 
  Users, 
  UserCircle, 
  Package, 
  AlertTriangle, 
  Search, 
  CheckSquare 
} from 'lucide-react';

export const sidebarConfig = {
  admin: [
    {
      label: 'Profile',
      path: '/admin/profile',
      icon: <UserCircle size={20} />
    },
    {
      label: 'Data Analytics Dashboard',
      path: '/admin/analytics',
      icon: <BarChart size={20} />
    },
    {
      label: 'Handle Dealers',
      path: '/admin/dealers',
      icon: <Users size={20} />
    }
  ],
  dealer: [
    {
      label: 'Profile',
      path: '/dealer/profile',
      icon: <UserCircle size={20} />
    },
    {
      label: 'Analytics Dashboard',
      path: '/dealer/dashboard',
      icon: <BarChart size={20} />
    },
    {
      label: 'Products',
      path: '/dealer/products',
      icon: <Package size={20} />
    },
    {
      label: 'Complaint Management',
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
      label: 'Product Verification',
      path: '/farmer/verify',
      icon: <CheckSquare size={20} />
    },
    {
      label: 'Complaint & Fraud',
      path: '/farmer/complaint',
      icon: <AlertTriangle size={20} />
    }
  ]
};
