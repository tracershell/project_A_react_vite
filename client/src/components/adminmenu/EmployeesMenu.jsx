import React from 'react';
import DropdownMenu from '../DropdownMenu';

const EmployeesMenu = () => {
  const adminItems = [
    { label: 'a', link: '/admin/dashboard' },
    { label: 'b', link: '/admin/users' },
    { label: 'c', link: '/admin/reports' },
    { label: 'd', link: '/admin/settings' },
    { label: 'e', link: '/admin/logs' },
    { label: 'Employees Data', link: '/admin/employees/employees' },
  ];

  return <DropdownMenu title="Employees" items={adminItems} />;
};

export default EmployeesMenu;