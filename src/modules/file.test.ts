import {expect, it, describe} from "vitest";
import {prepareHost} from "../testing";
import {file} from "./file";

const createHost = prepareHost('4bos/pulsar:ssh-0.1');

describe('upload method' , () => {
    it('should successfully upload file', async () => {
        const host = createHost();
        const result = await file.upload(host, {
            localPath: __dirname + '/../../.gitignore',
            remotePath: '/tmp/.gitignore',
        });
    
        expect(true).toBe(result.changed);
        expect(false).toBe(result.failed);
    }, 60 * 1000);
    
    it('should upload file content from string', async () => {
        const host = createHost();
        const result = await file.upload(host, {
            content: 'Hello world!',
            remotePath: '/tmp/test-file3',
        });
    
        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);
    
        const catResult = await host.command({
            command: 'cat /tmp/test-file3',
        });
    
        expect(catResult.code).toBe(0);
        expect(catResult.stdout).toBe('Hello world!');
    
    }, 60 * 1000);
    
    it('should replace file if it already exists but has been modified', async () => {
        const host = createHost();
        await host.command({command: 'echo 1 > /tmp/modified_file'});
    
        const result = await file.upload(host, {
            localPath: __dirname + '/../../.gitignore',
            remotePath: '/tmp/modified_file',
        });
    
        expect(true).toBe(result.changed);
        expect(false).toBe(result.failed);
    });
    
    it('should return "changed: false" if the file was already uploaded from a local file', async () => {
        const host = createHost();
        const result = await file.upload(host, {
            localPath: __dirname + '/../../.gitignore',
            remotePath: '/tmp/already_uploaded_file',
        });
    
        expect(true).toBe(result.changed);
        expect(false).toBe(result.failed);
    
        const result2 = await file.upload(host, {
            localPath: __dirname + '/../../.gitignore',
            remotePath: '/tmp/already_uploaded_file',
        });
    
        expect(false).toBe(result2.changed);
        expect(false).toBe(result2.failed);
    }, 60 * 1000);
    
    it('should return "changed: false" if the file was already uploaded from a string', async () => {
        const host = createHost();
        const result = await file.upload(host, {
            content: 'Hello world!',
            remotePath: '/tmp/already_uploaded_file2',
        });
    
        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);
    
        const result2 = await file.upload(host, {
            content: 'Hello world!',
            remotePath: '/tmp/already_uploaded_file2',
        });
    
        expect(result2.changed).toBe(false);
        expect(result2.failed).toBe(false);
    }, 60 * 1000);
    
    it('should return an error when uploading a non-existent file', async () => {
        const host = createHost();
        const result = await file.upload(host, {
            localPath: __dirname + '/non-existent-file',
            remotePath: '/tmp/non-existent-file',
        });
    
        expect(true).toBe(result.failed);
        expect('local file does not exist').toBe(result.error);
    }, 60 * 1000);
    
    it('should return an error when uploading to a non-existent directory', async () => {
        const host = createHost();
        const result = await file.upload(host, {
            localPath: __dirname + '/../../.gitignore',
            remotePath: '/tmp/non-existent-directory/.gitignore',
        });
    
        expect(true).toBe(result.failed);
        expect('remote directory does not exist').toBe(result.error);
    }, 60 * 1000);    
});

describe('createDirectory method', () => {
    it('should successfully create directory', async () => {
        const host = createHost();

        const result = await file.createDirectory(host, '/test1');

        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);

        const testResult = await host.command({command: 'test -d /test1'});

        expect(testResult.code).toBe(0);
    }, 60 * 1000);

    it('should return an error if we try to create a directory without the recursion flag and inside a non-existent directory', async () => {
        const host = createHost();

        const result = await file.createDirectory(host, '/non-existent/test1');

        expect(result.changed).toBe(false);
        expect(result.failed).toBe(true);
        expect(result.error).toBe('parent directory does not exist');
    }, 60 * 1000);

    it('should recursively create all non-existent directories', async () => {
        const host = createHost();

        const result = await file.createDirectory(host, {
            path: '/d1/d2/d3',
            recursive: true,
        });

        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);

        const testResult = await host.command({command: 'test -d /d1/d2/d3'});

        expect(testResult.code).toBe(0);
    }, 60 * 1000);

    it('should create directory with specified mode', async () => {
        const host = createHost();

        const result = await file.createDirectory(host, {
            path: '/dir10',
            mode: '0137',
        });

        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);

        const testResult = await host.command({command: 'stat -c "%a" /dir10'});

        expect(testResult.code).toBe(0);
        expect(testResult.stdout.trim()).toBe('137');
    }, 60 * 1000);

    it('should create directory with specified group and owner', async () => {
        const host = createHost();

        const result = await file.createDirectory(host, {
            path: '/dir12',
            owner: '6000',
            group: '5000',
        });

        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);

        const testResult = await host.command({command: 'stat -c "%u %g" /dir12'});

        expect(testResult.code).toBe(0);
        expect(testResult.stdout.trim()).toBe('6000 5000');
    }, 60 * 1000);

    it('should return an error if we try to create a directory with non-existent owner', async () => {
        const host = createHost();

        const result = await file.createDirectory(host, {
            path: '/dir24',
            owner: 'unknownuser',
        });

        expect(result.changed).toBe(false);
        expect(result.failed).toBe(true);
        expect(result.error).toBe('the specified owner does not exist');
    }, 60 * 1000);

    it('should return an error if we try to create a directory with non-existent group', async () => {
        const host = createHost();

        const result = await file.createDirectory(host, {
            path: '/dir24',
            group: 'unknowgroup',
        });

        expect(result.changed).toBe(false);
        expect(result.failed).toBe(true);
        expect(result.error).toBe('the specified group does not exist');
    }, 60 * 1000);

    it('should return an error if path contains an entry that is not a directory', async () => {
        const host = createHost();
        await host.command({command: 'mkdir /dir500 && touch /dir500/file'});

        const result = await file.createDirectory(host, {
            path: '/dir500/file/dir',
            recursive: true,
        });

        expect(result.changed).toBe(false);
        expect(result.failed).toBe(true);
        expect(result.error).toBe('path contains an entry that is not a directory');
    }, 60 * 1000);

    it('should change owner and group of an existing directory', async () => {
        const host = createHost();
        await host.command({command: 'mkdir /dir777 && chown 5000:6000 /dir777'});

        const result = await file.createDirectory(host, {
            path: '/dir777',
            owner: '7000',
            group: '8000',
        });

        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);

        const testResult = await host.command({command: 'stat -c "%u %g" /dir777'});

        expect(testResult.code).toBe(0);
        expect(testResult.stdout.trim()).toBe('7000 8000');
    }, 60 * 1000);

    it('should change mode of an existing directory', async () => {
        const host = createHost();
        await host.command({command: 'mkdir /dir888 && chmod 0777 /dir888'});

        const result = await file.createDirectory(host, {
            path: '/dir888',
            mode: '1444',
        });

        expect(result.changed).toBe(true);
        expect(result.failed).toBe(false);

        const testResult = await host.command({command: 'stat -c "%a" /dir888'});

        expect(testResult.code).toBe(0);
        expect(testResult.stdout.trim()).toBe('1444');
    }, 60 * 1000);
});