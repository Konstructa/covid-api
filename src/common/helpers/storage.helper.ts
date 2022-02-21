import fs from 'fs';
import { promisify } from 'util';

export async function createFile(path: string, fileName: string, data: string) {
  fs.mkdirSync(path);

  const writeFile = promisify(fs.writeFile);

  return writeFile(`${path}/${fileName}`, data, 'utf8');
}

export async function deleteFile(path: string) {
  const deleted = promisify(fs.unlink);

  return deleted(path);
}

export async function getFile(path: string, encoding: string) {
  const readFile = promisify(fs.readFile);

  return encoding ? readFile(path, 'utf8') : readFile(path, {});
}
