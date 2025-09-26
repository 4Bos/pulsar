import {Host} from "../hosts/host";

export interface Options {
    packages: string[];
}

export interface Result {
    failed: boolean;
}

export async function aptInstall(host: Host, options: Options): Promise<Result> {
    for (let i = 0; i < options.packages.length; i++) {
        const pkg = options.packages[i];
        let result = await host.command({
            command: 'dpkg -l ' + pkg + ' | grep "^ii"',
        });

        if (result.code === 1) {
            result = await host.command({
                command: 'apt-get install -y ' + pkg,
            });

            if (result.code !== 0) {
                return {
                    failed: true,
                };
            }
        }

        result = await host.command({
            command: 'dpkg -l ' + pkg + ' | grep "^ii"',
        });

        if (result.code !== 0) {
            return {
                failed: true,
            };
        }
    }

    return {
        failed: false,
    };
}