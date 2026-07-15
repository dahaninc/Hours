import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await supabase.from("calendar_connections").delete().eq("profile_id", user.id).eq("provider", "google");
  return NextResponse.json({ ok: true });
}
