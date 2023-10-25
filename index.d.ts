import { Connection } from 'mysql';
import {
	PermLevel,
	appOptions,
	emeraldUser,
	loginCallback,
	pathLike,
	permComparation,
	permComparationMethods,
	updateUser,
	userConnectionAllowed,
	userManagersOptions,
} from './dist/typings/classes';
import {
	Colors,
	permResolvable,
	queryFunction,
	routeLike,
} from './dist/typings/core';
import express from 'express';

export class EmeraldUsersManager {
	constructor(options: userManagersOptions, database: queryFunction);

	/**
	 * Get all the users
	 */
	public get users(): EmeraldUser[];

	/**
	 * Get a user by its id
	 *
	 * @param id Id of the user
	 * @returns {EmeraldUser | null} The user
	 */
	public getUser(id: string): EmeraldUser | null;
	/**
	 * Get the user by its login
	 *
	 * @param login Name of the user
	 * @returns {EmeraldUser | null} the user
	 */
	public getUserByLogin(login: string): EmeraldUser | null;
	/**
	 * Returns wether or not a user exists by its id
	 *
	 * @param id Id of the user
	 * @returns {boolean} if user exists
	 */
	public hasUser(id: string): boolean;
	/**
	 * Compare a perm to anonther
	 *
	 * @param perm permResolvable Perm to compare
	 * @param to permResolvable Reference
	 * @param method 'boolean' | 'string' Method of comparaison
	 * @returns {permComparation} The result of the comparation
	 */
	public comparePerm<M extends permComparationMethods = 'boolean'>(
		perm: permResolvable,
		to: permResolvable,
		method?: M,
	): permComparation<M>;

	/**
	 * Create a user with the options
	 *
	 * @param options Options of creation : login, password and permissions
	 * @returns {false | EmeraldUser} Returns false if user is not created and the user if its created
	 */
	public createUser(options: {
		login: string;
		password: string;
		perm: permResolvable;
	}): false | EmeraldUser;
	/**
	 * Delete an user using its ID
	 *
	 * @param id Id of the user
	 * @returns {boolean} if user has been created
	 */
	public deleteUser(id: string): boolean;
	/**
	 * Update an user
	 *
	 * @param update Datas to update
	 * @returns {boolean} if user has been updated
	 */
	public updateUser(update: updateUser): boolean;

	/**
	 * Hash something using the password hashing method
	 *
	 * @param input Something to hash
	 * @returns {string} Hashed string
	 */
	public hash(input: string): string;
	/**
	 * Allow a user on an ip
	 *
	 * @param userId Id of the user
	 * @param ip Ip to allow on
	 * @returns {false | void} Result of the allowing
	 */
	public allow(userId: string, ip: string): false | void;
	/**
	 * Disallow a user on an ip
	 *
	 * @param userId ID of the user
	 * @param ip Ip to disallow on
	 * @returns {false | void} Retuls of the disallow
	 */
	public disallow(userId: string, ip: string): false | void;
}
export class Emeralderror extends Error {
    /**
     * Create an Emerald Error
     * 
     * @param error Error to show
     */
	constructor(error: string);

    /**
     * Throw the error
     * 
     * @returns {void}
     */
	public throw(): void;
}
export class EmeraldUser {
	/**
	 * Create a new user
	 *
	 * @param datas Datas of the user
	 * @param manager manager of the user
	 */
	constructor(datas: emeraldUser, manager: EmeraldUsersManager);

	/**
	 * Get the manager
	 *
	 * @returns {EmeraldUsersManager}
	 */
	public get manager(): EmeraldUsersManager;
	/**
	 * Get the login of the user
	 *
	 * @returns {string}
	 */
	public get login(): string;
	/**
	 * Get the password (hashed) of the user
	 *
	 * @returns {string}
	 */
	public get password(): string;
	/**
	 * Get the permission of the user
	 *
	 * @returns {PermLevel}
	 */
	public get perm(): PermLevel;
	/**
	 * Get the identifier of the user
	 *
	 * @returns {string}
	 */
	public get id(): string;
	/**
	 * Get all the connections where the user is allowed
	 *
	 * @returns {userConnectionAllowed[]}
	 */
	public get allowedOn(): userConnectionAllowed[];
	/**
	 * Returns user as a json format
	 *
	 * @returns {emeraldUser}
	 */
	public toJSON(): emeraldUser;

