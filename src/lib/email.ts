import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

let resendSingleton: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendSingleton) {
    resendSingleton = new Resend(process.env.RESEND_API_KEY);
  }
  return resendSingleton;
}

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? "Hours <bookings@hours.co>";

function formatDateTime(iso: string, timezone: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Best-effort send — email failures never block a booking from completing.
 * If RESEND_API_KEY isn't configured yet, this silently no-ops.
 */
export async function sendBookingConfirmationEmails(params: {
  inviteeName: string;
  inviteeEmail: string;
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  startTime: string;
  inviteeTimezone: string;
  hostTimezone: string;
  locationValue: string | null;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping booking confirmation emails.");
    return;
  }

  const inviteeWhen = formatDateTime(params.startTime, params.inviteeTimezone);
  const hostWhen = formatDateTime(params.startTime, params.hostTimezone);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.inviteeEmail,
      subject: `Confirmed: ${params.eventTitle} with ${params.hostName}`,
      html: `
        <p>Hi ${escapeHtml(params.inviteeName)},</p>
        <p>Your booking is confirmed:</p>
        <p><strong>${escapeHtml(params.eventTitle)}</strong><br/>
        ${inviteeWhen}<br/>
        ${params.locationValue ? `Location: ${escapeHtml(params.locationValue)}` : ""}</p>
        <p>See you then!</p>
      `,
    });
  } catch (err) {
    console.error("[email] Failed to send invitee confirmation:", err);
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.hostEmail,
      subject: `New booking: ${params.inviteeName} — ${params.eventTitle}`,
      html: `
        <p>You've got a new booking:</p>
        <p><strong>${escapeHtml(params.eventTitle)}</strong><br/>
        with ${escapeHtml(params.inviteeName)} (${escapeHtml(params.inviteeEmail)})<br/>
        ${hostWhen}</p>
      `,
    });
  } catch (err) {
    console.error("[email] Failed to send host notification:", err);
  }
}

type BookingEmailContext = {
  invitee_name: string;
  invitee_email: string;
  invitee_timezone: string;
  start_time: string;
  event_title: string;
  location_value: string | null;
  host_name: string;
  host_email: string;
  host_timezone: string;
};

/** Looks up full booking context via the service-role-only RPC and sends both confirmation emails. */
export async function sendConfirmationEmailsForBooking(bookingId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin.rpc("get_booking_email_context", { p_booking_id: bookingId });
    if (!data) return;
    const ctx = data as unknown as BookingEmailContext;
    await sendBookingConfirmationEmails({
      inviteeName: ctx.invitee_name,
      inviteeEmail: ctx.invitee_email,
      hostName: ctx.host_name,
      hostEmail: ctx.host_email,
      eventTitle: ctx.event_title,
      startTime: ctx.start_time,
      inviteeTimezone: ctx.invitee_timezone,
      hostTimezone: ctx.host_timezone,
      locationValue: ctx.location_value,
    });
  } catch (err) {
    console.error("[email] Could not send booking confirmation:", err);
  }
}

type PackagePurchaseEmailContext = {
  invitee_name: string;
  invitee_email: string;
  sessions_remaining: number;
  package_name: string;
  host_name: string;
  host_email: string;
};

export async function sendPackagePurchaseConfirmationEmail(packagePurchaseId: string) {
  const resend = getResend();
  const admin = createAdminClient();
  const { data } = await admin.rpc("get_package_purchase_email_context", {
    p_package_purchase_id: packagePurchaseId,
  });
  if (!data) return;
  const ctx = data as unknown as PackagePurchaseEmailContext;

  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping package purchase confirmation email.");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ctx.invitee_email,
      subject: `You're all set: ${ctx.package_name}`,
      html: `
        <p>Hi ${escapeHtml(ctx.invitee_name)},</p>
        <p>Your purchase of <strong>${escapeHtml(ctx.package_name)}</strong> with ${escapeHtml(ctx.host_name)} is confirmed.
        You have <strong>${ctx.sessions_remaining} session${ctx.sessions_remaining === 1 ? "" : "s"}</strong> ready to book —
        just book as usual and it'll be applied automatically.</p>
      `,
    });
  } catch (err) {
    console.error("[email] Failed to send package purchase confirmation:", err);
  }
}

/** Uses the admin client's Auth API directly (getUserById) rather than another RPC — service-role clients can call GoTrue's admin endpoints, sidestepping the "PostgREST can't see auth.users" limitation entirely. */
export async function sendHostPurchaseConfirmationEmail(hostPurchaseId: string) {
  try {
    const admin = createAdminClient();
    const { data: purchase } = await admin
      .from("host_purchases")
      .select("profile_id, amount_cents, currency")
      .eq("id", hostPurchaseId)
      .single();
    if (!purchase) return;

    const [{ data: profile }, { data: userResult }] = await Promise.all([
      admin.from("profiles").select("display_name").eq("id", purchase.profile_id).single(),
      admin.auth.admin.getUserById(purchase.profile_id),
    ]);
    const hostEmail = userResult?.user?.email;
    if (!hostEmail) return;

    const resend = getResend();
    if (!resend) {
      console.warn("[email] RESEND_API_KEY not set — skipping host purchase confirmation email.");
      return;
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: hostEmail,
      subject: "You're all set — lifetime access to Hours",
      html: `
        <p>Hi ${escapeHtml(profile?.display_name ?? "there")},</p>
        <p>Your payment of ${(purchase.amount_cents / 100).toFixed(2)} ${purchase.currency.toUpperCase()} is confirmed —
        you now have lifetime access to Hours. Thank you for your support!</p>
      `,
    });
  } catch (err) {
    console.error("[email] Failed to send host purchase confirmation:", err);
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
