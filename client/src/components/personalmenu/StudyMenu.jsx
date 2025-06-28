import React from 'react';
import DropdownMenu from '../DropdownMenu';

const StudyMenu = () => {
  const personalItems = [
    { label: 'music', link: '/personal/study/music' }, // full path 사용해야 함    
  ];

  return <DropdownMenu title="Study" items={personalItems} />;
};

export default StudyMenu;