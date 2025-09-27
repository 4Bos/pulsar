import {Result} from "./modules/apt";

export async function task(name: string, taskObject: Promise<Result>) {
    process.stdout.write('[ ] ' + name);

    const result = await taskObject;

    if (result.failed) {
        process.stdout.write('\r\x1b[1;31m[ ] ' + name + '\x1b[0m\n');
    } else {
        process.stdout.write('\r\x1b[1;32m[x] ' + name + '\x1b[0m\n');
    }

    return result;
}