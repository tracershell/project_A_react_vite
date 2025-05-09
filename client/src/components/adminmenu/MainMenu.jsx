import React from 'react';
import DropdownMenu from '../DropdownMenu';

const MainMenu = () => {
  const adminItems = [
    { label: 'a', link: '/admin/main/a' },
    { label: 'b', link: '/admin/main/b' },
    { label: 'c', link: '/admin/main/c' },
    { label: 'd', link: '/admin/main/d' },
    { label: 'e', link: '/admin/main/e' },
  ];

  return <DropdownMenu title="Main" items={adminItems} />;
};

export default MainMenu;