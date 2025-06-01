import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './DropdownMenu.module.css';

const DropdownMenu = ({ title, items }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={styles.dropdown}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className={styles.dropdownButton}>{title} ⏬</button>
      {open && (
        <div className={styles.dropdownContent}>
          {items.map((item, index) => (
            <Link key={index} to={item.link} className={styles.dropdownItem}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;