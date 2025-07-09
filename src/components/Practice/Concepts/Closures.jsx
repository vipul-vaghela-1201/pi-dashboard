// src/components/concepts/Closures.jsx
import React, { useState, useEffect } from 'react';
import Editor from '../Editor';
import Result from '../Result';
import Explanation from '../Explanation';
import styles from '../Concepts/ConceptCss/Concept.module.css';

const initialCode = `function outer() {
  const secret = "I'm private!";
  return function inner() {
    console.log(secret); // Still has access to \`secret\`.
  };
}
const getSecret = outer();
getSecret(); // Logs: "I'm private!" (even though \`outer()\` has finished).`;

const explanationContent = `
<h2>Understanding Closures</h2>
<p>A closure is a function that has access to its own scope, the outer function's variables, and the global variables—even after the outer function has returned.</p>

<h3>Key Characteristics:</h3>
<ul>
  <li>Closures have access to the outer function's variables even after the outer function returns</li>
  <li>They maintain a reference to the outer function's variables (not a copy)</li>
  <li>Each closure has its own lexical environment</li>
</ul>

<h3>Example Breakdown:</h3>
<pre><code>${initialCode}</code></pre>

<p>In this example, the inner function maintains access to the <code>secret</code> variable even after <code>outer()</code> has finished executing.</p>

<h3>Common Use Cases:</h3>
<ul>
  <li>Data privacy/emulating private methods</li>
  <li>Partial applications and currying</li>
  <li>Event handlers and callbacks</li>
  <li>Functional programming patterns</li>
</ul>
`;

const Closures = () => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const executeCode = () => {
    try {
      // Capture console.log outputs
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      // Execute the code
      new Function(code)();

      // Restore console.log
      console.log = originalLog;

      setOutput(logs.join('\n'));
      setError('');
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  };

  useEffect(() => {
    executeCode();
  }, []);

  return (
    <div className={styles.conceptContainer}>
      <div className={styles.codeArea}>
        <Editor 
          initialCode={initialCode} 
          onCodeChange={(newCode) => {
            setCode(newCode);
          }}
        />
        <div className={styles.runButtonContainer}>
          <button className={styles.runButton} onClick={executeCode}>
            Run Code
          </button>
        </div>
        <Result output={output} error={error} />
      </div>
      <div className="styles.explanation"> {/* Add this wrapper */}
        <Explanation content={explanationContent} />
      </div>
    </div>
  );
};

export default Closures;