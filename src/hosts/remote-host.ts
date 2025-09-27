import {Host, CommandResult, CommandOptions, UploadFileOptions} from "./host";
import {Client} from "ssh2";

export class RemoteHost extends Host {
    constructor(
        public readonly host: string,
        public readonly port: number,
        public readonly user: string,
        public readonly pass: string,
    ) {
        super();
    }

    async command(options: CommandOptions): Promise<CommandResult> {
        return new Promise<CommandResult>((resolve) => {
            this.connect(async conn => {
                const result = await command(conn, options);

                conn.end();

                resolve(result);
            });
        });
    }

    async uploadFile(options: UploadFileOptions) {
        return new Promise<void>((resolve, reject) => {
            this.connect(async conn => {
                conn.sftp((error, sftp) => {
                    if (error) {
                        conn.end();

                        reject(error);
                        return;
                    }

                    sftp.fastPut(options.localPath, options.remotePath, function(error) {
                        if (error) {
                            reject(error);
                            return;
                        }

                        conn.end();

                        resolve();
                    });
                });
            });
        });
    }

    protected connect(callback: (connection: Client) => void) {
        const conn = new Client();

        conn.on('ready', async () => callback(conn)).connect({
            host: this.host,
            port: this.port,
            username: this.user,
            password: this.pass,
        });
    }
}

async function command(connection: Client, options: CommandOptions) {
    return new Promise<CommandResult>((resolve, reject) => {
        let command = options.command;

        if (options.cwd) {
            command = ['cd', options.cwd, '&&', command].join(' ');
        }

        connection.exec(command, (error, stream) => {
            if (error) {
                reject(error);

                connection.end();

                return;
            }

            let bufferStdout = Buffer.alloc(0);
            let bufferStderr = Buffer.alloc(0);

            stream.on('data', (chunk: any) => {
                if (!(chunk instanceof Buffer)) {
                    throw new Error('Buffer is expected.');
                }

                bufferStdout = Buffer.concat([bufferStdout, chunk]);
            });

            stream.stderr.on('data', (chunk) => {
                if (!(chunk instanceof Buffer)) {
                    throw new Error('Buffer is expected.');
                }

                bufferStderr = Buffer.concat([bufferStderr, chunk]);
            });

            stream.on('close', (code: number) => {
                resolve({
                    code,
                    stdout: bufferStdout.toString(),
                    stderr: bufferStderr.toString(),
                });
            });
        });
    });
}