import { PermLevel } from "../typings/classes";
import { permResolvable } from "../typings/core";

export const resolvePerm = (perm: permResolvable) => {
    if (/\d+/.test(perm.toString())) return perm
    return PermLevel[perm]
}
export const sqllise = (input: string) => input.replace(/"/g, '\\"')
export const removeKey = <T, K extends keyof T>(obj: T, key: K): Omit<T, K> => {
	const { [key]: _, ...rest } = obj;
	return rest;
};