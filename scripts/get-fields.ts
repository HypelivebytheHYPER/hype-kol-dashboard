const LARK_APP_ID = process.env.LARK_APP_ID!;
const LARK_APP_SECRET = process.env.LARK_APP_SECRET!;

async function getTenantToken(): Promise<string> {
  const res = await fetch("https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: LARK_APP_ID, app_secret: LARK_APP_SECRET }),
  });
  const data = await res.json() as any;
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Auth failed: ${data.msg}`);
  }
  return data.tenant_access_token;
}

async function main() {
  const token = await getTenantToken();
  const url = "https://open.larksuite.com/open-apis/bitable/v1/apps/H2GQbZBFqaUW2usqPswlczYggWg/tables/tblaijZshhnZLDWJ/fields?page_size=100";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.data?.items) {
    for (const item of data.data.items) {
      console.log(`${item.field_name} (${item.type})`);
    }
  } else {
    console.log("Error:", JSON.stringify(data, null, 2));
  }
}
main().catch(console.error);
