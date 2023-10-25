import { createHash } from 'crypto';
import {
    PermLevel,
	emeraldUser,
	permComparation,
	permComparationMethods,
	updateUser,
	userManagersOptions,
} from '../typings/classes';
import { EmeraldUser } from '../structures/EmeraldUser';
import { Tables, permResolvable, queryFunction } from '../typings/core';
import { EmeraldError } from '../structures/EmeraldError';
import { v4 as uuidV4 } from 'uuid';
import { removeKey, resolvePerm, sqllise } from '../utils/toolbox';

export class EmeraldUsersManager {
	private options: userManagersOptions;
	private cache: Record<string, EmeraldUser> = {};
	private database: queryFunction;

	constructor(options: userManagersOptions, database: queryFunction) {
		this.options = options;
		this.database = database;

        this.start()
	}

	public get users() {
		return Object.values(this.cache);
	}
	public getUser(id: string): EmeraldUser | null {
		return this.cache[id];
	}
    public getUserByLogin(login: string): EmeraldUser | null {
        return this.users.find(x => x.login === login)
    }
	public hasUser(id: string) {
		return !!this.getUser(id);
	}
	public comparePerm<M extends permComparationMethods = 'boolean'>(
		perm: permResolvable,
		to: permResolvable,
		method?: M,
	): permComparation<M> {
		if (method === 'string') {
			if (perm > to) return 'inferior' as permComparation<M>;
			if (perm < to) return 'superior' as permComparation<M>;
			if (perm === to) return 'equal' as permComparation<M>;
		} else if (method === 'boolean') {
			return (perm >= to) as permComparation<M>;
		}
	}

    public createUser({ login, password, perm }: { login: string; password: string; perm: permResolvable }) {
        if (this.getUserByLogin(login)) return false
        const id = uuidV4()

        this.cache[id] = new EmeraldUser({
            login,
            password: this.hash(password),
            perm: resolvePerm(perm),
            id,
            allowedOn: []
        }, this)

        this.database(`INSERT INTO ${Tables.Users} ( id, login, password, perm, allowedOn ) VALUES ( "${id}", "${sqllise(login)}", "${this.hash(password)}", "${resolvePerm(perm)}", "[]" )`)
        return this.cache[id]
    }
    public deleteUser(id: string) {
        if (!this.hasUser(id)) return false

        delete this.cache[id]
        this.database(`DELETE FROM ${Tables.Users} WHERE id="${id}"`)

        return true
    }
    public updateUser(update: updateUser) {
        const user = this.getUser(update.id)
        if (!user) return false

        if ((update as any)?.allowedOn) delete (update as any)?.allowedOn
        if (Object.keys(update).length === 1) return false

        const changes: updateUser = { id: update.id }
        if (update.password) changes.password = this.hash(update.password)
        Object.assign(changes, removeKey(update, 'password'))
        const merged = { ...user.toJSON(), ...update }

        this.cache[user.id] = new EmeraldUser(merged, this)
        this.database(`UPDATE ${Tables.Users} SET ${Object.entries(update).map(([k, v]) => `${k}="${sqllise(v.toString())}"`).join(', ')} WHERE id="${user.id}"`)
        return true
    }
	public hash(input: string) {
		const hash = createHash(this.options.hash);

		hash.update(input);

		return hash.digest('hex');
	}
    public allow(userId: string, ip: string) {
        const user = this.getUser(userId)
        if (!user) return false

        user.allow(ip)

        this.database(`UPDATE ${Tables.Users} SET allowedOn="${sqllise(JSON.stringify(user.allowedOn))}" WHERE id="${user.id}"`)
    }
    public disallow(userId: string, ip: string) {
        const user = this.getUser(userId)
        if (!user) return false

        user.disallow(ip)

        this.database(`UPDATE ${Tables.Users} SET allowedOn="${sqllise(JSON.stringify(user.allowedOn))}" WHERE id="${user.id}"`)
    }

	private async checkDb() {
		await this.database(
			`CREATE TABLE IF NOT EXISTS ${Tables.Users} ( id VARCHAR(255) NOT NULL PRIMARY KEY, login TEXT NOT NULL, password TEXT NOT NULL, perm TEXT NOT NULL, allowedOn LONGTEXT )`,
		);
		return 'ok';
	}
	private async fillCache() {
		const datas = await this.database<emeraldUser<true>>(
			`SELECT * FROM ${Tables.Users}`,
		);
        if (!datas) throw new EmeraldError("No datas from users")

        this.cache = Object.fromEntries(datas.map((d) => [d.id, new EmeraldUser({
            ...d,
            allowedOn: JSON.parse(d.allowedOn)
        }, this)]))
    }

    private calculateNextClean() {
        const now = Date.now()
        const todayMidnight = new Date(now).setHours(0, 0, 0, 0)
        const tomorrowMidnight = new Date(todayMidnight).getTime() + 86400000

        return tomorrowMidnight - now;
    }
    private clean() {
        this.users.forEach((user) => {
            const [valid] = user.cleanConnections()

            this.database(`UPDATE ${Tables.Users} SET allowedOn="${sqllise(JSON.stringify(valid))}"`)
        })
    }
    private setClean() {
        setTimeout(() => {
            this.clean()
            this.setClean()
            this.options.application.log(`Cleaned users connections`, 'Good')
        }, this.calculateNextClean())
    }
    private async start() {
        await this.checkDb()
        await this.fillCache()

        this.setClean()
    }
}
