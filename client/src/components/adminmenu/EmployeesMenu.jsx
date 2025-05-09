import React from 'react';
import DropdownMenu from '../DropdownMenu';

const EmployeesMenu = () => {
  const adminItems = [
    { label: 'Employees', link: 'admin/employees/employees' },
    { label: 'b', link: '/admin/users' },
    { label: 'c', link: '/admin/reports' },
    { label: 'd', link: '/admin/settings' },
    { label: 'e', link: '/admin/logs' },
    { label: 'E Data', link: '/admin/employees/Data' },
  ];

  return <DropdownMenu title="Employees" items={adminItems} />;
};

export default EmployeesMenu;