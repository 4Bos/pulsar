import {Host} from "../hosts/host";
import {TaskResult} from "../task";

export interface Options {
    packages: string[];
}

export async function aptInstall(host: Host, options: Options): Promise<TaskResult> {
    for (let i = 0; i < options.packages.length; i++) {
        const pkg = options.packages[i];
        let result = await host.command({
            command: 'dpkg -l ' + pkg + ' | grep "^ii"',
        });

        if (result.code === 0) {
            return {
                changed: false,
                failed: false,
            };
        }

        result = await host.command({
            command: 'apt-get install -y ' + pkg,
        });

        if (result.code !== 0) {
            return {
                changed: false,
                failed: true,
            };
        }

        result = await host.command({
            command: 'dpkg -l ' + pkg + ' | grep "^ii"',
        });

        if (result.code !== 0) {
            return {
                changed: false,
                failed: true,
            };
        }
    }

    return {
        changed: true,
        failed: false,
    };
}