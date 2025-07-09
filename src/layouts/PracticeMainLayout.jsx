// src/layouts/PracticeMainLayout.jsx
import React from 'react';
import Sidebar from '../components/Practice/Sidebar';
import { Outlet } from 'react-router-dom';  // Add this import
import styles from './PracticeMainLayout.module.css';

const PracticeMainLayout = () => {
  console.log('PracticeMainLayout rendering');
  
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Outlet />  {/* This renders the matched child route */}
      </main>
    </div>
  );
};

export default PracticeMainLayout;