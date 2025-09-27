import {expect, it} from "vitest";
import {prepareHost} from "../testing";
import {mysql} from "./mysql";

const createHost = prepareHost();

it('should successfully create the database', async () => {
    const host = createHost();
    await host.command({command: 'apt-get install -y mysql-server && service mysql start'});
    const result = await mysql.createDatabase(host, 'test');

    expect(false).toBe(result.failed);
}, 60 * 1000);

it('should return an error if the database being created already exists', async () => {
    const host = createHost();
    await host.command({command: 'apt-get install -y mysql-server && service mysql start'});
    await mysql.createDatabase(host, 'test');
    const result = await mysql.createDatabase(host, 'test');

    expect(true).toBe(result.failed);
}, 60 * 1000);