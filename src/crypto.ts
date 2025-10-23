
import * as crypto from "node:crypto";
import * as fs from "node:fs";

export async function sha256string(content: string): Promise<string> {
    return crypto.createHash('sha256')
        .update(content)
        .digest('hex');
}

export async function sha256file(filename: string): Promise<string> {
    const stream = fs.createReadStream(filename);

    let data = '';
    for await (const chunk of stream) {
        data += chunk;
    }

    return crypto.createHash('sha256')
        .update(data)
        .digest('hex');
}