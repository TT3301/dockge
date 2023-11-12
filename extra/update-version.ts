import pkg from "../package.json";
import childProcess from "child_process";

const newVersion = process.env.VERSION;

console.log("New Version: " + newVersion);

if (! newVersion) {
    console.error("invalid version");
    process.exit(1);
}

const exists = tagExists(newVersion);

if (! exists) {
    // Process package.json
    pkg.version = newVersion;

    // Also update pnpm-lock.yaml
    const npm = /^win/.test(process.platform) ? "pnpm.cmd" : "pnpm";
    childProcess.spawnSync(npm, [ "install" ]);

    commit(newVersion);
    tag(newVersion);

} else {
    console.log("version exists");
}

/**
 * Commit updated files
 * @param {string} version Version to update to
 */
function commit(version) {
    let msg = "Update to " + version;

    let res = childProcess.spawnSync("git", [ "commit", "-m", msg, "-a" ]);
    let stdout = res.stdout.toString().trim();
    console.log(stdout);

    if (stdout.includes("no changes added to commit")) {
        throw new Error("commit error");
    }
}

/**
 * Create a tag with the specified version
 * @param {string} version Tag to create
 */
function tag(version) {
    let res = childProcess.spawnSync("git", [ "tag", version ]);
    console.log(res.stdout.toString().trim());
}

/**
 * Check if a tag exists for the specified version
 * @param {string} version Version to check
 * @returns {boolean} Does the tag already exist
 */
function tagExists(version) {
    if (! version) {
        throw new Error("invalid version");
    }

    let res = childProcess.spawnSync("git", [ "tag", "-l", version ]);

    return res.stdout.toString().trim() === version;
}
