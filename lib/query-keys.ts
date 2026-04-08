// Query keys - can be used by both server and client
import type { TableId } from "./lark-base";

export const larkKeys = {
  all: ["lark"] as const,
  tables: () => [...larkKeys.all, "tables"] as const,
  table: (tableId: TableId) => [...larkKeys.tables(), tableId] as const,
  records: (tableId: TableId, filters?: unknown) => 
    [...larkKeys.table(tableId), "records", filters] as const,
  fileUrl: (token: string) => [...larkKeys.all, "file", token] as const,
};
