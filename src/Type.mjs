/**
 * @file Type.mjs
 * Utility module with simple functions for type validation
 * Can tell the difference between null & object (yes I know they're the same type under the hood this is a qol feature for me)
 * I also added `"any"` / `DataType.Any` type functionality
 */

import App from "./App.mjs";

/** @template T @typedef {{[keyName: string]: T, ...}} Enum */

/// Validate that value is in datatype enum ///

/**
 * Returns whether the value is a type - as in if it's a member of the DataType Enum, or a non-null object
 * @param {any?} value the value to test
 * @returns {boolean}
 */
export function isAType(value) {
  return isInEnum(value, DataType) || isA(value, Object);
}

/**
 * Throws a TypeError if the value isn't a type
 * @param {any?} value the value to test
 */
export function throwIfNotAType(value) {
  if (!isAType(value))
    throw new TypeError(
      `Expected member of the DataType Enum, but got '${value}' instead!`,
    );
}

/**
 * Tests if `value` is an Enum (an object in the format of `EnumName<T> = {[keyName: string]: (value: T), ...}`)
 * @param {any?} value the value to test
 * @param {DataType} [type] the datatype
 * @returns {boolean}
 */
export function isEnumLike(value, type = DataType.Any) {
  if (typeof value !== "object" || value === null) return false; // all Enums are objects

  let keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++)
    if (typeOf(keys[i]) !== DataType.String) return false; // all Enums have string keys

  // all Enums have one type as all values
  let values = Object.values(value);
  let inferredType = type;
  for (let i = 0; i < values.length; i++) {
    if (inferredType === DataType.Any) inferredType = typeOf(values[i]);
    if (typeOf(values[i]) !== inferredType) return false; // all Enums have the same type as values
  }

  return true; // is enum atp
}

/// DataType Enum ///

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
  Class: "class",
});
/** @alias DataType */
export const dt = DataType;

/// Getter Functions ///

/**
 * Gets the primitive datatype of the specified value
 * @param {any?} value the value to retrieve the datatype of
 * @returns {DataType}
 */
export function getDataType(value) {
  let type = typeof value;

  do {
    // do loop for early exit statements
    if (type !== "function") break;
    const ructor = type.constructor;
    if (typeof ructor !== "function") break;
    // atp, type is a class

    return DataType.Class;
  } while (false);

  if (type === "object") {
    if (value !== null) return DataType.Object;
    else return DataType.Null;
  }
  return type;
}
/**@alias getDataType */
export const typeOf = getDataType; // quick reference

/**
 * Gets the constructor (class of the specified value) (returns Object class if no specified class)
 * @param {object} object
 * @returns {object?} prototype.constructor or null
 */
export function getClass(object) {
  // validate type
  if (object !== null && typeof object !== "object") {
    throw new TypeError(
      `Expected param object to be object type but got '${typeOf(object)}' type instead`,
    );
  }
  // atp, `object` is now verified to be object type, we can try to get the class from here //

  let mightBeClass = object.constructor;
  if (getDataType(mightBeClass) === DataType.Class) return mightBeClass;
  return Object.prototype.constructor;
}
/** @alias getClass */
export const classOf = getClass;

/// Validation Functions ///

/**
 * Returns if the values is a member of the specified Enum
 * @param {(any?)[]|any?} values the values to test
 * @param {object} enumObj the Enum
 * @returns {boolean}
 */
export function isInEnum(value, enumObj) {
  // get all values in enum
  let values = Object.values(enumObj);
  // return true if found
  for (let i = 0; i < values.length; i++) if (value === values[i]) return true;
  // otherwise return false
  return false;
}

/**
 * Returns whether or not the value is the correct type or not
 * @param {any?} value the value to test
 * @param {DataType|object} type either a value of of DataType or a class to test if value is an instance of it
 * @returns {boolean}
 */
export function isA(value, type, typeIsEnum = false) {
  if (type === DataType.Any) return true; // Allow any type
  if (type === DataType) typeIsEnum = true;
  if (type === Array) return Array.isArray(value); // test if is array (if type is Array)
  // atp, type is not DataType.Any or an Array

  if (typeIsEnum) return isInEnum(value, type);
  // atp, type is not an enum

  if (isInEnum(type, DataType))
    return typeOf(value) === type ? DataType.Null : typeof value === type; // otherwise type is a primitive

  // atp, type is not a primitive

  if (typeOf(type) === dt.Class) return value instanceof type;
  // atp, type is not a class

  // unexpected value in type
  throw new TypeError(
    `Expected type to be member of DataType enum or class, got '${type}' of type ${typeOf(type)}`,
  );
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
 * @param {any[]|any?} values the values to test
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
