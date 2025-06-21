import React from 'react';
import DropdownMenu from '../DropdownMenu';

const AccountMenu = () => {
  const adminItems = [
    { label: 'Bank Balance', link: '/admin/account/bankbalance' },
    { label: 'Credit Card', link: '/admin/account/ccsummary' },
    { label: 'Petty Money', link: '/admin/account/pettymoneyledger' },
    { label: 'G', link: '/admin' },
    { label: 'H', link: '/admin' },
    { label: 'I', link: '/admin' },
  ];

  return <DropdownMenu title="Account" items={adminItems} />;
};

export default AccountMenu;