import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface MCRequestPayload {
  selectedMCs: string[];
  campaignName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

const APP_TOKEN = "H2GQbZBFqaUW2usqPswlczYggWg";
const TABLE_ID = "tbl6wOMD7TDJdWJV";

async function getTenantToken(): Promise<string | null> {
  const appId = process.env["LARK_APP_ID"];
  const appSecret = process.env["LARK_APP_SECRET"];
  
  if (!appId || !appSecret) {
    return null;
  }

  try {
    const res = await fetch("https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });
    const data = await res.json();
    if (data.code !== 0) {
      return null;
    }
    return data.tenant_access_token || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MCRequestPayload;

    if (!body.selectedMCs?.length || !body.clientName?.trim()) {
      return Response.json(
        { error: "Selected MCs and client name are required" },
        { status: 400 }
      );
    }

    const token = await getTenantToken();
    if (!token) {
      return Response.json({ error: "Lark auth not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fields: {
            "Selected MCs": body.selectedMCs.join(", "),
            "Campaign Name": body.campaignName || "",
            "Client Name": body.clientName,
            "Client Email": body.clientEmail || "",
            "Client Phone": body.clientPhone || "",
            "Notes": body.notes || "",
            "Status": "New",
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      return Response.json({ error: `Lark error: ${res.status} ${text}` }, { status: 502 });
    }

    const data = await res.json();
    return Response.json({ success: true, recordId: data.data?.record?.record_id });
  } catch {
    return Response.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
