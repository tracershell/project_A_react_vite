import React from 'react';
import DropdownMenu from '../DropdownMenu';

const ImportMenu = () => {
  const adminItems = [
    { label: 'Import Vendor', link: '/admin/import/vendors' },
    { label: 'Import PO', link: '/admin/import/po' },
    { label: 'Deposit Payment', link: '/admin/import/deposit' },
    { label: 'Balance Payment', link: '/admin/import/balance' },
    { label: 'Extra Items', link: '/admin/import/extra' },
  ];

  return <DropdownMenu title="Import" items={adminItems} />;
};

export default ImportMenu;