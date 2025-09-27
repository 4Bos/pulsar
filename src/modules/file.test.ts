import {expect, it} from "vitest";
import {prepareHost} from "../testing";
import {file} from "./file";

const createHost = prepareHost();

it('should successfully upload file', async () => {
    const host = createHost();
    const result = await file.upload(host, {
        localPath: __dirname + '/../../.gitignore',
        remotePath: '/tmp/.gitignore',
    });

    expect(false).toBe(result.failed);
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