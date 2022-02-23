import * as fs from 'fs';
import { promisify } from 'util';

export function createFile(path: string, fileName: string, data: string) {
  try {
    if (!checkIfDirectoryExists) {
      fs.mkdirSync(path);
    }

    const writeFile = promisify(fs.writeFile);

    return writeFile(`${path}/${fileName}`, data, 'utf8');
  } catch (error) {
    console.log(error);
  }
}

export function deleteFile(path: string) {
  try {
    const deleted = promisify(fs.unlink);

    return deleted(path);
  } catch (error) {
    console.log(error);
  }
}

export function getFile(path: string, encoding: string) {
  const readFile = promisify(fs.readFile);

  return encoding ? readFile(path, 'utf8') : readFile(path, {});
}

export function checkIfDirectoryExists(path: string) {
  return fs.existsSync(path);
}
