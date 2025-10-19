import {Host} from "../hosts/host";
import {singleQuotedStr} from "../bash";
import {TaskResult} from "../task";

export interface InstallPackageOptions {
    name: string;
    path?: string;
    version?: string;
    global?: boolean;
}

export const npm = {
    installPackage: async (host: Host, nameOrOptions: InstallPackageOptions|string): Promise<TaskResult> => {
        const options = typeof nameOrOptions === 'string' ? {name: nameOrOptions} : nameOrOptions;
        let packageSpec = options.name;

        if (options.version) {
            packageSpec += '@' + options.version;
        }

        if (await checkIfPackageInstalled(host, options)) {
            return {
                changed: false,
                failed: false,
            };
        }

        const result = await exec(host, 'install ' + singleQuotedStr(packageSpec), options);

        return {
            changed: result.code === 0,
            failed: result.code !== 0,
        };
    },
};

async function exec(host: Host, command: string, options: InstallPackageOptions) {
    let packageSpec = options.name;
    let globalFlag = '';
    let cd = '';

    if (options.version) {
        packageSpec += '@' + options.version;
    }

    if (options.global) {
        globalFlag += ' -g'
    }

    if (options.path) {
        cd = 'cd ' + singleQuotedStr(options.path) + ' && ';
    }

    return host.command({command: cd + 'npm' + globalFlag + ' ' + command});
}

async function checkIfPackageInstalled(host: Host, options: InstallPackageOptions) {
    const result = await exec(host, 'list --json', options);
    if (result.code !== 0) {
        // TODO: throw error;
    }

    const listJson = JSON.parse(result.stdout);
    if (listJson['dependencies'] && listJson['dependencies'][options.name]) {
        return true;
    }

    return false;
}