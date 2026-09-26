import { describe, expect, it } from "vitest";
import { POST as submit } from "@/app/api/commission/route";
import { GET as openFile } from "@/app/api/commission/file/route";
import { POST as upload } from "@/app/api/commission/upload/route";
import { mockOutbox } from "@/lib/commission/delivery";
import { commissionEmail } from "@/lib/commission/email";
import { safeFileName, sniff } from "@/lib/commission/files";
import { EMPTY_FIELDS, FILES, looksAllowed, readFields, validateFields, type CommissionFields } from "@/lib/commission/options";
import { fileLink, issueReceipt, LINK_DAYS, readFileLink, readReceipt } from "@/lib/commission/receipt";
import { createRateLimiter, escapeHtml, isRequestId, requestId } from "@/lib/commission/security";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52]);
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20]);
const PDF = new TextEncoder().encode("%PDF-1.7\n%âãÏÓ\n1 0 obj\n");
const EXE = new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0xff, 0xff, 0, 0]);

const VALID: CommissionFields = {
  ...EMPTY_FIELDS,
  name: "A. Customer",
  email: "customer@example.com",
  placement: "Anti-eyebrow",
  description: "A small crescent with a clear stone, worn below the outer eye.",
  rights: true,
  acknowledge: true,
};

let testKey = 0;
function post(path: string, body: BodyInit, mock: string, extra: Record<string, string> = {}) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    body,
    headers: { "x-dermal-commission-mock": mock, "x-dermal-test-key": `unit-${++testKey}`, ...extra },
  });
}

async function uploadFile(bytes: Uint8Array, name: string, mock = "ok", key?: string) {
  const form = new FormData();
  form.append("file", new File([bytes as BlobPart], name));
  const request = post("/api/commission/upload", form, mock, key ? { "x-dermal-test-key": key } : {});
  const response = await upload(request);
  return { response, json: (await response.json()) as { ok: boolean; ref?: string; name?: string; type?: string; error?: string } };
}

function submitJson(body: unknown, mock = "ok", key?: string) {
  return submit(post("/api/commission", JSON.stringify(body), mock, { "Content-Type": "application/json", ...(key ? { "x-dermal-test-key": key } : {}) }));
}

describe("commission fields", () => {
  it("requires a name, an email, a description and both confirmations", () => {
    const errors = validateFields(EMPTY_FIELDS);
    expect(Object.keys(errors).sort()).toEqual(["acknowledge", "description", "email", "name", "rights"]);
    expect(validateFields(VALID)).toEqual({});
  });

  it("refuses an email address that is not complete", () => {
    for (const email of ["customer", "customer@", "customer@example", "a b@example.com", "<x>@example.com"]) {
      expect(validateFields({ ...VALID, email }).email, email).toBeTruthy();
    }
  });

  it("accepts only the listed preferences", () => {
    expect(validateFields({ ...VALID, placement: "Forehead" }).placement).toBeTruthy();
    expect(validateFields({ ...VALID, budget: "1,000,000 QAR" }).budget).toBeTruthy();
    expect(validateFields({ ...VALID, material: "", stone: "Not sure", budget: "Under 500 QAR", designType: "Symbol" })).toEqual({});
  });

  it("reads untrusted input without trusting its types", () => {
    const fields = readFields({ name: 42, email: " a@b.co ", rights: "true", acknowledge: true, extra: "x" });
    expect(fields.name).toBe("");
    expect(fields.email).toBe("a@b.co");
    expect(fields.rights).toBe(false);
    expect(fields.acknowledge).toBe(true);
  });
});

