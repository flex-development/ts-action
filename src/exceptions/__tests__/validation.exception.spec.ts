import { ExceptionLevel } from '@/enums/exception-level.enum'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import ERROR from '@tests/fixtures/error.fixture'
import VALIDATION_ERRORS from '@tests/fixtures/validation-errors.fixture'
import TestSubject from '../validation.exception'

/**
 * @file Unit Tests - ValidationException
 * @module ts-action/exceptions/tests/unit/ValidationException
 */

describe('unit:exceptions/ValidationException', () => {
  const MODEL = 'Model'

  describe('constructor', () => {
    const data = { test: true }

    it('should convert Error into Exception', () => {
      // Act
      const exception = new TestSubject(MODEL, ERROR, data)

      // Expect
      expect(exception).toMatchObject({
        code: ExceptionStatusCode.BAD_REQUEST,
        data: { ...data, level: ExceptionLevel.ERROR },
        errors: [],
        message: ERROR.message
      })
    })

    it('should convert ValidationError[] into Exception', () => {
      // Act
      const exception = new TestSubject(MODEL, VALIDATION_ERRORS, data)

      // Expect
      expect(exception.message).toStartWith(MODEL)
      expect(exception.message).toMatch(/(validation failure: )\[([a-z])\w+/)
      expect(exception).toMatchObject({
        code: ExceptionStatusCode.BAD_REQUEST,
        data: { ...data, level: ExceptionLevel.ERROR },
        errors: VALIDATION_ERRORS
      })
    })
  })
})
