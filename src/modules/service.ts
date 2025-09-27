import {Host} from "../hosts/host";

export interface Options {
    name: string;
}

export interface Result {
    failed: boolean;
}

export async function serviceRestart(host: Host, options: Options): Promise<Result> {
    const result = await host.command({
        command: 'service ' + options.name + ' restart',
    });

    return {
        failed: result.code !== 0,
    };
}