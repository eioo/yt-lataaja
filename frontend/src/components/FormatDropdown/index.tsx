import { groupBy, orderBy } from 'lodash-es';
import React, { useMemo, useRef, useState } from 'react';
import type { VideoFormat } from 'shared/youtube';
import useClickAway from '../../useClickAway';
import styles from './dropdown.module.scss';

function getBestVideoFormat(formats: VideoFormat[]) {
  return formats.find((f) => [5, 6, 17, 18, 22].includes(f.itag)); // itag is always the same for best format
}

interface FormatDropdownProps {
  disabled: boolean;
  formats: VideoFormat[];
  selectedVideoItag: number | undefined;
  onSelectedVideoItagChange: (itag: number) => void;
}

function FormatDropdown({
  disabled,
  formats,
  selectedVideoItag,
  onSelectedVideoItagChange,
}: FormatDropdownProps) {
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickAway(menuRef, () => setOpen(false));

  const selectedFormat = useMemo(
    () => formats.find((f) => f.itag === selectedVideoItag),
    [formats, selectedVideoItag],
  );

  const bestFormat = useMemo(() => {
    const format = getBestVideoFormat(formats);
    format && onSelectedVideoItagChange(format.itag);
    return format;
  }, [formats]);

  const menuStyle = useMemo(() => {
    const containerPos = containerRef.current?.getBoundingClientRect();
    const controlPos = controlRef.current?.getBoundingClientRect();

    if (!containerPos || !controlPos || !isOpen) {
      return {};
    }

    const relativePos = {
      top: controlPos.top - containerPos.top,
      left: controlPos.left - containerPos.left,
    };

    return {
      top: `calc(${relativePos.top}px + 24px)`,
      left: relativePos.left,
    };
  }, [isOpen, containerRef, controlRef]);

  const groupedFormats = groupBy(formats, (f) =>
    f.qualityLabel === null ? 'Audio only' : f.qualityLabel,
  );

  const formatEntries = orderBy(
    Object.entries(groupedFormats),
    ([groupName, [first]]) =>
      groupName === 'Audio only' ? 0 : (first.height || 0) + (first.fps || 0),
    'desc',
  );

  const createFormatText = (
    format: VideoFormat,
    longVersion?: boolean,
  ): string => {
    const qualityText = longVersion
      ? `(${format.qualityLabel || 'Audio'}) `
      : '';

    const videoText = format.hasVideo
      ? `${(Number(format.bitrate) / Math.pow(10, 6)).toFixed(2)} Mbps`
      : '';

    const audioText = format.hasAudio
      ? `${format.audioBitrate} kbps`
      : 'no audio';

    const isBestText = format.itag === bestFormat?.itag ? ` (Best) ` : '';
    return `${qualityText}${[videoText, audioText]
      .filter((text) => text)
      .join(', ')}${isBestText}`;
  };

  return (
    <div ref={containerRef} className={styles.container}>
      Video format:
      <div
        ref={controlRef}
        className={`${styles.control} ${isOpen ? styles.open : ''} ${
          disabled ? styles.disabled : ''
        }`}
        onClick={() => {
          if (!isOpen && !disabled) {
            setOpen(true);
          }
        }}
      >
        {selectedFormat !== undefined
          ? createFormatText(selectedFormat, true)
          : 'Select...'}
      </div>
      {isOpen && (
        <div ref={menuRef} className={styles.menu} style={menuStyle}>
          <ul>
            {formatEntries.map(([groupName, formats]) => (
              <li key={`format-group-${groupName}`}>
                <div>{groupName}</div>
                <ul>
                  {formats.map((format) => (
                    <li
                      key={`format-${format.itag}`}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                        onSelectedVideoItagChange(format.itag);
                        setOpen(false);
                      }}
                    >
                      {createFormatText(format)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FormatDropdown;
