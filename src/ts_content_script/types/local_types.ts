interface StringToArrayNumSet {
    [key: string]: Set<number>;
}

interface ObjectKeyToAny {
    [key: string]: any;
    prototype: object;
    new: object;
}

namespace Types {

    /* Returns an object that will return an empty Set for undefined values. */
    export function newDefaultStringToArrayNumSet(): StringToArrayNumSet {
        const handler = {
            get: (target: StringToArrayNumSet, name: string) => {
                return target.hasOwnProperty(name) ? target[name] : new Set()
            }
        }
        return new Proxy({}, handler);
    }
}
