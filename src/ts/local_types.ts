interface ObjectNumberToNumber { [key: number]: number; }
interface ObjectNumberToNumberSet { [key: number]: Set<number>; }

interface ObjectStringToNumberSet { [key: string]: Set<number>; }

interface ObjectStringToAny {
    [key: string]: any;
    prototype: object;
    new: object;
}
