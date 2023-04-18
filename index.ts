import { check } from "npm:recheck";
import { parse } from "https://deno.land/x/swc@0.2.1/mod.ts";
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

interface ASTRegex {
  type: "RegExpLiteral";
  pattern: string;
  flag: string;
}

function regexToString(regex: unknown): ASTRegex {
  const schema = z.object({
    type: z.literal("RegExpLiteral"),
    pattern: z.string(),
    flag: z.string().optional(),
  });

  return schema.parse(regex);
}

function filterType(module: unknown): ASTRegex[] {
  const result: ASTRegex[] = [];
  for (const value of Object.values(module)) {
    if (value === null || value === undefined) {
      continue;
    } else if (
      typeof value === "object" && "type" in value &&
      value.type === "RegExpLiteral"
    ) {
      result.push(regexToString(value));
    } else if (typeof value === "object") {
      result.push(...filterType(value as Record<string, unknown>));
    } else if (Array.isArray(value)) {
      result.push(...filterType(value));
    } else {
      continue;
    }
  }

  return result;
}

function getRegexes(source: string) {
  const ast = parse(source, {
    target: "es2019",
    syntax: "typescript",
    comments: false,
  });
  const regexes: ASTRegex[] = [];
  for (const node of ast.body) {
    regexes.push(...filterType(node));
  }
  return regexes;
}

let regexCount = 0;
const regexes = getRegexes(await Deno.readTextFile("./regexDump.ts"));

function checker(check: "fuzz" | "automaton") {
  console.log(
    `\tchecker: %c${check}`,
    check === "automaton" ? "color: yellow" : "color: red",
  );
}

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
    // TODO
  }
}

console.log(`Checked ${regexCount} regex${regexCount === 1 ? "" : "es"}`);
