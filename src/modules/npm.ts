import {Host} from "../hosts/host";
import {singleQuotedStr} from "../bash";
import {TaskResult} from "../task";

export interface InstallPackageOptions {
    name: string;
    version?: string;
}

export const npm = {
    installPackage: async (host: Host, nameOrOptions: InstallPackageOptions|string): Promise<TaskResult> => {
        let packageSpec = typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name;

        if (typeof nameOrOptions !== 'string' && nameOrOptions.version) {
            packageSpec += '@' + nameOrOptions.version;
        }
        
        const result = await host.command({command: 'npm install ' + singleQuotedStr(packageSpec)});

        return {
            changed: result.code === 0,
            failed: result.code !== 0,
        };
    },
};