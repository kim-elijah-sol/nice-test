const exec = require("child_process").exec;

export function syncExec(cmd: string): Promise<string> {
  return new Promise((resolve) => {
    let res = "";

    const child = exec(cmd, { encoding: "euc-kr" });

    child.stdout.on("data", function (data: string) {
      res += data;
    });

    child.on("close", () => {
      resolve(res);
    });
  });
}
