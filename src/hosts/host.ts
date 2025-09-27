export abstract class Host {
    abstract command(options: CommandOptions): Promise<CommandResult>;

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

export interface UploadFileOptions {
    remotePath: string;
    localPath: string;
}
