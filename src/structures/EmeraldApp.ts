import { appOptions, loginCallback, pathLike } from "../typings/classes";
import express from 'express'
import { Colors, DefaultQueryResult, QueryResult, routeLike } from "../typings/core";
import { EmeraldError } from "./EmeraldError";
import bodyParser from "body-parser";
import requestIp from 'request-ip'
import cors from 'cors'
import { Connection, createConnection } from "mysql";
import { EmeraldUsersManager } from "../managers/EmeraldUsersManager";

export class EmeraldApp {
    private options: appOptions;
    private app: express.Application;
    private database: Connection;
    private users: EmeraldUsersManager;

    constructor(options: appOptions) {
        this.options = options
        this.connect()

        this.users = new EmeraldUsersManager({
            hash: this.options.hashAlgorithm ?? 'sha512',
            application: this
        }, this.query)

        if (!this.options.port) {
            throw new EmeraldError('No port specified')
        }
        this.app = express()
        this.configs();
    }

    public loginEndpoint(route: routeLike, callback: loginCallback) {
        this.app.post(route, (req, res) => {
            const usernameParam = this.options.loginParams?.login ?? 'login'
            const passwordParam = this.options.loginParams?.password ?? 'password'

            const username = req.body[usernameParam]
            const password = req.body[passwordParam]

            if (!username || !password) return callback(req, res, 'no parameters')
            const user = this.users.getUserByLogin(username)
            if (!user) return callback(req, res, 'no user')
            if (!user.match(password)) return callback(req, res, 'invalid password')

            this.users.allow(user.id, req.clientIp)

            callback(req, res, 'logged');
        })
    }
    public statics(...folders: pathLike[]) {
        for (const folder of folders) {
            this.app.use(express.static(folder))
            this.log(`Using ${folder} as static`, 'Info')
        }
    }

    public log(text: string, color?: Colors | keyof typeof Colors) {
        if (this.options.logs) {
            if (color) {
                if (!/\d+/.test(color)) color = Colors[color as keyof typeof Colors]

                console.log(`\x1b[${color}m${text}\x1b[0m`)
            } else {
                console.log(text)
            }
        }
    }
    public start() {
        this.app.listen(this.options.port, () => {
            this.log(`App running on port ${this.options.port}`, 'Good')
        })
    }

    private configs() {
        this.app.use(cors({
            origin: `http://127.0.0.1:${process.env.port}`,
            optionsSuccessStatus: 200,
        }))
        this.app.use(requestIp.mw())
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(bodyParser.json())
    }
    private query<T = DefaultQueryResult>(query: string): Promise<QueryResult<T>> {
        return new Promise((resolve, reject) => {
            this.database.query(query, (error, request) => {
                if (error) return reject(error)
                resolve(request)
            })
        })
    }
    private connect() {
        this.database = createConnection(this.options.mysql)
        if (!this.database) {
            throw new EmeraldError('Invalid database')
        }

        this.database.connect((err) => {
            if (err) throw err
        })
    }
}