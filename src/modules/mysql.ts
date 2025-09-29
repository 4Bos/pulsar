import {Host} from "../hosts/host";
import {singleQuotedStr} from "../bash";

export interface Result {
    failed: boolean;
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
    createDatabase: async (host: Host, name: string): Promise<Result> => {
        const result = await host.command({command: 'mysql -e \'CREATE DATABASE ' + name + ';\''});

        return {
            failed: result.code !== 0,
        };
    },

    createUser: async (host: Host, options: CreateUserOptions): Promise<Result> => {
        const result = await host.command({
            command: 'mysql -e ' + singleQuotedStr('CREATE USER \'' + options.username + '\'@\'' + options.host + '\' IDENTIFIED BY \'' + options.password + '\';'),
        });

        return {
            failed: result.code !== 0,
        };
    },

    grantPrivilege: async (host: Host, options: GrandPrivilegeOptions): Promise<Result> => {
        const result = await host.command({
            command: 'mysql -e ' + singleQuotedStr('GRANT ' + options.type + ' ON ' + options.level + ' TO ' + options.user + ';'),
        });

        return {
            failed: result.code !== 0,
        };
    }
};