export class Utility {

    /**
     * Compare two objects for deep equality
     * @param a the first object
     * @param b the second object
     */
    public static isDeeplyEqual(a: object, b: object): boolean {
        if (typeof (a) !== typeof (b)) {
            return false;
        }

        if (Array.isArray(a) && Array.isArray(b)) {
            return a.length === b.length ?
                a.map((element, idx) => Utility.isDeeplyEqual(element, b[idx]))
                    .reduce((x, y) => x && y, true) :
                false;
        }

        if (typeof (a) === 'object') { // we already know typeof(a) === typeof(b)
            return Utility.isDeeplyEqual(Object.getOwnPropertyNames(a).sort(), Object.getOwnPropertyNames(b).sort()) ?
                Object.getOwnPropertyNames(a).map(prop => Utility.isDeeplyEqual(a[prop], b[prop]))
                    .reduce((x, y) => x && y, true) :
                false;
        }

        return a === b;
    }
}