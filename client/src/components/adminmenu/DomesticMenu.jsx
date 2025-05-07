import React from 'react';
import DropdownMenu from '../DropdownMenu';

const DomesticMenu = () => {
  const adminItems = [
    { label: 'a', link: '/admin/dashboard' },
    { label: 'b', link: '/admin/users' },
    { label: 'c', link: '/admin/reports' },
    { label: 'd', link: '/admin/settings' },
    { label: 'e', link: '/admin/logs' },
  ];

  return <DropdownMenu title="Domestic" items={adminItems} />;
};

export default DomesticMenu;