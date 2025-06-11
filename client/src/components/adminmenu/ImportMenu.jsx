import React from 'react';
import DropdownMenu from '../DropdownMenu';

const ImportMenu = () => {
  const adminItems = [
    { label: 'Import PO', link: '/admin/import/po' },
    { label: 'Deposit Payment', link: '/admin/import/deposit' },
    { label: 'Balance Payment', link: '/admin/import/balance' },
    { label: 'a', link: '/admin' },
    { label: 'b', link: '/admin' },
  ];

  return <DropdownMenu title="Import" items={adminItems} />;
};

export default ImportMenu;