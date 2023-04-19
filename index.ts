import { check } from "npm:recheck";
import { getRegexes } from "./lib.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { walk } from "https://deno.land/std@0.184.0/fs/walk.ts";

function checker(check: "fuzz" | "automaton") {
  console.log(
    `\tchecker: %c${check}`,
    check === "automaton" ? "color: yellow" : "color: red",
  );
}

await new Command()
  .name("redos")
  .description("Check for ReDoS vulnerabilities in your Deno code.")
  .version("v0.0.1")
  .option("--ignore <files:file[]>", "Ignore a file or directory.")
  .option("--ext <extensions:string[]>", "Specify file extensions.", {
    default: ["ts", "tsx", "js", "jsx"],
  })
  .action(async ({ ignore, ext }) => {
    let regexCount = 0;
    let fileCount = 0;

    for await (const walkEntry of walk(Deno.cwd())) {
      if (!walkEntry.isFile) continue;
      if (ignore?.includes(walkEntry.path)) continue;
      if (!ext.includes(walkEntry.path.split(".").pop() ?? "")) continue;

      const regexes = getRegexes(await Deno.readTextFile(walkEntry.path));
      fileCount++;

      for (const regex of regexes) {
        const flag = regex.flag ?? "";
        regexCount++;
        const result = await check(regex.pattern, flag);

        if (result.status === "vulnerable") {
          console.log(
            `%cVulnerable Regex: %c/${regex.pattern}/${flag}`,
            "color: red",
            "color: black",
          );
          checker(result.checker);
          console.log(`\tpattern: %c${result.attack.pattern}`, "color: red");
        } else if (result.status === "unknown") {
          console.log(
            `%cUnknown Regex: %c/${regex.pattern}/${flag}`,
            "color: orange",
            "color: black",
          );
        }
      }
    }

    console.log(`Checked ${regexCount} regex${regexCount === 1 ? "" : "es"} in ${fileCount} file${fileCount === 1 ? "" : "s"}`);
  })
  .parse();
