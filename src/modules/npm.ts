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
        let packageSpec = typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name;
        let globalFlag = '';
        let cd = '';

        if (typeof nameOrOptions !== 'string') {
            if (nameOrOptions.version) {
                packageSpec += '@' + nameOrOptions.version;
            }

            if (nameOrOptions.global) {
                globalFlag += ' -g'
            }

            if (nameOrOptions.path) {
                cd = 'cd ' + singleQuotedStr(nameOrOptions.path) + ' && ';
            }
        }

        const result = await host.command({command: cd + 'npm' + globalFlag + ' install ' + singleQuotedStr(packageSpec)});

        return {
            changed: result.code === 0,
            failed: result.code !== 0,
        };
    },
};