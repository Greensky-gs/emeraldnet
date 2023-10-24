import { Connection } from 'mysql';
import { PermLevel, appOptions, emeraldUser, loginCallback, pathLike, permComparation, permComparationMethods, updateUser, userConnectionAllowed, userManagersOptions } from './dist/typings/classes'
import { Colors, permResolvable, queryFunction, routeLike } from './dist/typings/core';

export class EmeraldUsersManager {
    constructor(options: userManagersOptions, database: queryFunction)

    /**
     * Get all the users
     */
    public get users(): EmeraldUser[]

    /**
     * Get a user by its id
     * @param id Id of the user
     */
    public getUser(id: string): EmeraldUser | null;
    /**
     * Get the user by its login
     * @param login Name of the user
     */
    public getUserByLogin(login: string): EmeraldUser | null
    public hasUser(id: string): boolean;
    public comparePerm<M extends permComparationMethods = 'boolean'>(perm: permResolvable, to: permResolvable, method?: M): permComparation<M>;

    public createUser(options: { login: string; password: string; perm: PermLevel }): boolean | EmeraldUser;
    public deleteUser(id: string): boolean;
    public updateUser(update: updateUser): boolean;

    public hash(input: string): string;
    public allow(userId: string, ip: string): false | void;
    public disallow(userId: string, ip: string): false | void;
}
export class Emeralderror extends Error {
    constructor(error: string);

    public throw(): void;
}
export class EmeraldUser {
    constructor(datas: emeraldUser, manager: EmeraldUsersManager);

    public get manager(): EmeraldUsersManager;
    public get login(): string;
    public get password(): string;
    public get perm(): PermLevel;
    public get id(): string;
    public get allowedOn(): userConnectionAllowed[];
    public toJSON(): emeraldUser

    public cleanConnections(): [userConnectionAllowed[], userConnectionAllowed[]];
    public allow(ip: string): void
    public disallow(ip: string): void;
    public match(input: string): boolean;
}
export class EmeraldApp {
    constructor(options: appOptions);

    public get app(): Express.Application;
    public get database(): Connection;
    public get users(): EmeraldUsersManager;

    public loginEndpoint(route: routeLike, callback: loginCallback): this;
    public statics(...folders: pathLike[]): this;
    public log(text: string, color?: Colors | keyof typeof Colors): void;

    public start(): void;
}