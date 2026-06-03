"use server";

import { createRecords, TABLES } from "@/lib/lark-cli-bridge";

interface MCRequestData {
  selectedMCs: string[];
  campaignName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

export async function submitMCRequest(data: MCRequestData): Promise<{ success: boolean; error?: string }> {
  if (!data.selectedMCs?.length || !data.clientName?.trim()) {
    return { success: false, error: "Selected MCs and client name are required" };
  }

  const result = await createRecords(TABLES.MC_REQUESTS, [
    {
      fields: {
        "Selected MCs": data.selectedMCs.join(", "),
        "Campaign Name": data.campaignName || "",
        "Client Name": data.clientName,
        "Client Email": data.clientEmail || "",
        "Client Phone": data.clientPhone || "",
        "Notes": data.notes || "",
        "Status": "New",
      },
    },
  ]);

  return result;
}
