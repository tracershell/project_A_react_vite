import React from 'react';
import DropdownMenu from '../DropdownMenu';

const ImportMenu = () => {
  const adminItems = [
    { label: 'Payroll Tax', link: '/admin/payroll/tax' },   // adminPayrollTaxRoutes 에서 정의한  path 경로
    { label: 'Salary Adjust', link: '/admin/payroll/adjust' },
    { label: 'Sick PVcation', link: '/admin/payroll/sick' },
    { label: 'Payroll Doc', link: '/admin/payroll/doc' },
    { label: 'd', link: '/admin/' },
  ];

  return <DropdownMenu title="Payroll" items={adminItems} />;
};

export default ImportMenu;