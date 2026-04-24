import { redirect } from "next/navigation";
import { dashboardPath } from "@/lib/constants";

export default function RootPage() {
  redirect(dashboardPath("overview"));
}
