import {expect, it} from 'vitest'
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