describe("commission files", () => {
  it("knows a file by its bytes, never by its name", () => {
    expect(sniff(JPEG)?.mime).toBe("image/jpeg");
    expect(sniff(PNG)?.mime).toBe("image/png");
    expect(sniff(WEBP)?.mime).toBe("image/webp");
    expect(sniff(PDF)?.mime).toBe("application/pdf");
    expect(sniff(EXE)).toBeNull();
    expect(sniff(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
  });

  it("lets the browser pre-check names and declared types", () => {
    expect(looksAllowed("sketch.JPG", "image/jpeg")).toBe(true);
    expect(looksAllowed("brief.pdf", "")).toBe(true);
    expect(looksAllowed("run.exe", "application/x-msdownload")).toBe(false);
    expect(looksAllowed("photo.heic", "image/heic")).toBe(false);
    expect(looksAllowed("fake.jpg.exe", "")).toBe(false);
    expect(looksAllowed("anim.gif", "image/gif")).toBe(false);
  });

  it("makes file names safe to show and to download", () => {
    const jpg = sniff(JPEG)!;
    expect(safeFileName("../../etc/passwd", jpg)).toBe("passwd.jpg");
    expect(safeFileName("C:\\Users\\x\\<script>alert(1)</script>.png", jpg)).not.toMatch(/[<>/\\]/);
    expect(safeFileName("invoice.pdf.exe", sniff(PDF)!)).toBe("invoice-pdf.pdf");
    expect(safeFileName("...", jpg)).toBe("reference.jpg");
    expect(safeFileName("a".repeat(300), jpg).length).toBeLessThanOrEqual(64);
  });
});

describe("commission security", () => {
  it("issues short random references in the DRM-C form", () => {
    const ids = new Set(Array.from({ length: 200 }, requestId));
    for (const id of ids) expect(isRequestId(id)).toBe(true);
    expect(ids.size).toBeGreaterThan(190);
  });

  it("escapes everything a customer could type", () => {
    expect(escapeHtml(`<img src=x onerror="alert('1')">&\``)).toBe("&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;&#96;");
  });

  it("limits a burst from one visitor and forgets it after the window", () => {
    const limiter = createRateLimiter(3, 1000);
    expect([0, 1, 2, 3].map((t) => limiter.take("ip", t))).toEqual([true, true, true, false]);
    expect(limiter.take("other", 3)).toBe(true);
    expect(limiter.take("ip", 1500)).toBe(true);
  });

  it("refuses a receipt that was altered or signed with another secret", () => {
    const ref = issueReceipt({ pathname: "commissions/references/2026-09/a.jpg", name: "a.jpg", size: 10, type: "image/jpeg" }, "s1");
    expect(readReceipt(ref, "s1")?.name).toBe("a.jpg");
    expect(readReceipt(ref, "s2")).toBeNull();
    const [payload, sig] = ref.split(".");
    const forged = Buffer.from(JSON.stringify({ pathname: "commissions/references/x/b.pdf", name: "b.pdf", size: 1, type: "application/pdf" })).toString("base64url");
    expect(readReceipt(`${forged}.${sig}`, "s1")).toBeNull();
    expect(readReceipt(`${payload}.`, "s1")).toBeNull();
  });
});

describe("reference links", () => {
  const receipt = { pathname: "commissions/references/2026-09/a.png", name: "a.png", size: 10, type: "image/png" };
  const parts = (url: string) => {
    const q = new URL(url).searchParams;
    return [q.get("r"), q.get("e"), q.get("s")] as const;
  };

  it("open while valid and stop at their expiry", () => {
    const now = Date.UTC(2026, 8, 26);
    const [r, e, s] = parts(fileLink("https://dermal.test", receipt, "k", now));
    expect(readFileLink(r, e, s, "k", now)?.name).toBe("a.png");
    expect(readFileLink(r, e, s, "k", now + (LINK_DAYS - 1) * 86_400_000)).not.toBeNull();
    expect(readFileLink(r, e, s, "k", now + (LINK_DAYS + 1) * 86_400_000)).toBeNull();
  });

  it("cannot be extended or re-pointed by editing the address", () => {
    const now = Date.UTC(2026, 8, 26);
    const [r, e, s] = parts(fileLink("https://dermal.test", receipt, "k", now));
    expect(readFileLink(r, String(Number(e) + 86_400 * 365), s, "k", now)).toBeNull();
    expect(readFileLink(r, e, s, "other-secret", now)).toBeNull();
    expect(readFileLink(r, "soon", s, "k", now)).toBeNull();
  });
});

describe("the owner's email", () => {
  it("carries the whole request and escapes what the customer wrote", () => {
    const email = commissionEmail(
      "DRM-C-8F2K1",
      { ...VALID, description: "<script>alert(1)</script> & a crescent", instagram: "@dermal_fan" },
      [{ name: "sketch.jpg", size: 2048, contentType: "image/jpeg", url: "https://example.test/f?r=1&s=2", attached: true }],
      new Date("2026-09-26T09:00:00Z"),
    );
    expect(email.subject).toBe("NEW DERMAL COMMISSION — DRM-C-8F2K1");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; a crescent");
    for (const text of ["A. Customer", "customer@example.com", "@dermal_fan", "Anti-eyebrow", "sketch.jpg", "2026-09-26T09:00:00.000Z"]) {
      expect(email.html).toContain(text);
      expect(email.text).toContain(text);
    }
    expect(email.text).toContain("Budget: Not given");
  });
});

describe("the commission routes (mock delivery)", () => {
  it("stores an accepted picture and refuses anything else", async () => {
    const ok = await uploadFile(JPEG, "Photo 01.JPG");
    expect(ok.response.status).toBe(200);
    expect(ok.json.name).toBe("Photo 01.jpg");
    expect(ok.json.type).toBe("image/jpeg");

    const renamed = await uploadFile(EXE, "photo.jpg");
    expect(renamed.response.status).toBe(415);

    const big = new Uint8Array(FILES.maxBytes + 1);
    big.set(JPEG);
    expect((await uploadFile(big, "huge.jpg")).response.status).toBe(413);
    expect((await uploadFile(new Uint8Array(0), "empty.jpg")).response.status).toBe(400);
  });

  it("sends a valid request with its references and returns a reference", async () => {
    const a = await uploadFile(JPEG, "one.jpg");
    const b = await uploadFile(PDF, "brief.pdf");
    const before = mockOutbox().length;
    const response = await submitJson({ fields: VALID, files: [a.json.ref, b.json.ref], website: "" });
    const json = (await response.json()) as { ok: boolean; id: string };
    expect(response.status).toBe(200);
    expect(isRequestId(json.id)).toBe(true);
    const sent = mockOutbox().slice(before);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("noodleskywalker@gmail.com");
    expect(sent[0].replyTo).toBe("customer@example.com");
    expect(sent[0].subject).toBe(`NEW DERMAL COMMISSION — ${json.id}`);
    expect(sent[0].attachments.map((f) => f.filename)).toEqual(["one.jpg", "brief.pdf"]);
    expect(sent[0].html).toContain("/api/commission/file?r=");
  });

  it("checks every field again on the server", async () => {
    const response = await submitJson({ fields: { ...VALID, email: "not-an-email", rights: false }, files: [] });
    const json = (await response.json()) as { errors: Record<string, string> };
    expect(response.status).toBe(422);
    expect(Object.keys(json.errors).sort()).toEqual(["email", "rights"]);
  });

  it("refuses a file that did not come through the upload step", async () => {
    const forged = issueReceipt({ pathname: "commissions/references/2026-09/x.jpg", name: "x.jpg", size: 1, type: "image/jpeg" }, "someone-else");
    const response = await submitJson({ fields: VALID, files: [forged] });
    expect(response.status).toBe(422);
    const tooMany = await submitJson({ fields: VALID, files: Array(FILES.maxCount + 1).fill("x") });
    expect(tooMany.status).toBe(422);
  });

  it("refuses a filled honeypot", async () => {
    expect((await submitJson({ fields: VALID, files: [], website: "https://spam.example" })).status).toBe(400);
  });

  it("never reports success when the email does not go", async () => {
    const response = await submitJson({ fields: VALID, files: [] }, "fail-email");
    const json = (await response.json()) as { ok: boolean };
    expect(response.status).toBe(502);
    expect(json.ok).toBe(false);
    expect((await uploadFile(JPEG, "a.jpg", "fail-storage")).response.status).toBe(502);
  });

  it("slows a burst of requests from one visitor", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await submitJson({ fields: { ...VALID, name: "" }, files: [] }, "ok", "burst")).status);
    expect(statuses.slice(0, 5).every((s) => s === 422)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it("answers plainly when delivery is not set up", async () => {
    const request = new Request("http://localhost/api/commission", { method: "POST", body: "{}" });
    const saved = { blob: process.env.BLOB_READ_WRITE_TOKEN, resend: process.env.RESEND_API_KEY };
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.RESEND_API_KEY;
    try {
      expect((await submit(request)).status).toBe(503);
    } finally {
      if (saved.blob) process.env.BLOB_READ_WRITE_TOKEN = saved.blob;
      if (saved.resend) process.env.RESEND_API_KEY = saved.resend;
    }
  });

  it("opens a reference only through its signed link", async () => {
    const a = await uploadFile(PNG, "ref.png");
    await submitJson({ fields: VALID, files: [a.json.ref] });
    const link = mockOutbox().at(-1)!.html.match(/href="([^"]+)"/)![1].replace(/&amp;/g, "&");
    const get = (url: string) => openFile(new Request(url, { headers: { "x-dermal-commission-mock": "ok" } }));
    const response = await get(link);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect((await get(link.replace(/s=[^&]+/, "s=forged"))).status).toBe(404);
  });
});
