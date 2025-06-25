import React from 'react';
import DropdownMenu from '../DropdownMenu';

const EmployeesMenu = () => {
  const adminItems = [
    { label: 'Employees List', link: '/admin/employees/main' },
    { label: 'Employees', link: 'admin/employees/employees' },
    { label: 'E. Data', link: '/admin/employees/employeesdata' },
    { label: 'E. Photo', link: '/admin/employees/employeesphoto' },    
    { label: 'e', link: '/admin/logs' },
    { label: 'E Data', link: '/admin/employees/Data' },
  ];

  return <DropdownMenu title="Employees" items={adminItems} />;
};

export default EmployeesMenu;