	/**
	 * Remove all the connections of the last day
	 *
	 * @returns {[userConnectionAllowed[], userConnectionAllowed[]]} array containing the valid ips and the invalid ips
	 */
	public cleanConnections(): [
		userConnectionAllowed[],
		userConnectionAllowed[],
	];
	/**
	 * Allow a user on an ip
	 *
	 * @param ip Ip to allow the user on
	 * @returns {void}
	 */
	public allow(ip: string): void;
	/**
	 * Disallow a user from an ip
	 *
	 * @param ip Ip to disallow on
	 * @returns {void}
	 */
	public disallow(ip: string): void;
	/**
	 * Test if an inputs matches the user's password
	 *
	 * @param input Password to test
	 * @returns {boolean} if the input matches
	 */
	public match(input: string): boolean;
}
export class EmeraldApp {
	/**
	 * Create an Emerald application
	 *
	 * ```js
	 * const { EmeraldApp } = require('emerald.net');
	 *
	 * const app = new EmeraldApp({
	 *     port: '8081',
	 *     mysql: {
	 *         user: 'greensky',
	 *         database: 'greensky_api',
	 *         password: '1234',
	 *         host: '127.0.0.1'
	 *     },
	 *     logs: true
	 * });
	 *
	 * app.loginEndpoint('/login', (req, res, reason) => {
	 *     res.send({
	 *         ok: reason === 'logged',
	 *         reason
	 *     });
	 * });
	 *
	 * app.app.get('/dashboard', (req, res) => {
	 *     const user = app.getConnection(req.clientIp);
	 *
	 *     if (!user) return res.sendFile('./contents/unallowed.html', { root: process.cwd() + '/dist' });
	 *
	 *     return res.sendFile('./contents/dashboard.html', { root: process.cwd() + '/dist' });
	 * });
	 *
	 * app.statics('public', 'assets');
	 *
	 * app.start();
	 * ```
	 *
	 * ### Important
	 *
	 * Call the `start()` method at the end, once you declared all the routes you need
	 *
	 * @param options Options of the application
	 */
	constructor(options: appOptions);

	/**
	 * Get the express application
	 *
	 * @returns {express.Application} the application
	 */
	public get app(): express.Application;
	/**
	 * Get the mysql connection to your database
	 *
	 * @returns {Connection} the database
	 */
	public get database(): Connection;
	/**
	 * Get the users manager
	 *
	 * @returns {EmeraldUsersManager}
	 */
	public get users(): EmeraldUsersManager;

	/**
	 * Create a login endpoint to your application
	 *
	 * @param route route to the endpoint
	 * @param callback Callback when a request is made
	 * @returns {this}
	 */
	public loginEndpoint(route: routeLike, callback: loginCallback): this;
	/**
	 * Publish all the static files
	 *
	 * @param folders All the folders you want to use as statics
	 * @returns {this}
	 */
	public statics(...folders: pathLike[]): this;
	/**
	 * Log something if the log option is enabled
	 *
	 * @param text Text to log
	 * @param color Color of the log (optional)
	 * @returns {void}
	 */
	public log(text: string, color?: Colors | keyof typeof Colors): void;
	/**
	 * Get the user corresponding to the ip connection
	 *
	 * @param ip Ip to get the cnnection
	 * @returns {EmeraldUser | undefined}
	 */
	public getConnection(ip: string): EmeraldUser | undefined;

	/**
	 * Start the application
	 *
	 * Use it only once and once you have declared everything you need
	 *
	 * @returns {void}
	 */
	public start(): void;
}

export {
	Colors,
	permResolvable,
	DefaultQueryResult,
	QueryResult,
	queryFunction,
	If,
	routeLike,
} from './dist/typings/core';
export {
	pathLike,
	appOptions,
	PermLevel,
	userConnectionAllowed,
	emeraldUser,
	updateUser,
	userManagersOptions,
	hashAlgorithm,
	permComparation,
	permComparationMethods,
	permComparator,
	loginCallback,
	loginReason,
} from './dist/typings/classes';
