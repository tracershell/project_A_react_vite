import React from 'react';
import DropdownMenu from '../DropdownMenu';

const GeneralMenu = () => {
  const adminItems = [
    { label: 'Envelope', link: '/admin/general/envelope' },
    { label: 'Envelope input', link: '/admin/general/envelope_input' },
    { label: 'c', link: '/admin/reports' },
    { label: 'd', link: '/admin/settings' },
    { label: 'e', link: '/admin/logs' },
  ];

  return <DropdownMenu title="General" items={adminItems} />;
};

export default GeneralMenu;