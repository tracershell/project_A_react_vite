import React from 'react';
import DropdownMenu from '../DropdownMenu';

const AlexisMenu = () => {
  const familyItems = [
    { label: 'Photo', link: '/family/alexis/photo' }, // full path 사용해야 함
    { label: 'Movie', link: '/family/alexis/movie' },    
  ];

  return <DropdownMenu title="Alexis" items={familyItems} />;
};

export default AlexisMenu;