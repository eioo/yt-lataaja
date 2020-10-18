import React from 'react';
import { outputFileExtensions } from '../../constants';
import styles from './fileFormatSelect.module.scss';

interface FileFormatSelectProps {
  disabled?: boolean;
  selectedFileType: string;
  onChange: (fileType: string) => void;
}

function FileFormatSelect({
  disabled,
  selectedFileType,
  onChange,
}: FileFormatSelectProps) {
  return (
    <section>
      <h2 className={styles.title}>Output</h2>

      <div
        className={`${styles.fileTypeSelect} ${
          disabled ? styles.disabled : ''
        }`}
      >
        {outputFileExtensions.map((extension, index) => (
          <button
            key={index}
            disabled={disabled}
            className={extension === selectedFileType ? styles.active : ''}
            onClick={() => onChange(extension)}
          >
            {extension}
          </button>
        ))}
      </div>
    </section>
  );
}

export default FileFormatSelect;
