'use strict';
var fs = require('fs');
var archiver = require('archiver');
var rimraf = require('rimraf');
var path = require('path');
var cwd = process.cwd();
var projectPackageFile = path.resolve(cwd, 'package.json');
var projectPackageConfig = require(projectPackageFile);
// Remove any npm scope from package name
var projectPackageSafeName = projectPackageConfig.name.split('/').slice(-1);
var packageOutputDir = path.resolve(cwd, 'package');
var packageOutputFileName = path.resolve(packageOutputDir, projectPackageSafeName + ".zip");
var packagePOMFileName = path.resolve(packageOutputDir, 'pom.xml');
module.exports = {
    createZip: createZip,
    createPom: createPom,
    createPackage: createPackage
};
/**
 * Create pom.xml file
 * @param {Object} options
 * @param {string} options.template path to template file
 */
function createPom(options) {
    var templateString = fs.readFileSync(options.template, { encoding: 'utf8' });
    var tranformedTemplate = templateString.replace('ARTIFACTID', projectPackageSafeName).replace('VERSION', projectPackageConfig.version);
    fs.writeFileSync(packagePOMFileName, tranformedTemplate);
}
/**
 * Create package zip Archive
 * @param {Object} options
 * @param {function} callback
 */
function createZip(options, callback) {
    // Create stream
    var outputFile = fs.createWriteStream(packageOutputFileName);
    // Return on stream close
    outputFile.on('close', function () { callback(options); });
    // Create archiver
    var archive = archiver('zip', {
        gzip: true,
        gzipOptions: {
            level: 1
        }
    });
    // pipe to the stream
    archive.pipe(outputFile);
    archive.on('error', function (error) {
        throw error;
    });
    // Archive ./dist/** and package.json
    archive
        .file(projectPackageFile, { name: 'package.json' })
        .directory(options.dist || 'dist', false)
        .finalize();
}
/**
 * Create package
 * @param {Object} options
 * @param {functio} callback
 */
function createPackage(options, callback) {
    // Ensure clean start
    rimraf.sync(packageOutputDir);
    // Create package dir
    fs.mkdirSync(packageOutputDir);
    createZip(options, callback);
    createPom(options);
}
//# sourceMappingURL=index.js.map