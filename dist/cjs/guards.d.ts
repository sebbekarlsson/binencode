export declare const isPlainObject: (x: any) => x is Record<PropertyKey, unknown>;
export type HasResult<Keys extends [string, ...string[]] | [string]> = {
    [P in keyof Keys as [Keys[P]] extends [string] ? Keys[P] : never]: unknown;
};
export declare function has<Keys extends [string, ...string[]] | [string]>(x: unknown, ...keys: Keys): x is HasResult<typeof keys>;
//# sourceMappingURL=guards.d.ts.map