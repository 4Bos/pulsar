import {describe, expect, it} from "vitest";
import {prepareHost} from "../testing";
import {mysql} from "./mysql";
import {singleQuotedStr} from "../bash";

const createHost = prepareHost('4bos/pulsar:mysql-0.1');

it('should successfully create the database', async () => {
    const host = createHost();
    const result = await mysql.createDatabase(host, 'test');

    expect(false).toBe(result.failed);
}, 60 * 1000);

it('should return an error if the database being created already exists', async () => {
    const host = createHost();
    await mysql.createDatabase(host, 'test');
    const result = await mysql.createDatabase(host, 'test');

    expect(true).toBe(result.failed);
}, 60 * 1000);

describe('createUser method', () => {
    it('should successfully create the user', async () => {
        const host = createHost();
        const result = await mysql.createUser(host, {
            username: 'test',
            password: '123456',
            host: '%',
        });

        expect(false).toBe(result.failed);

        const loginResult = await host.command({command: 'mysql --user=test --password=123456 -N -e ' + singleQuotedStr('\\q')});

        expect(0).toBe(loginResult.code);
    }, 60 * 1000);
});