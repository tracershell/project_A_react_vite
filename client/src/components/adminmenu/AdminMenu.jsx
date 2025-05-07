import React from 'react';
import DropdownMenu from '../DropdownMenu';

const AdminMenu = () => {
  const adminItems = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Users', link: '/admin/users' },
    { label: 'Reports', link: '/admin/reports' },
    { label: 'Settings', link: '/admin/settings' },
    { label: 'Logs', link: '/admin/logs' },
  ];

  return <DropdownMenu title="Admin" items={adminItems} />;
};

export default AdminMenu;
