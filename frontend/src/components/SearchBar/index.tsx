import React from 'react';
import styles from './searchBar.module.scss';

interface SearchBarProps {
  videoUrl: string;
  hasSearched: boolean;
  downloadInProgress: boolean;
  onSubmit: (videoUrl: string) => void;
  onChange: (videoUrl: string) => void;
}

function SearchBar({
  videoUrl,
  hasSearched,
  downloadInProgress,
  onSubmit,
  onChange,
}: SearchBarProps) {
  return (
    <header className={styles.searchBar}>
      <input
        disabled={downloadInProgress}
        style={{
          borderRadius: hasSearched ? '5px 5px 0 0' : '5px',
        }}
        type="text"
        placeholder="Video URL"
        value={videoUrl}
        onChange={(evt) => onChange(evt.currentTarget.value)}
        onKeyDown={(evt) => {
          if (evt.key === 'Enter') {
            onSubmit(videoUrl);
          }
        }}
      />
    </header>
  );
}

export default SearchBar;
