interface ObjectNumberToNumberSet {
    [key: number]: Set<number>;
}

interface ObjectStringToAny {
    [key: string]: any;
    prototype: object;
    new: object;
}

interface ObjectStringToNumberSet {
    [key: string]: Set<number>;
}