/**
 * @file Type.mjs
 * Utility module with simple functions for type validation
 */

/** @readonly @enum {string} */
export const DataType = Object.freeze({
  BigInt: "bigint",
  Boolean: "boolean",
  Function: "function",
  Number: "number",
  Object: "object",
  String: "string",
  Symbol: "symbol",
  Undefined: "undefined",
  Null: "null",
  Any: "any",
});
export const dt = DataType; // quick reference

/**
 * Returns if the values is a member of the specified Enum
 * @param {(any?)[]|any?} values the values to test
 * @param {object} enumObj the Enum
 * @returns {boolean}
 */
export function isEnum(value, enumObj) {
  // get all values in enum
  let values = Object.values(enumObj);
  // return true if found
  for (let i = 0; i < values.length; i++) if (value === values[i]) return true;
  // otherwise return false
  return false;
}

/**
 * Returns whether the value is a type - as in if it's a member of the DataType Enum, or a non-null object
 * @param {any?} value the value to test
 * @returns {boolean}
 */
export function isAType(value) {
  return validate(value, [DataType, DataType.Object]);
}

/**
 * Throws a TypeError if the value isn't a type
 * @param {any?} value the value to test
 */
export function throwIfNotAType(value) {
  throwIfInvalid(value, [DataType, DataType.Object]);
}

/**
 * Returns whether or not the value is the correct type or not
 * @param {any?} value the value to test
 * @param {DataType|object} type either a value of of DataType or a class to test if value is an instance of it
 * @returns {boolean}
 */
export function isA(value, type) {
  if (type === DataType.Any) return true; // Allow any type
  if (type === Array) return Array.isArray(value); // test if is array (if type is Array)

  if (!isEnum(type, DataType)) {
    // atp, type is not a string equal to a value in the DataType enum
    // test if type is object
    throwIfNotA(value, DataType.Object);

    // now test if value is enum type
    if (isEnum(value, type)) return true;

    // now test if value is instanceof type
    if (value instanceof type) return true;
    return false;
  }

  let valType = value === null ? "null" : typeof value;
  return valType === type;
}

/**
 * Throws a TypeError if the value is not of type or class `type`
 * @param {any?} value thee value to test
 * @param {DataType|object} type either a member of the DataType enum or a class
 */
export function throwIfNotA(value, type) {
  if (!isA(value, type))
    throw new TypeError(`Expected type '${type}' but got '${value}' instead.`);
}

/**
 * Returns false if any one of the values don't match at least one the allowedTypes
 * @param {(any?)[]|any?} values the values to test
 * @param {(DataType|object)[]|(DataType|object)} allowedTypes array of expected types & classes
 * @returns {boolean}
 */
export function validate(values, allowedTypes) {
  if (!Array.isArray(values)) values = [values];
  if (!Array.isArray(allowedTypes)) allowedTypes = [allowedTypes];

  for (let i = 0; i < values.length; i++) {
    let value = values[i];
    let passed = false;

    for (let j = 0; j < allowedTypes.length; j++)
      if (isA(value, allowedTypes[j])) passed = true;

    if (!passed) return (false, value);
  }

  return true;
}

/**
 * Throws a TypeError if any one of the values don't match any of the allowedTypes
 * @param {(any?)[]|any?} values the values to test
 * @param {(DataType|object)[]|(DataType|object)} allowedTypes array of types (DataType Enum) & classes that are allowed for the code to continue without errors
 */
export function throwIfInvalid(values, allowedTypes) {
  let [isValid, problemValue] = validate(values, allowedTypes);

  if (!isValid)
    throw new TypeError(
      `Unexpected value: '${problemValue}';\nExpected types: '${allowedTypes}';`,
    );
}
