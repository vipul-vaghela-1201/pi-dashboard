// src/components/Result.jsx
import React from 'react';
import styles from './Result.module.css';

const Result = ({ output = '', error = '' }) => {
  return (
    <div className={styles.resultContainer}>
      <h3 className={styles.title}>Result</h3>
      <div className={styles.resultContent}>
        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.output}>{output || 'Run code to see result'}</div>
        )}
      </div>
    </div>
  );
};

export default Result;