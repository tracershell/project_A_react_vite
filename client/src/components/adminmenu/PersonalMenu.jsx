import React from 'react';
import DropdownMenu from '../DropdownMenu';

const PersonalMenu = () => {
  const adminItems = [
    { label: 'Photo', link: '/admin/personal/photo' },
    { label: 'Music', link: '/admin/personal/music' },
    { label: 'Movie', link: '/admin/personal/movie' },
    { label: 'd', link: '/admin/settings' },
    { label: 'e', link: '/admin/logs' },
  ];

  return <DropdownMenu title="Personal" items={adminItems} />;
};

export default PersonalMenu;