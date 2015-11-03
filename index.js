'use strict'

var fs = require( 'fs' )
var archiver = require( 'archiver' )
var rimraf = require( 'rimraf' )

const path = require( 'path' )

const cwd = process.cwd()
const projectPackageFile = path.resolve( cwd, 'package.json' )
const projectPackageConfig = require( projectPackageFile )

// Remove any npm scope from package name
const projectPackageSafeName = projectPackageConfig.name.split( '/' )[ 1 ]

const packageOutputDir = path.resolve( cwd, 'package' )
const packageOutputFileName = path.resolve(
  packageOutputDir, `${projectPackageSafeName}.zip`
)
const packagePOMFileName = path.resolve(
  packageOutputDir,
  'pom.xml'
)

module.exports = {
  createZip: createZip,
  createPom: createPom,
  createPackage: createPackage
}

/**
 * Create pom.xml file
 * @param {Object} options
 * @param {string} options.template path to template file
 */
function createPom( options ) {

  const templateString = fs.readFileSync(
    options.template,
    { encoding: 'utf8' }
  )

  const tranformedTemplate = templateString.replace(
    'ARTIFACTID',
    projectPackageSafeName
  ).replace(
    'VERSION',
    projectPackageConfig.version
  )

  fs.writeFileSync( packagePOMFileName, tranformedTemplate )

}

/**
 * Create package zip Archive
 * @param {Object} options
 * @param {functio} callback
 */
function createZip( options, callback ) {

  // Create stream
  var outputFile = fs.createWriteStream( packageOutputFileName )

  // Return on stream close
  outputFile.on( 'close', () => callback( options ) )

  // Create archiver
  var archive = archiver( 'zip', {
    gzip: true,
    gzipOptions: {
      level: 1
    }
  } )

  // pipe to the stream
  archive.pipe( outputFile )

  archive.on( 'error', function( error ) {

    throw error

  })

  // Archive ./dist/** and package.json
  archive
    .file( projectPackageFile, { name: 'package.json' })
    .directory( options.dist || 'dist', false )
    .finalize()

}

/**
 * Create package
 * @param {Object} options
 * @param {functio} callback
 */
function createPackage( options, callback ) {

  // Ensure clean start
  rimraf.sync( packageOutputDir )

  // Create package dir
  fs.mkdirSync( packageOutputDir )

  createZip( options, callback )

  createPom( options )

}
