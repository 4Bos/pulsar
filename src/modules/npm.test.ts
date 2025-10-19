import {expect, it, describe} from "vitest";
import {prepareHost} from "../testing";
import {npm} from "./npm";

const createHost = prepareHost('4bos/pulsar:npm-0.1');

describe('installPackage method', () => {
    it('should successfully install the package', async () => {
        const host = createHost();
        const result = await npm.installPackage(host, 'gulp');
    
        expect(true).toBe(result.changed);
        expect(false).toBe(result.failed);
    }, 60 * 1000);

    it('should install specified version', async () => {
        const host = createHost();
        await host.command({command: 'mkdir -p /apps/test3'});
        const result = await npm.installPackage(host, {
            name: 'gulp',
            version: '4.0.0',
            path: '/apps/test3',
        });
    
        expect(true).toBe(result.changed);
        expect(false).toBe(result.failed);
        
        const getInstalledVersion = await host.command({command: 'cd /apps/test3 && npm list --depth=0 gulp | grep gulp'});
        expect(true).toBe(/(\W|^)gulp@4\.0\.0(\W|$)/.test(getInstalledVersion.stdout));
    }, 60 * 1000);

    it('should install global package', async () => {
        const host = createHost();
        const result = await npm.installPackage(host, {
            name: 'gulp',
            global: true,
        });
    
        expect(true).toBe(result.changed);
        expect(false).toBe(result.failed);
        
        const checkInstallationResult = await host.command({command: 'npm -g list --depth=0 gulp | grep gulp'});
        expect(true).toBe(/(\W|^)gulp@/.test(checkInstallationResult.stdout));
    }, 60 * 1000);

    it('should install the package in the specified path', async () => {
        const host = createHost();
        await host.command({command: 'mkdir -p /apps/test'});

        const result = await npm.installPackage(host, {name: 'gulp', path: '/apps/test'});
    
        expect(true).toBe(result.changed);
        expect(false).toBe(result.failed);
        
        const checkInstallationResult = await host.command({command: 'cd /apps/test && npm list --depth=0 gulp | grep gulp'});
        expect(true).toBe(/(\W|^)gulp@/.test(checkInstallationResult.stdout));
    }, 60 * 1000);

    it('should return the idempotency flag value as false if the package is already installed', async () => {
        const host = createHost();
        await host.command({command: 'mkdir -p /apps/test2'});

        const result1 = await npm.installPackage(host, {
            name: 'gulp',
            version: '4.0.0',
            path: '/apps/test2',
        });

        expect(true).toBe(result1.changed);
        expect(false).toBe(result1.failed);

        const result2 = await npm.installPackage(host, {
            name: 'gulp',
            version: '4.0.0',
            path: '/apps/test2',
        });

        expect(false).toBe(result2.changed);
        expect(false).toBe(result2.failed);
    }, 60 * 1000);
});

