import * as fs from 'fs';
import * as path from 'path';

export class FsUtils {
  static async createFile(filePath: string, data: string): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, data);
    } catch (error) {
      throw new Error(`Failed to create file: ${error.message}`);
    }
  }

  static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  static async readDirectory(directoryPath: string): Promise<string[]> {
    try {
      return await fs.promises.readdir(directoryPath);
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  }

  static watchDirectory(
    directoryPath: string,
    callback: (eventType: string, filename: string) => void,
  ): void {
    fs.watch(directoryPath, { persistent: true }, callback);
  }
}
