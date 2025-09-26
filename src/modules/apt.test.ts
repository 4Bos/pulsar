import {expect, it} from "vitest";
import {aptInstall} from "./apt";
import {prepareHost} from "../testing";

const createHost = prepareHost();

it('should successfully install the package', async () => {
    const host = createHost();
    const result = await aptInstall(host, {packages: ['git']});

    expect(false).toBe(result.failed);
}, 60 * 1000);

it('should return the correct result if we try to install a non-existent package', async () => {
    const host = createHost();
    const result = await aptInstall(host, {packages: ['non-existent-package']});

    expect(true).toBe(result.failed);
}, 60 * 1000);