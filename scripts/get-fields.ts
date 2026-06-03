import { execSync } from "node:child_process";
import { TABLES } from "../lib/lark-cli-bridge";

const tableArg = process.argv[2] as keyof typeof TABLES;
const TABLE = TABLES[tableArg] ?? TABLES.DASHBOARD_SUMMARY;
const BASE_TOKEN = process.env["LARK_BASE_TOKEN"] ?? "H2GQbZBFqaUW2usqPswlczYggWg";

async function main() {
  const stdout = execSync(
    `lark-cli base +field-list --base-token ${BASE_TOKEN} --table-id ${TABLE} --format json 2>&1`,
    { encoding: "utf-8" }
  );
  const res = JSON.parse(stdout) as {
    ok: boolean;
    data?: { fields: Array<{ id: string; name: string; type: string }> };
    error?: { message: string };
  };

  if (!res.ok || !res.data?.fields) {
    console.error("Error:", res.error?.message ?? "Unknown error");
    process.exit(1);
  }

  for (const f of res.data.fields) {
    console.log(`${f.name} (${f.type})`);
  }
}
main().catch(console.error);
