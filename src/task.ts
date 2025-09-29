export interface TaskResult {
    failed: boolean;
    error?: string;
}

export async function task(name: string, taskObject: Promise<TaskResult>) {
    const start = process.hrtime.bigint();
    const getElapsedTime = () => {
        const current = process.hrtime.bigint();
        const elapsed = Number((current - start) / BigInt(10**6));

        if (elapsed > 1000) {
            return (elapsed / 1000).toFixed(2) + 's';
        }

        return elapsed + 'ms';
    };

    process.stdout.write('[ ] ' + name + ' (' + getElapsedTime() + ')');

    const interval = setInterval(() => {
        process.stdout.write('\r[ ] ' + name + ' (' + getElapsedTime() + ')');
    }, 50);

    const result = await taskObject;

    clearInterval(interval);

    if (result.failed) {
        process.stdout.write('\r\x1b[1;31m[ ] ' + name + '\x1b[0m (' + getElapsedTime() + ')\n');
    } else {
        process.stdout.write('\r\x1b[1;32m[x] ' + name + '\x1b[0m (' + getElapsedTime() + ')\n');
    }

    return result;
}