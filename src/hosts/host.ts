export abstract class Host {
    abstract command(optionsOrCommand: CommandOptions|string): Promise<CommandResult>;

    abstract uploadFile(options: UploadFileOptions): Promise<void>;
}

export interface CommandResult {
    code: number;
    stdout: string;
    stderr: string;
}

export interface CommandOptions {
    command: string;
    cwd?: string;
}

export type UploadFileOptions = {
    remotePath: string;
    localPath: string;
} | {
    remotePath: string;
    content: string;
}
