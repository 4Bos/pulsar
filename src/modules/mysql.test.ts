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

it('should create database with specified encoding', async () => {
    const dbName = 'db_with_encoding';
    const host = createHost();
    const result = await mysql.createDatabase(host, {name: dbName, encoding: 'utf8mb4'});

    // Assert
    expect(false).toBe(result.failed);

    const query = 'SELECT DEFAULT_CHARACTER_SET_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = \'' + dbName + '\';';
    const commandResult =  await host.command({command: 'mysql -N -e ' + singleQuotedStr(query)});

    expect(0).toBe(commandResult.code);
    expect('utf8mb4', commandResult.stdout.trim());
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

describe('grantPrivilege method', () => {
    it('should successfully grand specified privilege', async () => {
        const host = createHost();

        await mysql.createDatabase(host, 'test');
        await mysql.createUser(host, {
            username: 'test',
            password: '123456',
            host: '%',
        });

        const result = await mysql.grantPrivilege(host, {
            user: '\'test\'@\'%\'',
            type: 'ALL PRIVILEGES',
            level: 'test.*',
        });

        expect(false).toBe(result.failed);
    }, 60 * 1000);
});