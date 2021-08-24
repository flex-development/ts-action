import * as core from '@actions/core'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import { ExceptionJSON } from '@flex-development/exceptions/interfaces'
import util from 'util'
import { ExceptionLevel } from './enums/exception-level.enum'

/**
 * @file Run Method
 * @module ts-action/run
 */

/**
 * Runs the GitHub Action workflow.
 *
 * @return {Promise<void>} Empty promise when complete
 */
async function run(): Promise<void> {
  try {
    //
  } catch (error) {
    let exception: Exception | ExceptionJSON = error as Exception

    // Convert Error into Exception
    if (!exception.className) {
      const code = ExceptionStatusCode.INTERNAL_SERVER_ERROR
      const data = { level: ExceptionLevel.ERROR }

      exception = new Exception(code, error.message, data, error.stack)
    }

    // Get exception as json object
    exception = (exception as Exception).toJSON()

    // Log non-fatal exceptions, but force failure for fatal exceptions
    if (exception.data.level !== ExceptionLevel.ERROR) {
      core[exception.data.level](exception.message)
    } else {
      core.setFailed(exception.message)
    }

    // Log stringified exception
    core.info(util.inspect(exception, false, null))

    return
  }
}

export default run
