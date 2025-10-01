import {Host} from "../hosts/host";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {TaskResult} from "../task";

export interface Options {
    localPath: string;
    remotePath: string;
}

export const file = {
    upload: async (host: Host, options: Options): Promise<TaskResult> => {
        if (!fs.existsSync(options.localPath)) {
            return {
                changed: false,
                failed: true,
                error: 'local file does not exist',
            };
        }

        const testDirectoryResult = await host.command({command: 'test -d ' + path.dirname(options.remotePath)});
        if (testDirectoryResult.code !== 0) {
            return {
                changed: false,
                failed: true,
                error: 'remote directory does not exist',
            };
        }

        const testFileResult = await host.command({command: 'test -f ' + options.remotePath});
        if (testFileResult.code === 0) {
            const calcHashResult = await host.command({command: 'sha256sum ' + options.remotePath});
            const hash = calcHashResult.stdout.trim().split(/ +/)[0];

            if (calcHashResult.code === 0 && hash === await sha256(options.localPath)) {
                return {
                    changed: false,
                    failed: false,
                };
            }
        }

        await host.uploadFile(options);

        return {
            changed: true,
            failed: false,
        };
    },
};

async function sha256(filename: string): Promise<string> {
    const stream = fs.createReadStream(filename);

    let data = '';
    for await (const chunk of stream) {
        data += chunk;
    }

    return crypto.createHash('sha256')
        .update(data)
        .digest('hex');
}