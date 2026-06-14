import { DataType, throwIfInvalid, throwIfNotA } from "../src/Type.mjs";

export class Tester {
  /// Static ///

  /** @readonly @type {object} */
  static defaultTests = Object.freeze({});

  /// Instance ///

  // Properties //

  // Constructor //

  /**
   * Initializes a simple tester engine
   */
  constructor() {}

  // Methods //
}

export class FunctionTest {
  /**
   *
   * @param  {...(DataType|DataType[])} paramsEndingWithReturnType The parameters of the
   */
  constructor(...paramsEndingWithReturnType) {}
}

export class ObjectTest {
  // Properties //
  

  // Constructor //

  /**
   *
   * @param {{[keyName: string]: (DataType[]|DataType), ...}} keyNameTypePairs
   * @param {{[keyName: string]: FunctionTest, ...}} [keyNameMethodTestPairs]
   */
  constructor(keyNameTypePairs, keyNameMethodTestPairs = {}) {
    throwIfInvalid([keyNameTypePairs, keyNameMethodTestPairs], DataType.Object);

    // get test keys
    let fieldKeys = Object.keys(keyNameTypePairs);
    let methodKeys = Object.keys(keyNameMethodTestPairs);

    for
  }
}
