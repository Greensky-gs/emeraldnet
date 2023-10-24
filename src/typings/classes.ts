import { Request, Response } from "express";
import { EmeraldApp } from "../structures/EmeraldApp";
import { If, permResolvable } from "./core";

export type pathLike = `./${string}`;
export type appOptions = {
	port: string;
	mysql: {
		user: string;
		password: string;
		database: string;
		host: string;
	}
	logs?: boolean;
	hashAlgorithm?: hashAlgorithm;
	loginParams?: {
		login?: string;
		password?: string;
	}
};
export enum PermLevel {
	Root = 0,
	Admin = 1,
	Mod = 2,
	Visitor = 3,
}
export type userConnectionAllowed = {
	ip: string;
	date: number;
}
export type emeraldUser<Raw extends boolean = false> = {
	login: string;
	password: string;
	perm: PermLevel;
	id: string;
	allowedOn: If<Raw, string, userConnectionAllowed[]>;
};
export type updateUser = Omit<{
	[K in keyof emeraldUser]?: emeraldUser[K]
}, 'allowedOn'> & {
	id: string;
}
export type userManagersOptions = {
	hash: hashAlgorithm;
	application: EmeraldApp;
};
export type hashAlgorithm =
	| 'DSA'
	| 'DSA-SHA'
	| 'DSA-SHA1'
	| 'DSA-SHA1-old'
	| 'RSA-MD4'
	| 'RSA-MD5'
	| 'RSA-MDC2'
	| 'RSA-RIPEMD160'
	| 'RSA-SHA'
	| 'RSA-SHA1'
	| 'RSA-SHA1-2'
	| 'RSA-SHA224'
	| 'RSA-SHA256'
	| 'RSA-SHA384'
	| 'RSA-SHA512'
	| 'dsaEncryption'
	| 'dsaWithSHA'
	| 'dsaWithSHA1'
	| 'dss1'
	| 'ecdsa-with-SHA1'
	| 'md4'
	| 'md4WithRSAEncryption'
	| 'md5'
	| 'md5WithRSAEncryption'
	| 'mdc2'
	| 'mdc2WithRSA'
	| 'ripemd'
	| 'ripemd160'
	| 'ripemd160WithRSA'
	| 'rmd160'
	| 'sha'
	| 'sha1'
	| 'sha1WithRSAEncryption'
	| 'sha224'
	| 'sha224WithRSAEncryption'
	| 'sha256'
	| 'sha256WithRSAEncryption'
	| 'sha384'
	| 'sha384WithRSAEncryption'
	| 'sha512'
	| 'sha512WithRSAEncryption'
	| 'shaWithRSAEncryption'
	| 'ssl2-md5'
	| 'ssl3-md5'
	| 'ssl3-sha1'
	| 'whirlpool';
export type permComparationMethods = 'string' | 'boolean'
export type permComparation<T extends permComparationMethods> = T extends 'string' ? 'superior' | 'inferior' | 'equal' : T extends 'boolean' ? boolean : never;
export type permComparator = <T extends permComparationMethods = 'boolean'>(perm: permResolvable, to: permResolvable, method?: T) => permComparation<T>;
export type loginReason = 'no parameters' | 'no user' | 'invalid password' | 'logged'
export type loginCallback = (request: Request, response: Response, reason: loginReason) => unknown