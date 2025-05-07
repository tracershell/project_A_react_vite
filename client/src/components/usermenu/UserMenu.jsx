import React from 'react';
import DropdownMenu from '../DropdownMenu';

const UserMenu = () => {
  const userItems = [
    { label: 'Profile', link: '/user/profile' },
    { label: 'Orders', link: '/user/orders' },
    { label: 'Messages', link: '/user/messages' },
    { label: 'Settings', link: '/user/settings' },
  ];

  return <DropdownMenu title="User Page" items={userItems} />;
};

export default UserMenu;
