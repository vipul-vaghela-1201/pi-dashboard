// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState([]);

  const toggleMenu = (menu) => {
    if (openMenus.includes(menu)) {
      setOpenMenus(openMenus.filter(m => m !== menu));
    } else {
      setOpenMenus([...openMenus, menu]);
    }
  };

  const menuItems = [
    {
      title: 'Basics',
      items: [
        { name: 'Variables', path: '/practice/variables' },
        { name: 'Functions', path: '/practice/functions' },
      ],
    },
    {
      title: 'Beginner',
      items: [
        { name: 'Closures', path: '/practice/closures' },
        { name: 'Hoisting', path: '/practice/hoisting' },
      ],
    },
    {
      title: 'Intermediate',
      items: [
        { name: 'Promises', path: '/practice/promises' },
        { name: 'Async/Await', path: '/practice/async-await' },
      ],
    },
    {
      title: 'Advanced',
      items: [
        { name: 'Memoization', path: '/practice/memoization' },
        { name: 'Currying', path: '/practice/currying' },
      ],
    },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>Code Playground</div>
      <nav className={styles.nav}>
        {menuItems.map((menu) => (
          <div key={menu.title} className={styles.menuSection}>
            <div 
              className={styles.menuTitle}
              onClick={() => toggleMenu(menu.title)}
            >
              {menu.title}
              <span className={styles.arrow}>
                {openMenus.includes(menu.title) ? '▼' : '▶'}
              </span>
            </div>
            {openMenus.includes(menu.title) && (
              <div className={styles.subMenu}>
                {menu.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      isActive ? `${styles.link} ${styles.active}` : styles.link
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;