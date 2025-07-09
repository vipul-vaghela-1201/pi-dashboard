// src/components/Explanation.jsx
import React from 'react';
import styles from './Explanation.module.css';

const Explanation = ({ content = '' }) => {
  return (
    <div className={styles.explanationContainer}>
      <h3 className={styles.title}>Explanation</h3>
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default Explanation;