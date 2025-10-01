import {expect, it} from "vitest";
import {prepareHost} from "../testing";
import {file} from "./file";

const createHost = prepareHost('4bos/pulsar:ssh-0.1');

it('should successfully upload file', async () => {
    const host = createHost();
    const result = await file.upload(host, {
        localPath: __dirname + '/../../.gitignore',
        remotePath: '/tmp/.gitignore',
    });

    expect(true).toBe(result.changed);
    expect(false).toBe(result.failed);
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

it('should return a result with the changed property set to false if the file already uploaded', async () => {
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