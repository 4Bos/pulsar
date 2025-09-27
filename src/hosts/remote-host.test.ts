import {describe, expect, it} from 'vitest'
import {prepareHost} from "../testing";

const createHost = prepareHost();

it('should execute successful command and return correct output', async () => {
    const remote = createHost();
    const result = await remote.command({
        command: 'cat /test/text',
    });

    expect(0).toBe(result.code);
    expect('Pulsar here').toBe(result.stdout);
    expect('').toBe(result.stderr);
});

it('should execute command in specified working directory', async () => {
    const remote = createHost();
    const result = await remote.command({
        command: 'cat text',
        cwd: '/test',
    });

    expect(0).toBe(result.code);
    expect('Pulsar here').toBe(result.stdout);
    expect('').toBe(result.stderr);
});

it('should handle failed command execution correctly', async () => {
    const remote = createHost();
    const result = await remote.command({
        command: 'echo -n "Error" 1>&2 && false',
    });

    expect(1).toBe(result.code);
    expect('').toBe(result.stdout);
    expect('Error').toBe(result.stderr);
});

describe('uploadFile method', () => {
    it('should successfully upload file', async () => {
        const remote = createHost();

        await remote.uploadFile({
            localPath: __dirname + '/../../.gitignore',
            remotePath: '/tmp/test-file',
        });

        const result = await remote.command({
            command: 'test -f /tmp/test-file',
        });

        expect(0).toBe(result.code);
    });
});
