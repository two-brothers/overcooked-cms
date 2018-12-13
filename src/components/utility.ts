class Utility {
    /**
     * A function to duplicate an object, while replacing the specified field
     * This behaves like Object.assign but can handle nested fields
     * @param object the object to duplicate
     * @param path the (. delimited) path to the field to be replaced
     * @param replacement the value to replace in the field
     */
    public static replaceField<T>(object: object, path: string, replacement: T): any {
        const replaceFn = () => replacement;
        return Utility.applyToNestedValue(replaceFn, object, path);
    }

    /**
     * A function to duplicate an object, while appending an item to a nested array (without mutating the original object)
     * @param object the object to duplicate
     * @param path the (. delimited) path to the array
     * @param item the value to add to the array
     */
    public static appendToNestedArray<T>(object: object, path: string, item: T): any {
        const appendFn = (element: T[]) => element.concat(item);
        return Utility.applyToNestedValue(appendFn, object, path);
    }

    /**
     * A function to duplicate an object, while removing an item from a nested array (without mutating the original object)
     * @param object the object to duplicate
     * @param path the (. delimited) path to the array
     * @param idx the index of the element to remove from the array
     */
    public static removeFromNestedArray<T>(object: object, path: string, idx: number): any {
        const removeFn = (element: T[]) => [...element.slice(0, idx), ...element.slice(idx+1)];
        return Utility.applyToNestedValue(removeFn, object, path);
    }

    private static arrayRegex: RegExp = /^([a-zA-Z0-9_]+)\[(\d+)]$/;

    /**
     * A function to duplicate an object, while replacing a particular nested element (without mutating the original object)
     * @param replaceFn the function that determines the new element from the original value
     * @param object the object to duplicate
     * @param path the (. delimited) path to the array
     */
    private static applyToNestedValue(replaceFn: (element: any) => any, object: object, path: string): any {
        const fields = path.split('.');
        const child = fields[0];
        const nestedFields = fields.slice(1).join('.');
        const arrayParams = Utility.arrayRegex.exec(fields[0]);

        if (arrayParams) {
            const property = arrayParams[1];
            const idx = Number(arrayParams[2]);
            const newArray = object[property].slice();
            newArray[idx] = fields.length === 1 ? replaceFn(newArray[idx]) : Utility.applyToNestedValue(replaceFn, object[property][idx], nestedFields);
            return Object.assign({}, object, {[property]: newArray});
        } else {
            const newField = fields.length === 1 ? replaceFn(object[path]) : Utility.applyToNestedValue(replaceFn, object[child], nestedFields);
            return Object.assign({}, object, {[child]: newField});
        }
    }
}

export default Utility;
