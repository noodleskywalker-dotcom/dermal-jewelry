import type { CommissionFields } from "./options";
import { LINK_DAYS } from "./receipt";
import { escapeHtml } from "./security";

export type ReferenceLink = { name: string; size: number; contentType: string; url: string; attached: boolean };

const or = (value: string, fallback = "—") => value.trim() || fallback;
const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Doha time, which is where the studio reads its mail; the ISO value is kept beside it. */
function when(date: Date): string {
  const local = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Qatar" }).format(date);
  return `${local} (Doha) · ${date.toISOString()}`;
}

/**
 * The owner's copy of a request. Every value the customer typed is escaped before it goes into the
 * HTML; the plain-text part carries the same content for any mail client that prefers it.
 */
export function commissionEmail(id: string, fields: CommissionFields, references: ReferenceLink[], receivedAt: Date) {
  const subject = `NEW DERMAL COMMISSION — ${id}`;
  const customer: [string, string][] = [
    ["Name", fields.name.trim()],
    ["Email", fields.email.trim()],
    ["Phone / WhatsApp", or(fields.phone)],
    ["Instagram", or(fields.instagram)],
  ];
  const request: [string, string][] = [
    ["Placement", or(fields.placement, "Not given")],
    ["Design type", or(fields.designType, "Not given")],
    ["Material preference", or(fields.material, "Not given")],
    ["Stone / colour preference", or(fields.stone, "Not given")],
    ["Budget", or(fields.budget, "Not given")],
  ];

  const rows = (list: [string, string][]) =>
    list
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#66615a;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
      )
      .join("");
  const heading = (text: string) =>
    `<h2 style="margin:28px 0 8px;font:600 11px/1.4 monospace;letter-spacing:.2em;text-transform:uppercase;color:#8f2337">${escapeHtml(text)}</h2>`;
  const refs = references.length
    ? `<ol style="padding-left:18px;margin:0">${references
        .map(
          (r) =>
            `<li style="margin:4px 0"><a href="${escapeHtml(r.url)}">${escapeHtml(r.name)}</a> <span style="color:#66615a">· ${escapeHtml(r.contentType)} · ${kb(r.size)}${r.attached ? " · attached" : " · link only"}</span></li>`,
        )
        .join("")}</ol>`
    : `<p style="margin:0;color:#66615a">No reference files.</p>`;

  const html = `<!doctype html><html><body style="margin:0;background:#fbfaf7;color:#0c0c0d;font:15px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:32px 24px">
<p style="margin:0;font:600 11px/1.4 monospace;letter-spacing:.3em">DERMAL</p>
<h1 style="margin:12px 0 4px;font-weight:300;font-size:26px;letter-spacing:.04em">New commission ${escapeHtml(id)}</h1>
<p style="margin:0;color:#66615a">${escapeHtml(when(receivedAt))}</p>
${heading("Customer")}<table style="border-collapse:collapse">${rows(customer)}</table>
${heading("Request")}<table style="border-collapse:collapse">${rows(request)}</table>
${heading("Description")}<p style="margin:0;white-space:pre-wrap">${escapeHtml(fields.description.trim())}</p>
${heading("References")}${refs}
<p style="margin:32px 0 0;color:#66615a;font-size:13px">Reply to this email to answer the customer directly. Files are attached where they fit; every file also has a private link, valid for ${LINK_DAYS} days. Please do not forward the links.</p>
</div></body></html>`;

  const line = ([k, v]: [string, string]) => `${k}: ${v}`;
  const text = [
    `NEW DERMAL COMMISSION — ${id}`,
    when(receivedAt),
    "",
    "CUSTOMER",
    ...customer.map(line),
    "",
    "REQUEST",
    ...request.map(line),
    "",
    "DESCRIPTION",
    fields.description.trim(),
    "",
    "REFERENCES",
    ...(references.length ? references.map((r, i) => `${i + 1}. ${r.name} (${r.contentType}, ${kb(r.size)}${r.attached ? ", attached" : ", link only"})\n   ${r.url}`) : ["No reference files."]),
    "",
    `Links are private and valid for ${LINK_DAYS} days.`,
  ].join("\n");

  return { subject, html, text };
}
