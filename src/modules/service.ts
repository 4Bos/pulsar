import {Host} from "../hosts/host";
import {TaskResult} from "../task";

export interface Options {
    name: string;
}

export async function serviceRestart(host: Host, options: Options): Promise<TaskResult> {
    const result = await host.command({
        command: 'service ' + options.name + ' restart',
    });

    return {
        changed: result.code === 0,
        failed: result.code !== 0,
    };
}