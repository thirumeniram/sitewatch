import fs from "fs-extra";
import logger from "jet-logger";
import childProcess from "child_process";

logger.settings.timestamp = false;

(async () => {
  try {
    await remove("./dist/");
    await exec("tsc --build tsconfig.prod.json", "./");
  } catch (err) {
    logger.err(err);
  }
})();

function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, (err) => {
      return !!err ? rej(err) : res();
    });
  });
}

function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
      if (!!stdout) {
        logger.err(stdout);
      }
      if (!!stderr) {
        logger.warn(stderr);
      }
      return !!err ? rej(err) : res();
    });
  });
}
