import * as fs from 'fs';
import * as path from 'path';

export const outputDirName = '../frontend/dist';

export function fileExists(path: string) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export const getRelativeOutputPath = (
  { title, videoId }: { title: string; videoId: string },
  fileExtension: string
) => {
  return path.resolve(videoId, `${sanitizeFilename(title)}.${fileExtension}`);
};

export const relativeToAbsolutePath = (relativePath: string) =>
  path.resolve(process.cwd(), relativePath);

export const createOutputDir = (filePath: string) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};
