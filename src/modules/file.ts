import {Host} from "../hosts/host";
import * as fs from "node:fs";
import * as path from "node:path";
import {TaskResult} from "../task";

export interface Options {
    localPath: string;
    remotePath: string;
}

export const file = {
    upload: async (host: Host, options: Options): Promise<TaskResult> => {
        if (!fs.existsSync(options.localPath)) {
            return {
                failed: true,
                error: 'local file does not exist',
            };
        }

        const result = await host.command({command: 'test -d ' + path.dirname(options.remotePath)});

        if (result.code !== 0) {
            return {
                failed: true,
                error: 'remote directory does not exist',
            };
        }

        await host.uploadFile(options);

        return {
            failed: false,
        };
    },
};