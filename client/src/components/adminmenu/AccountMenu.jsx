import React from 'react';
import DropdownMenu from '../DropdownMenu';

const AccountMenu = () => {
  const adminItems = [
    { label: 'C.C Summary', link: '/admin/account/ccsummary' },
    { label: 'C.C Pay', link: '/admin/account/ccpayinput' },
    { label: 'C.C Item', link: '/admin/account/cciteminput' },
    { label: 'C.C Holder', link: '/admin/account/ccholderinput' },
    { label: 'e', link: '/admin/logs' },
  ];

  return <DropdownMenu title="Account" items={adminItems} />;
};

export default AccountMenu;