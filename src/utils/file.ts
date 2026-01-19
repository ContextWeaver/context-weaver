// RPG Event Generator v3.0.0 - File System Utilities
// Centralized file I/O operations and pathModule management

// Conditional imports for Node.js environment
let fs: any, pathModule: any;

try {
  fs = require('fs');
  pathModule = require('path');
} catch (e) {
  // In React Native and other environments without Node.js APIs
  fs = null;
  pathModule = null;
}
import { FILE_CONSTANTS } from './constants';

/**
 * Ensure directory exists, creating it if necessary
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs || !pathModule) {
    console.warn('File system operations not supported in this environment');
    return;
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Read JSON file safely
 */
export function readJsonFile<T = any>(filePath: string): T | null {
  if (!fs || !pathModule) {
    console.warn('File system operations not supported in this environment');
    return null;
  }
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.warn(`Failed to read JSON file ${filePath}:`, (error as Error).message);
    return null;
  }
}

/**
 * Write JSON file safely
 */
export function writeJsonFile(filePath: string, data: any, indent: number = 2): boolean {
  if (!fs || !pathModule) {
    console.warn('File system operations not supported in this environment');
    return false;
  }
  try {
    ensureDirectory(pathModule.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, indent), 'utf8');
    return true;
  } catch (error) {
    console.error(`Failed to write JSON file ${filePath}:`, (error as Error).message);
    return false;
  }
}

/**
 * Read text file safely
 */
export function readTextFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn(`Failed to read text file ${filePath}:`, (error as Error).message);
    return null;
  }
}

/**
 * Write text file safely
 */
export function writeTextFile(filePath: string, content: string): boolean {
  if (!fs || !pathModule) {
    console.warn('File system operations not supported in this environment');
    return false;
  }
  try {
    ensureDirectory(pathModule.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Failed to write text file ${filePath}:`, (error as Error).message);
    return false;
  }
}

/**
 * List files in directory with extension filter
 */
export function listFiles(dirPath: string, extension?: string): string[] {
  if (!fs) {
    console.warn('File system operations not supported in this environment');
    return [];
  }
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files = fs.readdirSync(dirPath);
    if (extension) {
      return files.filter(file => file.endsWith(extension));
    }
    return files;
  } catch (error) {
    console.warn(`Failed to list files in ${dirPath}:`, (error as Error).message);
    return [];
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  if (!fs || !pathModule) {
    return false;
  }
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Get file stats
 */
export function getFileStats(filePath: string): any | null {
  if (!fs) {
    return null;
  }
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

/**
 * Get file size in bytes
 */
export function getFileSize(filePath: string): number {
  const stats = getFileStats(filePath);
  return stats ? stats.size : 0;
}

/**
 * Check if file size is within limits
 */
export function isValidFileSize(filePath: string): boolean {
  const size = getFileSize(filePath);
  return size > 0 && size <= FILE_CONSTANTS.MAX_FILE_SIZE_BYTES;
}

/**
 * Create backup of file
 */
export function backupFile(filePath: string): string | null {
  if (!fs || !pathModule) {
    console.warn('File system operations not supported in this environment');
    return null;
  }
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const ext = pathModule.extname(filePath);
    const name = pathModule.basename(filePath, ext);
    const dir = pathModule.dirname(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = pathModule.join(dir, `${name}.backup.${timestamp}${ext}`);

    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.error(`Failed to create backup of ${filePath}:`, (error as Error).message);
    return null;
  }
}

/**
 * Clean old backup files
 */
export function cleanOldBackups(dirPath: string, retentionDays: number = FILE_CONSTANTS.BACKUP_RETENTION_DAYS): number {
  if (!fs || !pathModule) {
    console.warn('File system operations not supported in this environment');
    return 0;
  }
  try {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    const files = fs.readdirSync(dirPath);
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    files.forEach(file => {
      if (file.includes('.backup.')) {
        const filePath = pathModule.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    });

    return deletedCount;
  } catch (error) {
    console.warn(`Failed to clean old backups in ${dirPath}:`, (error as Error).message);
    return 0;
  }
}

/**
 * Get relative pathModule from base directory
 */
export function getRelativePath(baseDir: string, fullPath: string): string {
  if (!pathModule) return fullPath;
  return pathModule.relative(baseDir, fullPath);
}

/**
 * Resolve pathModule safely
 */
export function resolvePath(...segments: string[]): string {
  if (!pathModule) return segments.join('/');
  return pathModule.resolve(...segments);
}

/**
 * Join pathModules safely
 */
export function joinPath(...segments: string[]): string {
  if (!pathModule) return segments.join('/');
  return pathModule.join(...segments);
}

/**
 * Get directory name from pathModule
 */
export function getDirectoryName(filePath: string): string {
  if (!pathModule) return '';
  return pathModule.dirname(filePath);
}

/**
 * Get filename from pathModule
 */
export function getFilename(filePath: string): string {
  if (!pathModule) return filePath;
  return pathModule.basename(filePath);
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filePath: string): string {
  if (!pathModule) return filePath;
  return pathModule.basename(filePath, pathModule.extname(filePath));
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  if (!pathModule) return '';
  return pathModule.extname(filePath);
}