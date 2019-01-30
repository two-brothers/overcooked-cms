class NestedUtility {

    /**
     * A function to duplicate an object, while replacing the specified field
     * This behaves like Object.assign but can handle nested fields
     * @param object the object to duplicate
     * @param path the (. delimited) path to the field to be replaced
     * @param replacement the value to replace in the field
     */
    public static replaceField<T>(object: object, path: string, replacement: T): any {
        const replaceFn = () => replacement
        return NestedUtility.applyToNestedValue(replaceFn, object, path)
    }

    /**
     * A function to duplicate an object, while appending an item to a nested array (without mutating the original object)
     * @param object the object to duplicate
     * @param path the (. delimited) path to the array
     * @param item the value to add to the array
     */
    public static appendToNestedArray<T>(object: object, path: string, item: T): any {
        const appendFn = (element: T[]) => element.concat(item)
        return NestedUtility.applyToNestedValue(appendFn, object, path)
    }

    /**
     * A function to duplicate an object, while removing an item from a nested array (without mutating the original object)
     * @param object the object to duplicate
     * @param path the (. delimited) path to the array
     * @param idx the index of the element to remove from the array
     */
    public static removeFromNestedArray<T>(object: object, path: string, idx: number): any {
        const removeFn = (element: T[]) => [...element.slice(0, idx), ...element.slice(idx + 1)]
        return NestedUtility.applyToNestedValue(removeFn, object, path)
    }

    /**
     * A function to duplicate an object, while toggling a nested boolean (without mutating the original object)
     * @param object the object to duplicate
     * @param path the (. delimited) path to the boolean
     */
    public static toggleNested(object: object, path: string): any {
        const toggleFn = (element: boolean) => !element
        return NestedUtility.applyToNestedValue(toggleFn, object, path)
    }

    /**
     * A function to retrieve a nested parameter from an object, given a string representation of the path
     * @param object the outer object
     * @param path the (. delimited) path to the property
     */
    public static retrieveFromPath(object: object, path?: string): any {
        if (!path) {
            return object
        }

        const fields = path.split('.')
        const child = fields[0]
        const nestedFields = fields.slice(1).join('.')
        const arrayParams = NestedUtility.arrayRegex.exec(child)

        if (arrayParams) {
            const property = arrayParams[1]
            const idx = Number(arrayParams[2])
            return NestedUtility.retrieveFromPath(object[property][idx], nestedFields)
        }

        return NestedUtility.retrieveFromPath(object[child], nestedFields)
    }

    private static arrayRegex: RegExp = /^([a-zA-Z0-9_]+)\[(\d+)]$/

    /**
     * A function to duplicate an object, while replacing a particular nested element (without mutating the original object)
     * @param replaceFn the function that determines the new element from the original value
     * @param object the object to duplicate
     * @param path the (. delimited) path to the array
     */
    private static applyToNestedValue(replaceFn: (element: any) => any, object: object, path: string): any {
        const fields = path.split('.')
        const child = fields[0]
        const nestedFields = fields.slice(1).join('.')
        const arrayParams = NestedUtility.arrayRegex.exec(child)

        if (arrayParams) {
            const property = arrayParams[1]
            const idx = Number(arrayParams[2])
            const newArray = object[property].slice()
            newArray[idx] = fields.length === 1 ? replaceFn(newArray[idx]) : NestedUtility.applyToNestedValue(replaceFn, object[property][idx], nestedFields)
            return Object.assign({}, object, { [property]: newArray })
        } else {
            const newField = fields.length === 1 ? replaceFn(object[path]) : NestedUtility.applyToNestedValue(replaceFn, object[child], nestedFields)
            return Object.assign({}, object, { [child]: newField })
        }
    }
}

export default NestedUtility
