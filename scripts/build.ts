#!/usr/bin/env node

import log from '@flex-development/grease/utils/log.util'
import { existsSync, writeFileSync } from 'fs-extra'
import { join } from 'path'
import { sync as readPackage } from 'read-pkg'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import fixNodeModulePaths from './fix-node-module-paths'
import exec from './utils/exec'
import { $name } from './utils/pkg-get'

/**
 * @file Scripts - Package Build Workflow
 * @module scripts/pkg-build
 */

export type BuildPackageOptions = {
  /**
   * Bundle project postbuild.
   */
  bundle?: boolean

  /**
   * See the commands that running `build` would run.
   */
  dryRun?: boolean

  /**
   * Files to include in build; `package.json` is also included.
   */
  files?: string[]
}

/**
 * @property {string} BUILD_DIR - Build directory
 */
const BUILD_DIR: string = 'build'

/**
 * @property {string[]} BUILD_FILES - Distribution files
 */
const BUILD_FILES: string[] = ['CHANGELOG.md', 'LICENSE.md', 'README.md']

/**
 * @property {yargs.Argv} args - Command line arguments parser
 * @see https://github.com/yargs/yargs
 */
const args = yargs(hideBin(process.argv))
  .usage('$0 [options]')
  .option('bundle', {
    alias: 'b',
    boolean: true,
    default: false,
    describe: 'bundle project postbuild',
    type: 'boolean'
  })
  .option('dry-run', {
    alias: 'd',
    boolean: true,
    default: false,
    describe: 'see the commands that running build would run',
    type: 'boolean'
  })
  .option('files', {
    alias: 'f',
    array: true,
    choices: BUILD_FILES,
    default: BUILD_FILES,
    description: 'files to include in build'
  })
  .alias('version', 'v')
  .alias('help', 'h')
  .pkgConf('build')
  .wrap(98)

/**
 * @property {BuildPackageOptions} argv - Command line arguments
 */
const argv: BuildPackageOptions = args.argv as BuildPackageOptions

// Log workflow start
log(argv, `starting build workflow`, [$name, `[dry=${argv.dryRun}]`], 'info')

// Remove stale build directory
exec('rimraf build', argv.dryRun)
log(argv, 'remove stale build directory')

// Build project with ttypescript - https://github.com/cevek/ttypescript
if (exec('ttsc -p tsconfig.prod.json', argv.dryRun) || argv.dryRun) {
  log(argv, 'build project')
}

// Fix node module import paths
fixNodeModulePaths()

// Bundle project with ncc - https://github.com/vercel/ncc
if (argv.bundle) {
  exec('rimraf dist', argv.dryRun)
  log(argv, 'remove stale dist directory')

  exec('ncc build --license licenses.txt', argv.dryRun)
  log(argv, 'bundled project')
}

// Create package.json in $BUILD_DIR
if (!argv.dryRun) {
  // Get copy of package.json
  const pkgjson = readPackage({ cwd: process.cwd(), normalize: false })

  // Reset `publishConfig#directory`
  if (!pkgjson.publishConfig) pkgjson.publishConfig = {}
  pkgjson.publishConfig.directory = './'

  // Reset `main`, `module`, and `types`
  pkgjson.main = pkgjson.main?.replace(`${BUILD_DIR}/`, '')
  pkgjson.module = pkgjson.module?.replace(`${BUILD_DIR}/`, '')
  pkgjson.types = pkgjson.types?.replace(`${BUILD_DIR}/`, '')

  // Remove `devDependencies` `files`, and `scripts` from package.json
  Reflect.deleteProperty(pkgjson, 'devDependencies')
  Reflect.deleteProperty(pkgjson, 'files')
  Reflect.deleteProperty(pkgjson, 'scripts')

  // Add `_id` field
  pkgjson._id = `${pkgjson.name}@${pkgjson.version}`

  // Create package.json file
  writeFileSync(
    join(process.cwd(), BUILD_DIR, 'package.json'),
    JSON.stringify(pkgjson, null, 2)
  )
}
log(argv, `create ${BUILD_DIR}/package.json`)

// Copy distribution files
argv.files?.forEach(file => {
  if (existsSync(join(process.cwd(), file))) {
    exec(`copyfiles ${file} ${BUILD_DIR}`, argv.dryRun)
    log(argv, `create ${BUILD_DIR}/${file}`)
  } else {
    log(argv, `skipped ${file} -> ${BUILD_DIR}/${file}`, [], 'warning')
  }
})

// Log workflow end
log(argv, `build workflow complete`, [$name], 'info')
