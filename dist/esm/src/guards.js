export const isPlainObject = (x) => {
    if (x === null || typeof x === "undefined")
        return false;
    if (Array.isArray(x))
        return false;
    if (x instanceof Date)
        return false;
    return Object.getPrototypeOf(x) === Object.prototype;
};
const hasKey = (x, key) => {
    if (typeof x === "undefined" || x === null)
        return false;
    try {
        if (Object.hasOwn(x, key))
            return true;
    }
    catch { }
    try {
        if (typeof x === "object" && x !== null && key in x)
            return true;
    }
    catch { }
    try {
        if (Object.keys(x).includes(key))
            return true;
    }
    catch { }
    return false;
};
export function has(x, ...keys) {
    if (typeof x === "undefined" || x === null)
        return false;
    return keys.every((k) => hasKey(x, k));
}
//# sourceMappingURL=guards.js.map