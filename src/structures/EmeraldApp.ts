import { appOptions, loginCallback, pathLike } from '../typings/classes';
import express from 'express';
import {
	Colors,
	DefaultQueryResult,
	QueryResult,
	routeLike,
} from '../typings/core';
import { EmeraldError } from './EmeraldError';
import bodyParser from 'body-parser';
import requestIp from 'request-ip';
import cors from 'cors';
import { Connection, createConnection } from 'mysql';
import { EmeraldUsersManager } from '../managers/EmeraldUsersManager';

export class EmeraldApp {
	private options: appOptions;
	private _app: express.Application;
	private _database: Connection;
	private _users: EmeraldUsersManager;

	constructor(options: appOptions) {
		this.options = options;
		this.connect();

		this._users = new EmeraldUsersManager(
			{
				hash: this.options.hashAlgorithm ?? 'sha512',
				application: this,
			},
			(query: string) => {
				return this.query(query);
			},
		);

		if (!this.options.port) {
			throw new EmeraldError('No port specified');
		}
		this._app = express();
		this.configs();
	}

	public get app() {
		return this._app;
	}
	public get database() {
		return this._database;
	}
	public get users() {
		return this._users;
	}

	public getConnection(ip: string) {
		const users = this._users.users
			.filter((x) => x.allowed(ip))
			.sort(
				(a, b) =>
					b.allowedOn.find((x) => x.ip === ip).date -
					a.allowedOn.find((x) => x.ip === ip).date,
			);
		if (!users.length) return;

		return users[0];
	}
	public loginEndpoint(route: routeLike, callback: loginCallback) {
		this._app.post(route, (req, res) => {
			const usernameParam = this.options.loginParams?.login ?? 'login';
			const passwordParam =
				this.options.loginParams?.password ?? 'password';

			const username = req.body[usernameParam];
			const password = req.body[passwordParam];

			if (!username || !password)
				return callback(req, res, 'no parameters');
			const result = this.login(username, password, req.clientIp);

			callback(req, res, result);
		});

		return this;
	}
	public login(login: string, password: string, ip: string) {
		const user = this._users.getUserByLogin(login);
		if (!user) return 'no user';
		if (!user.match(password)) return 'invalid password';

		this._users.allow(user.id, ip);
		return 'logged';
	}
	public statics(...folders: pathLike[]) {
		for (const folder of folders) {
			this._app.use(express.static(folder));
			this.log(`Using ${folder} as static`, 'Info');
		}
		return this;
	}

	public log(text: string, color?: Colors | keyof typeof Colors) {
		if (this.options.logs) {
			if (color) {
				if (!/\d+/.test(color))
					color = Colors[color as keyof typeof Colors];

				console.log(`\x1b[${color}m${text}\x1b[0m`);
			} else {
				console.log(text);
			}
		}
	}
	public start() {
		this._app.listen(this.options.port, () => {
			this.log(`App running on port ${this.options.port}`, 'Good');
		});
	}

	private configs() {
		this._app.use(
			cors({
				origin: `http://127.0.0.1:${this.options.port}`,
				optionsSuccessStatus: 200,
			}),
		);
		this._app.use(requestIp.mw());
		this._app.use(bodyParser.urlencoded({ extended: true }));
		this._app.use(bodyParser.json());
	}
	private query<T = DefaultQueryResult>(
		query: string,
	): Promise<QueryResult<T>> {
		return new Promise((resolve, reject) => {
			this._database.query(query, (error, request) => {
				if (error) return reject(error);
				resolve(request);
			});
		});
	}
	private connect() {
		this._database = createConnection(this.options.mysql);
		if (!this._database) {
			throw new EmeraldError('Invalid database');
		}

		this._database.connect((err) => {
			if (err) throw err;
		});
	}
}
