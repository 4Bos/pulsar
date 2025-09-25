import {afterAll, beforeAll, expect, it} from 'vitest'
import {GenericContainer, StartedTestContainer, Wait} from "testcontainers";
import {RemoteHost} from "./remote-host";

let startedContainer: StartedTestContainer | null = null;

beforeAll(async () => {
    const container = await GenericContainer
        .fromDockerfile(__dirname + '/../../docker')
        .withCache(true)
        .build();

    startedContainer = await container
        .withExposedPorts(22)
        .withWaitStrategy(Wait.forListeningPorts())
        .start();
}, 5 * 60 * 1000);

afterAll(async () => {
    await startedContainer?.stop();
});

function createRemoteHost() {
    return new RemoteHost('127.0.0.1', startedContainer?.getMappedPort(22) || 8000, 'root', '123456');
}

it('should execute successful command and return correct output', async () => {
    const remote = createRemoteHost();
    const result = await remote.command({
        command: 'cat /test/text',
    });

    expect(0).toBe(result.code);
    expect('Pulsar here').toBe(result.stdout);
    expect('').toBe(result.stderr);
});

it('should execute command in specified working directory', async () => {
    const remote = createRemoteHost();
    const result = await remote.command({
        command: 'cat text',
        cwd: '/test',
    });

    expect(0).toBe(result.code);
    expect('Pulsar here').toBe(result.stdout);
    expect('').toBe(result.stderr);
});

it('should handle failed command execution correctly', async () => {
    const remote = createRemoteHost();
    const result = await remote.command({
        command: 'echo -n "Error" 1>&2 && false',
    });

    expect(1).toBe(result.code);
    expect('').toBe(result.stdout);
    expect('Error').toBe(result.stderr);
});
