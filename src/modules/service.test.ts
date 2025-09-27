import {expect, it} from "vitest";
import {prepareHost} from "../testing";
import {serviceRestart} from "./service";

const createHost = prepareHost();

it('should successfully restart the service', async () => {
    const host = createHost();
    await host.command({command: 'apt-get install -y nginx'});
    const result = await serviceRestart(host, {name: 'nginx'});

    expect(false).toBe(result.failed);
}, 60 * 1000);