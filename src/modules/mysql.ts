import {Host} from "../hosts/host";
import {singleQuotedStr} from "../bash";
import {TaskResult} from "../task";

export interface CreateDatabaseOptions {
    name: string;
    encoding?: string;
}

export interface CreateUserOptions {
    username: string;
    password: string;
    host: string;
}

export interface GrandPrivilegeOptions {
    type: string;
    user: string;
    level: string;
}

export const mysql = {
    createDatabase: async (host: Host, nameOrOptions: CreateDatabaseOptions|string): Promise<TaskResult> => {
        let name = (typeof nameOrOptions === 'string') ? nameOrOptions : nameOrOptions.name;

        const result = await host.command({command: 'mysql -e \'CREATE DATABASE ' + name + ';\''});

        return {
            changed: result.code === 0,
            failed: result.code !== 0,
        };
    },

    createUser: async (host: Host, options: CreateUserOptions): Promise<TaskResult> => {
        const result = await host.command({
            command: 'mysql -e ' + singleQuotedStr('CREATE USER \'' + options.username + '\'@\'' + options.host + '\' IDENTIFIED BY \'' + options.password + '\';'),
        });

        return {
            changed: result.code === 0,
            failed: result.code !== 0,
        };
    },

    grantPrivilege: async (host: Host, options: GrandPrivilegeOptions): Promise<TaskResult> => {
        const result = await host.command({
            command: 'mysql -e ' + singleQuotedStr('GRANT ' + options.type + ' ON ' + options.level + ' TO ' + options.user + ';'),
        });

        return {
            changed: result.code === 0,
            failed: result.code !== 0,
        };
    }
};