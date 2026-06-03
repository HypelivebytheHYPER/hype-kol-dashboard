import { fetchRecords, TABLES, str } from "../lib/lark-cli-bridge";

const tableArg = process.argv[2] as keyof typeof TABLES;
const TABLE = TABLES[tableArg] ?? TABLES.DASHBOARD_SUMMARY;

async function main() {
  const res = await fetchRecords(TABLE, { pageSize: 5 });
  for (const r of res.data) {
    const f = r.fields;
    console.log("---");
    console.log("Metric Key:", str(f, "Metric Key"));
    console.log("Metric Label:", str(f, "Metric Label"));
    console.log("Metric Value:", str(f, "Metric Value"));
    console.log("Trend:", str(f, "Trend"));
    console.log("Change:", str(f, "Change"));
  }
}
main().catch(console.error);
