// RPG Event Generator v2.0.0 - File System Utilities
// Centralized file I/O operations and path management

import * as fs from 'fs';
import * as path from 'path';
import { FILE_CONSTANTS } from './constants';

/**
 * Ensure directory exists, creating it if necessary
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Read JSON file safely
 */
export function readJsonFile<T = any>(filePath: string): T | null {
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
  try {
    ensureDirectory(path.dirname(filePath));
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
  try {
    ensureDirectory(path.dirname(filePath));
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
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Get file stats
 */
export function getFileStats(filePath: string): fs.Stats | null {
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
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(dir, `${name}.backup.${timestamp}${ext}`);

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
  try {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    const files = fs.readdirSync(dirPath);
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    files.forEach(file => {
      if (file.includes('.backup.')) {
        const filePath = path.join(dirPath, file);
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
 * Get relative path from base directory
 */
export function getRelativePath(baseDir: string, fullPath: string): string {
  return path.relative(baseDir, fullPath);
}

/**
 * Resolve path safely
 */
export function resolvePath(...segments: string[]): string {
  return path.resolve(...segments);
}

/**
 * Join paths safely
 */
export function joinPath(...segments: string[]): string {
  return path.join(...segments);
}

/**
 * Get directory name from path
 */
export function getDirectoryName(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Get filename from path
 */
export function getFilename(filePath: string): string {
  return path.basename(filePath);
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath);
}