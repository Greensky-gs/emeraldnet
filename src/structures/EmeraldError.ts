export class EmeraldError extends Error {
    constructor(error: string) {
        super(error)
    }

    public throw() {
        throw this;
    }
}