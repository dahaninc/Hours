import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventTypeId = searchParams.get("event_type_id");
  const email = searchParams.get("email");

  if (!eventTypeId || !email) {
    return NextResponse.json({ error: "event_type_id and email are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_available_package_session", {
    p_event_type_id: eventTypeId,
    p_invitee_email: email,
  });

  return NextResponse.json({ session: data ?? null });
}
