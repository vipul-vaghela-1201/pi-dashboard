// src/pages/PracticePage.jsx
import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Closures from '../components/Practice/Concepts/Closures';
import styles from './PracticePage.module.css';

const PracticePage = () => {
  const { concept } = useParams();
  const location = useLocation();

  // Debugging logs
  useEffect(() => {
    console.log('Current path:', location.pathname);
    console.log('Concept parameter:', concept);
  }, [location, concept]);

  const renderConcept = () => {
    console.log('Rendering concept:', concept); // This will log before rendering
    
    switch(concept) {
      case 'closures':
        return <Closures />;
      default:
        return <div>Select a concept from the sidebar</div>;
    }
  };

  return (
    <div className={styles.practiceLayout}>
      {renderConcept()}
    </div>
  );
};

export default PracticePage;