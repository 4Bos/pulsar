import {expect, it} from "vitest";
import {aptInstall} from "./apt";
import {prepareHost} from "../testing";

const createHost = prepareHost('4bos/pulsar:ssh-0.1');

it('should successfully install the package', async () => {
    const host = createHost();
    const result = await aptInstall(host, {packages: ['git']});

    expect(true).toBe(result.changed);
    expect(false).toBe(result.failed);
}, 60 * 1000);

it('should set the "changed" flag to false if the package is already installed', async () => {
    const host = createHost();
    await host.command({command: 'apt-get install -y git'});

    const result = await aptInstall(host, {packages: ['git']});

    expect(false).toBe(result.changed);
    expect(false).toBe(result.failed);
});

it('should return the correct result if we try to install a non-existent package', async () => {
    const host = createHost();
    const result = await aptInstall(host, {packages: ['non-existent-package']});

    expect(true).toBe(result.failed);
}, 60 * 1000);