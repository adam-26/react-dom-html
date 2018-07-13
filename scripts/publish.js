#!/usr/bin/env node

/*
This may be a better option in the future:
https://github.com/atlassian/lerna-semantic-release
https://github.com/Updater/semantic-release-monorepo

A simple script to independently version packages in a yarn workspace.
It uses the commit history to determine how to increment each packages version number.

Example, when run from the workspace root:
node publish.js

Optionally, you can specify the git branch used to determine if a package contains any changes (default is master branch)
node publish.js customBranchName

============ CI Usage ==========
# First, build each package
yarn wsrun build --stages
yarn wsrun publish --stages

# Then, tag the release and update required package.json versions & changelog's, push tags to git, publish to NPM
node publish.js

# Or; to do a dry-run:
node publish.js --dry-run

# Or; to do a dry-run on a specific branch:
node publish.js --dry-run someBranchName

============ INSTALLATION ==========
Copy and paste this file -> publish.js

Run the following command in the yarn workspace root folder
- it will add devDependencies to your workspace package.json file:

yarn add standard-version semver conventional-recommended-bump wsrun glob --D -W

============ LICENSE ==========

MIT License

Copyright (c) 2018 @adam-26

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
var semver = require("semver");
var glob = require("glob");
var defaultRemoteName = "origin";
var defaultRemoteBranch = "master";
var dependencyKeys = ["devDependencies", "peerDependencies", "dependencies"];

function isDirectory(source) {
    return fs.lstatSync(source).isDirectory();
}

function syncExec(command, options) {
    var opts = options || {};
    return child_process.execSync(
        command,
        Object.assign({ encoding: "utf8" }, opts)
    );
}

function readPackageJson(packageDir) {
    var packageJsonPath = path.join(packageDir, "package.json");
    return JSON.parse(fs.readFileSync(packageJsonPath, { encoding: "utf8" }));
}

function writePackageJson(packageDir, data) {
    var packageJsonPath = path.join(packageDir, "package.json");
    fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, "  ") + "\n");
}

function updateWorkspaceDependencyVersions(
    packageDirectories,
    workspacePackageVersions,
    isPackagePrivate
) {
    process.stdout.write(`Updating workspace dependency versions.\n`);
    var updatedPrivatePackages = [];

    var packageNames = Object.keys(workspacePackageVersions);
    packageNames.forEach(function(workspacePackageName) {
        var hasChanged = false;
        var pkg = readPackageJson(packageDirectories[workspacePackageName]);

        dependencyKeys.forEach(dependencyType => {
            var dependencies = pkg[dependencyType] || {};
            Object.keys(dependencies)
                .filter(pkgName => packageNames.indexOf(pkgName) !== -1)
                .forEach(dependencyPackageName => {
                    hasChanged = true;

                    // Default to prefix all version using the caret ^
                    pkg[dependencyType][dependencyPackageName] = `^${
                        workspacePackageVersions[dependencyPackageName]
                    }`;
                });
        });

        if (hasChanged) {
            process.stdout.write(
                `Updating package.json in workspace "${workspacePackageName}"\n`
            );
            writePackageJson(packageDirectories[workspacePackageName], pkg);
            if (isPackagePrivate[workspacePackageName]) {
                updatedPrivatePackages.push(workspacePackageName);
            }
        }
    });

    process.stdout.write(`Updated workspace dependency versions.\n`);
    return updatedPrivatePackages;
}

function getTagName(packageName, version) {
    return `${packageName}/v${version}`;
}

function publishWorkspacePackages(
    dryRunArg,
    workspaceRootDir,
    currentBranchArg,
    remoteOriginArg,
    remoteBranchArg
) {
    var isDryRun = dryRunArg !== "";
    var currentBranch =
        currentBranchArg ||
        syncExec(`git rev-parse --abbrev-ref HEAD`, { cwd: workingDir }).trim();
    var remoteOrigin = remoteOriginArg || defaultRemoteName;
    var remoteBranch = remoteBranchArg || defaultRemoteBranch;

    if (!isDryRun && currentBranch !== "master") {
        throw new Error("You can only publish from the master branch.");
    }

    // Bind default exec to the workspace root directory
    function exec(command, opts) {
        return syncExec(
            command,
            Object.assign({ cwd: workspaceRootDir }, opts || {})
        );
    }

    function logExec(command, opts) {
        process.stdout.write(exec(command, opts));
    }

    function log(line) {
        process.stdout.write(`${line}\n`);
    }

    var packageBump = {};
    var hasPackageChanged = {};
    var currentPackageVersion = {};
    var nextPackageVersion = {};
    var packagePrivate = {};
    var packageNames = [];
    var packageDirectories = {};

    var rootPackageJson = readPackageJson(workspaceRootDir);
    if (
        rootPackageJson.private !== true ||
        !Array.isArray(rootPackageJson.workspaces)
    ) {
        throw new Error(
            "publish must be executed in the yarn root workspace folder."
        );
    }

    // Resolve all workspace names and directories
    rootPackageJson.workspaces.forEach(workspaceGlob => {
        var workspacePaths = glob.sync(workspaceGlob, {
            cwd: workspaceRootDir
        });
        workspacePaths.forEach(function(workspacePath) {
            var resolvedPath = path.resolve(workspaceRootDir, workspacePath);
            if (!isDirectory(resolvedPath)) {
                // Its a file.
                return;
            }

            try {
                var packageJson = readPackageJson(workspacePath);

                if (!packageJson.private === true) {
                    var packageName = packageJson.name;
                    packageNames.push(packageName);
                    packageDirectories[packageName] = resolvedPath;
                }
            } catch (e) {
                // Missing package.json file - assume its not a workspace.
            }
        });
    });

    // Get the recommended "bump" for each package
    packageNames.forEach(function(packageName) {
        var packageJson = readPackageJson(packageDirectories[packageName]);

        packagePrivate[packageName] = packageJson.private || false;
        currentPackageVersion[packageName] = packageJson.version;
        packageBump[packageName] = exec(
            `node_modules/.bin/conventional-recommended-bump -p angular --lernaPackage=${packageName}`
        ).trim();
    });

    // Determine if each package has been updated
    packageNames.forEach(function(packageName) {
        if (packagePrivate[packageName]) {
            return;
        }

        try {
            // Use the previous package.json version to determine if the package has changed
            var previousTag = getTagName(
                packageName,
                currentPackageVersion[packageName]
            );
            // log(`git diff --shortstat --ignore-submodules ${previousTag} HEAD -- ${packageDirectories[packageName]}`);
            var diffStatus = exec(
                `git diff --shortstat --ignore-submodules ${previousTag} HEAD -- ${
                    packageDirectories[packageName]
                }`
            ).trim();
            // log(diffStatus);
            hasPackageChanged[packageName] = !!(
                diffStatus && diffStatus.length > 0
            );
        } catch (e) {
            // If the previous tag does not exist, or can't be read
            // - we'll assume the package needs to be published
            // - either first commit, or...???
            hasPackageChanged[packageName] = true;
            log(
                `No previous tagged version found for workspace ${packageName}`
            );
        }
    });

    // Verify each package version before applying any tags
    packageNames.forEach(function(packageName) {
        if (hasPackageChanged[packageName]) {
            var currentVersion = currentPackageVersion[packageName];
            var releaseType = packageBump[packageName];
            if (!semver.valid(currentVersion)) {
                throw new Error(
                    `Invalid current version "${currentVersion}" for package "${packageName}"`
                );
            }

            var nextVersion = semver.inc(currentVersion, releaseType);
            if (!semver.valid(nextVersion)) {
                throw new Error(
                    `Invalid next version "${nextVersion}" for package "${packageName}"`
                );
            }

            nextPackageVersion[packageName] = nextVersion;
        }
    });

    // update all package versions
    packageNames.forEach(function(packageName) {
        if (nextPackageVersion[packageName]) {
            var currentVersion = currentPackageVersion[packageName];
            var nextVersion = nextPackageVersion[packageName];

            // use standard-version here to update package version and auto-create the changelog (skip git tag & git commit actions)
            var execOpts = { cwd: packageDirectories[packageName] };
            var rootStandardVersionBinary = path.relative(
                packageDirectories[packageName],
                path.resolve(
                    workspaceRootDir,
                    "node_modules",
                    ".bin",
                    "standard-version"
                )
            );
            log(
                `Updating package "${packageName}" from version "${currentVersion}" to "${nextVersion}".`
            );
            logExec(
                `${rootStandardVersionBinary} --release-as "${nextVersion}" --skip.tag=true --skip.commit=true --no-verify${dryRunArg}`,
                execOpts
            );
        }
    });

    // After updating the package versions - update workspace dependencies
    var commitOnlyPackages = [];
    if (!isDryRun) {
        // Only update dependencies when not performing a dry-run
        commitOnlyPackages = updateWorkspaceDependencyVersions(
            packageDirectories,
            Object.assign({}, currentPackageVersion, nextPackageVersion),
            packagePrivate
        );
    }

    // Commit private workspaces that have had package.json dependency versions updated
    if (!isDryRun) {
        commitOnlyPackages.forEach(function(packageName) {
            var execOpts = { cwd: packageDirectories[packageName] };
            log(
                `Commit (only) package.json for private workspace "${packageName}".`
            );
            logExec(
                `git commit --no-verify -m "chore(release): Update package.json dependencies for ${packageName}. [skip ci]" -- package.json`,
                execOpts
            );
        });
    }

    // Once the dependency versions are up-to date, tag and commit
    let changeCount = 0;
    packageNames.forEach(function(packageName) {
        if (nextPackageVersion[packageName]) {
            changeCount++;
            var nextVersion = nextPackageVersion[packageName];

            // Commit the modified files - then apply a tag to the commit
            var execOpts = { cwd: packageDirectories[packageName] };
            log(`Tag package "${packageName}" @ "${nextVersion}".`);

            if (!isDryRun) {
                // Commit package.json & CHANGELOG.md
                logExec(
                    `git commit --no-verify -m "chore(release): ${packageName}@${nextVersion}. [skip ci]" -- package.json CHANGELOG.md`,
                    execOpts
                );

                // Get the SHA1 checksum of the prior commit
                var commitSha1 = exec(
                    `git rev-parse --short HEAD`,
                    execOpts
                ).trim();

                // Tag the previous commit (using the SHA1 checksum)
                logExec(
                    `git tag -a ${getTagName(
                        packageName,
                        nextVersion
                    )} ${commitSha1} -m "Tag package ${packageName}@${nextVersion}"`,
                    execOpts
                );
            }
        }
    });

    log(
        changeCount === 0
            ? "No workspaces changes detected, no packages have been published."
            : changeCount + " package(s) have been published."
    );

    // Push tags to git
    logExec(
        `git push --follow-tags ${remoteOrigin} ${remoteBranch}${dryRunArg}`
    );

    if (isDryRun) {
        // dry-run, prevent NPM Publish
        return;
    }

    // Finally, publish each package to the NPM registry.
    packageNames.forEach(function(packageName) {
        if (nextPackageVersion[packageName]) {
            var nextVersion = nextPackageVersion[packageName];
            log(`Publishing package "${packageName}" to NPM.`);
            logExec(`yarn publish --new-version ${nextVersion} --tag latest`, {
                cwd: packageDirectories[packageName]
            });
        }
    });
}

var isDryRun = process.argv[2] === "--dry-run";
var args = isDryRun ? process.argv.slice(3) : process.argv.slice(2);

var workingDir = process.cwd();
var localBranch = args[0];
var remoteName = args[1];
var remoteBranch = args[2];

publishWorkspacePackages(
    isDryRun ? " --dry-run" : "",
    workingDir,
    localBranch,
    remoteName,
    remoteBranch
);
