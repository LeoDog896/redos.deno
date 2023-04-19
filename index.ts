import { check } from "npm:recheck";
import { getRegexes } from "./lib.ts";

function checker(check: "fuzz" | "automaton") {
    console.log(
      `\tchecker: %c${check}`,
      check === "automaton" ? "color: yellow" : "color: red",
    );
  }

let regexCount = 0;
const regexes = getRegexes(await Deno.readTextFile("./regexDump.ts"));

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

console.log(`Checked ${regexCount} regex${regexCount === 1 ? "" : "es"}`);
