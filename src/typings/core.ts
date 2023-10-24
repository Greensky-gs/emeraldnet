import { PermLevel } from "./classes";

export enum Colors {
    Error = '31',
    Good = '32',
    Info = '33',
    DarkBlue = '34',
    LightBlue = '96',
    Purple = '35',
    Blue = '36'
}
export type permResolvable = PermLevel | keyof typeof PermLevel
export type DefaultQueryResult = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};
export type QueryResult<T> = T extends DefaultQueryResult ? DefaultQueryResult : T[];
export type queryFunction = <T = DefaultQueryResult>(query: string) => Promise<QueryResult<T>>
export enum Tables {
    Users = 'emerald.users'
}
export type If<T extends boolean, A, B = any> = T extends true ? A : T extends false ? B : never;
export type routeLike = `/${string}`