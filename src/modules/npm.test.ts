import {expect, it, describe} from "vitest";
import {prepareHost} from "../testing";
import {npm} from "./npm";

const createHost = prepareHost('4bos/pulsar:npm-0.1');

describe('installPackage method', () => {
    it('should successfully install the package', async () => {
        const host = createHost();
        const result = await npm.installPackage(host, 'gulp');
    
        expect(false).toBe(result.failed);
    }, 60 * 1000);

    it('should install specified version', async () => {
        const host = createHost();
        const result = await npm.installPackage(host, {
            name: 'gulp',
            version: '4.0.0',
        });
    
        expect(false).toBe(result.failed);
        
        const getInstalledVersion = await host.command({command: 'npm list --depth=0 gulp | grep gulp'});
        expect(true).toBe(/(\W|^)gulp@4\.0\.0(\W|$)/.test(getInstalledVersion.stdout));
    }, 60 * 1000)
});

