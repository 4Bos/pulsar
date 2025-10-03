import {RemoteHost} from "../../src/hosts/remote-host";
import {aptInstall} from "../../src/modules/apt";
import {task} from "../../src/task";
import {serviceRestart} from "../../src/modules/service";
import {configDotenv} from "dotenv";
import {file} from "../../src/modules/file";
import {Player} from "../../src/player";

configDotenv({path: __dirname + '/.env', quiet: true});

if (typeof process.env.SERVER_HOST !== 'string') {
    throw new Error('Provide SERVER_HOST environment variable');
}
if (typeof process.env.SERVER_PORT !== 'string') {
    throw new Error('Provide SERVER_PORT environment variable');
}
if (typeof process.env.SERVER_USER !== 'string') {
    throw new Error('Provide SERVER_USER environment variable');
}
if (typeof process.env.SERVER_PASS !== 'string') {
    throw new Error('Provide SERVER_PASS environment variable');
}

const options = {
    host: process.env.SERVER_HOST,
    port: parseInt(process.env.SERVER_PORT, 10),
    user: process.env.SERVER_USER,
    pass: process.env.SERVER_PASS,
};

Player.create(async () => {
    const host = new RemoteHost(
        options.host,
        options.port,
        options.user,
        options.pass,
    );

    await task('install nginx', aptInstall(host, {packages: ['nginx']}));
    await task('upload index.html', file.upload(host, {
        localPath: __dirname + '/html/index.html',
        remotePath: '/var/www/html/index.html',
    }));
    await task('restart nginx', serviceRestart(host, {name: 'nginx'}));
}).play();