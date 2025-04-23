export declare class FsUtils {
    static createFile(filePath: string, data: string): Promise<void>;
    static readFile(filePath: string): Promise<string>;
    static readDirectory(directoryPath: string): Promise<string[]>;
    static watchDirectory(directoryPath: string, callback: (eventType: string, filename: string) => void): void;
}
