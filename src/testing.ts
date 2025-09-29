import {GenericContainer, StartedTestContainer, Wait} from "testcontainers";
import {afterAll, beforeAll} from "vitest";
import {RemoteHost} from "./hosts/remote-host";

export function prepareHost(image?: string) {
    let startedContainer: StartedTestContainer | null = null;

    beforeAll(async () => {
        const container = image
            ? await new GenericContainer(image)
            : await GenericContainer
                .fromDockerfile(__dirname + '/../docker')
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

    return function() {
        return new RemoteHost('127.0.0.1', startedContainer?.getMappedPort(22) || 8000, 'root', '123456');
    };
}