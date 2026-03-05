import fs from 'node:fs';
import path from 'node:path';
import { log } from '@packages/utils';

type CopyOptions = {
  subDir?: boolean;
  watch?: boolean;
};

export const isFile = (filePath: string) => {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
};

export const isDir = (filePath: string) => {
  return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
};

export const copyDir = ({
  sourcePath,
  targetPath,
  copyOptions = { subDir: false, watch: false },
}: {
  sourcePath: string;
  targetPath: string;
  copyOptions: CopyOptions;
}) => {
  if (!isDir(sourcePath)) {
    return;
  }

  const { subDir, watch } = copyOptions;

  !subDir && log.node(`Copying "${sourcePath}"`);

  if (fs.existsSync(targetPath)) {
    if (!fs.lstatSync(targetPath).isDirectory()) {
      throw `Copy dir error, target path ${targetPath} is not a directory`;
    }
  } else {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  fs.readdirSync(sourcePath).forEach((file) => {
    const itemSource = path.join(sourcePath, file);
    const itemTarget = path.join(targetPath, file);

    if (fs.lstatSync(itemSource).isDirectory()) {
      copyDir({
        sourcePath: itemSource,
        targetPath: itemTarget,
        copyOptions: {
          subDir: true,
          watch,
        },
      });
    } else {
      const copy = () => fs.copyFileSync(itemSource, itemTarget);
      copy();
      watch &&
        fs.watchFile(itemSource, () => {
          copy();
          log.info(`File changed: ${itemSource}`);
        });
    }
  });
};

export const removeDir = (targetPath: string, subDir = false) => {
  if (!isDir(targetPath)) {
    return;
  }

  !subDir && log.node(`Removing "${targetPath}"`);

  fs.readdirSync(targetPath).forEach((file) => {
    const itemPath = path.resolve(targetPath, file);

    fs.lstatSync(itemPath).isDirectory() ? removeDir(itemPath, true) : fs.unlinkSync(itemPath);
  });

  fs.rmdirSync(targetPath);
};
