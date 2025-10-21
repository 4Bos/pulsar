import {Host} from "../hosts/host";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import {TaskResult} from "../task";

export interface Options {
    localPath: string;
    remotePath: string;
}

export interface CreateDirectoryOptions {
    path: string;
    mode?: string;
    group?: string;
    owner?: string;
    recursive?: boolean;
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

    createDirectory: async (host: Host, optionsOrPath: CreateDirectoryOptions|string) => {
        const options = typeof optionsOrPath === 'string' ? {path: optionsOrPath} : optionsOrPath;

        if (!options.recursive) {
            const parentDir = path.dirname(options.path);

            if (parentDir) {
                const testDirExistResult = await host.command({command: 'test -d ' + parentDir});
                if (testDirExistResult.code !== 0) {
                    return {
                        changed: false,
                        failed: true,
                        error: 'parent directory does not exist',
                    };
                }
            }
        } else {
            let parentDir = path.dirname(options.path);

            while (parentDir && parentDir !== '/') {
                const testFileResult = await host.command({command: 'test -e ' + parentDir});
                if (testFileResult.code === 0) {
                    
                    const testDirExistResult = await host.command({command: 'test -d ' + parentDir});
                    if (testDirExistResult.code !== 0) {
                        return {
                            changed: false,
                            failed: true,
                            error: 'path contains an entry that is not a directory',
                        };
                    }
                }

                parentDir = path.dirname(parentDir);
            }
        }

        let owner = options.owner ? options.owner : '';
        let group = options.group ? ':' + options.group : '';

        if (owner && /^\D+$/.test(owner)) {
            const result = await host.command({command: 'id ' + owner});
            if (result.code !== 0) {
                return {
                    changed: false,
                    failed: true,
                    error: 'the specified owner does not exist',
                };
            }
        }

        if (group && /^\D+$/.test(group)) {
            const result = await host.command({command: 'getent group ' + group});
            if (result.code !== 0) {
                return {
                    changed: false,
                    failed: true,
                    error: 'the specified group does not exist',
                };
            }
        }

        const testFileResult = await host.command({command: 'test -e ' + options.path});
        if (testFileResult.code === 0) {
            const testFileResult = await host.command({command: 'test -d ' + options.path});
            if (testFileResult.code !== 0) {
                return {
                    changed: false,
                    failed: true,
                    error: 'the file at the specified path already exists and is not a directory',
                };
            }

            const statResult = await host.command({command: 'stat -c "%U %u %G %g %a" ' + options.path});
            if (statResult.code !== 0) {
                return {
                    changed: false,
                    failed: true,
                    error: 'unable to retrieve information about the specified directory',
                };
            }

            const parts = statResult.stdout.trim().split(' ');
            const currentMode = (parts[4].length === 3 ? '0' : '') + parts[4];
            const ownerChanged = options.owner && (/^\d+$/.test(options.owner)
                ? options.owner !== parts[1]
                : options.owner !== parts[0]);
            const groupChanged = options.group && (/^\d+$/.test(options.group)
                ? options.group !== parts[3]
                : options.group !== parts[2]
            );
            const modeChanged = options.mode && options.mode !== currentMode;

            if (ownerChanged || groupChanged) {
                const chownResult = await host.command({command: 'chown ' + owner + group + ' ' + options.path});
                if (chownResult.code !== 0) {
                    return {
                        changed: true,
                        failed: true,
                        error: 'unable to change directory owner or group',
                    };
                }
            }

            if (modeChanged) {
                const chmodResult = await host.command({command: 'chmod ' + options.mode + ' ' + options.path});
                if (chmodResult.code !== 0) {
                    return {
                        changed: true,
                        failed: true,
                        error: 'unable to change directory mode',
                    };
                }
            }

            return {
                changed: ownerChanged || groupChanged || modeChanged,
                failed: false,
            };
        } else {
            let mode = options.mode ? '-m ' + options.mode + ' ' : '';
            let recursive = options.recursive ? '-p ' : '';

            const createDirResult = await host.command({command: 'mkdir ' + mode + recursive + options.path});
            if (createDirResult.code !== 0) {
                return {
                    changed: false,
                    failed: true,
                    error: 'unable to create directory',
                };
            }

            if (owner || group) {
                const chownResult = await host.command({command: 'chown ' + owner + group + ' ' + options.path});
                if (chownResult.code !== 0) {
                    return {
                        changed: true,
                        failed: true,
                        error: 'unable to change directory owner or group',
                    };
                }
            }

            return {
                changed: true,
                failed: false,
            };
        }
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