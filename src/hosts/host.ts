export abstract class Host {
    abstract command(options: CommandOptions): Promise<CommandResult>;
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
