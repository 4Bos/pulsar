import {Host} from "../hosts/host";

export interface Result {
    failed: boolean;
}

export const mysql = {
    createDatabase: async (host: Host, name: string): Promise<Result> => {
        const result = await host.command({command: 'mysql -e \'CREATE DATABASE ' + name + ';\''});

        return {
            failed: result.code !== 0,
        };
    },
};