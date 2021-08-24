/**
 * @file Node Module Mock - @actions/core
 * @module mocks/actions/core
 * @see https://jestjs.io/docs/manual-mocks#mocking-node-modules
 * @see https://github.com/actions/toolkit/tree/main/packages/core
 */

export const addPath = jest.fn()
export const debug = jest.fn()
export const isDebug = jest.fn(() => {
  return JSON.parse(process.env?.ACTIONS_STEP_DEBUG ?? '') === true
})
export const endGroup = jest.fn()
export const error = jest.fn()
export const exportVariable = jest.fn()
export const getBooleanInput = jest.fn()
export const getInput = jest.fn()
export const getMultilineInput = jest.fn()
export const getState = jest.fn()
export const group = jest.fn()
export const info = jest.fn()
export const saveState = jest.fn()
export const startGroup = jest.fn()
export const setCommandEcho = jest.fn()
export const setFailed = jest.fn()
export const setOutput = jest.fn()
export const setSecret = jest.fn()
export const warning = jest.fn()
