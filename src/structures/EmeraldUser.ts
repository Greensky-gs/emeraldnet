import { emeraldUser } from '../typings/classes';
import { EmeraldUsersManager } from '../managers/EmeraldUsersManager';

export class EmeraldUser {
	private data: emeraldUser;
	private _manager: EmeraldUsersManager;

	constructor(datas: emeraldUser, manager: EmeraldUsersManager) {
		this.data = datas;
		this._manager = manager;
	}

	public get manager() {
		return this._manager;
	}
	public get login() {
		return this.data.login;
	}
	public get password() {
		return this.data.password;
	}
	public get perm() {
		return this.data.perm;
	}
	public get id() {
		return this.data.id;
	}
	public get allowedOn() {
		return this.data.allowedOn
	}
	public toJSON() {
		return {
			...this.data
		}
	}

	public cleanConnections() {
		const now = Date.now()
		const valid = this.allowedOn.filter(x => now - x.date < 86400000)
		const invalid = this.allowedOn.filter(x => now - x.date >= 86400000)

		this.data.allowedOn = valid

		return [valid, invalid]
	}
	public allowed(ip: string) {
		return this.data.allowedOn.some(x => x.ip === ip);
	}
	public allow(ip: string) {
		if (!this.allowedOn.find(x => x.ip === ip)) {
			this.data.allowedOn.push({
				ip,
				date: Date.now()
			})
		}  else {
			this.data.allowedOn = this.data.allowedOn.map(x => x.ip === ip ? ({ ...x, date: Date.now() }) : x)
		}
	}
	public disallow(ip: string) {
		this.data.allowedOn = this.data.allowedOn.filter(x => x.ip !== ip)
	}
	public match(input: string) {
		return this.password === this._manager.hash(input);
	}
}
