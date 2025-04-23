"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsUtils = void 0;
const fs = require("fs");
class FsUtils {
    static async createFile(filePath, data) {
        try {
            await fs.promises.writeFile(filePath, data);
        }
        catch (error) {
            throw new Error(`Failed to create file: ${error.message}`);
        }
    }
    static async readFile(filePath) {
        try {
            return await fs.promises.readFile(filePath, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to read file: ${error.message}`);
        }
    }
    static async readDirectory(directoryPath) {
        try {
            return await fs.promises.readdir(directoryPath);
        }
        catch (error) {
            throw new Error(`Failed to read directory: ${error.message}`);
        }
    }
    static watchDirectory(directoryPath, callback) {
        fs.watch(directoryPath, { persistent: true }, callback);
    }
}
exports.FsUtils = FsUtils;
//# sourceMappingURL=fs-utils.js.map