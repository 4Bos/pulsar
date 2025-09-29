export function singleQuotedStr(str: string): string {
    return '\'' + str.replace(/'/g, '\'"\'"\'') + '\'';
}