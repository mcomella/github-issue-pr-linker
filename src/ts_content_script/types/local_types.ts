interface StringToArrayNumIndex {
    [key: string]: number[];
}

namespace Types {

    /* Returns an object that will return [] for undefined values. */
    export function newDefaultStringToArrayNumObject(): StringToArrayNumIndex {
        const handler = {
            get: (target: StringToArrayNumIndex, name: string) => {
                return target.hasOwnProperty(name) ? target[name] : [];
            }
        }
        return new Proxy({}, handler);
    }
}
