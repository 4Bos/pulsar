import {Result} from "./modules/apt";

export async function task(name: string, taskObject: Promise<Result>) {
    const result = await taskObject;

    console.log(name);

    return result;
}