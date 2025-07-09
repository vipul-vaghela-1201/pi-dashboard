// src/components/Editor.jsx
import React, { useState } from 'react';
import styles from './Editor.module.css';

const Editor = ({ initialCode = '', onCodeChange }) => {
  const [code, setCode] = useState(initialCode);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <h3 className={styles.title}>Editor</h3>
      <textarea
        className={styles.editor}
        value={code}
        onChange={handleChange}
        spellCheck="false"
      />
    </div>
  );
};

export default Editor;