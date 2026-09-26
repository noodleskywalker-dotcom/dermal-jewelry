"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  BUDGETS,
  DESIGN_TYPES,
  EMPTY_FIELDS,
  FILES,
  LIMITS,
  looksAllowed,
  MATERIALS,
  PLACEMENTS,
  STONES,
  validateFields,
  type CommissionFields,
  type FieldErrors,
} from "@/lib/commission/options";

type Reference = {
  key: string;
  file: File;
  /** An object URL for an image preview; a PDF has none. Released when the file leaves the page. */
  preview: string | null;
  /** The server's signed receipt once this file has been stored, so a retry never sends it twice. */
  ref?: string;
  resized?: boolean;
};

type Status = { state: "idle" } | { state: "sending"; step: string } | { state: "failed"; message: string } | { state: "sent"; id: string };

const FAILED = "We couldn’t send your request. Your files have not been lost from this page. Please try again.";

const noSubscription = () => () => {};

const size = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/**
 * A large photo is resized in the browser rather than refused, so a phone picture of any size can be
 * sent. The picture never leaves the device until the customer presses send.
 */
async function fitPhoto(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, FILES.resizeLongEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    for (const quality of [0.9, 0.82, 0.72]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= FILES.maxBytes) return new File([blob], file.name.replace(/\.[^.]*$/, "") + ".jpg", { type: "image/jpeg" });
    }
  } catch {
    // Not a picture the browser can read: refused below.
  }
  return null;
}

export function CommissionForm({ endpoint = "/api/commission" }: { endpoint?: string }) {
  const [fields, setFields] = useState<CommissionFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<Reference[]>([]);
  const [fileNotice, setFileNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const chooser = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const received = useRef<HTMLHeadingElement>(null);
  const failure = useRef<HTMLDivElement>(null);
  // The latest list, for the async steps (adding, uploading) that outlive a render.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  const uid = useId();
  // False in the server's HTML and during hydration, true once the form can hold what is typed. Until
  // then every control is disabled, so nothing typed while the page loads can be silently cleared.
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);

  // Every preview is released when the page goes, so no picture lingers in memory.
  useEffect(() => () => filesRef.current.forEach((f) => f.preview && URL.revokeObjectURL(f.preview)), []);

  useEffect(() => {
    if (status.state === "sent") received.current?.focus();
    if (status.state === "failed") failure.current?.focus();
  }, [status.state]);

  const set = <K extends keyof CommissionFields>(key: K, value: CommissionFields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addFiles = async (list: FileList | File[]) => {
    const incoming = Array.from(list);
    const refused: string[] = [];
    const accepted: Reference[] = [];
    let room = FILES.maxCount - filesRef.current.length;
    for (const original of incoming) {
      if (room <= 0) {
        refused.push(`${original.name}: up to ${FILES.maxCount} files`);
        continue;
      }
      if (!looksAllowed(original.name, original.type)) {
        refused.push(`${original.name}: only JPG, PNG, WEBP or PDF`);
        continue;
      }
      let file = original;
      let resized = false;
      if (file.size > FILES.maxBytes) {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const fitted = isPdf ? null : await fitPhoto(file);
        if (!fitted) {
          refused.push(`${original.name}: larger than ${size(FILES.maxBytes)}`);
          continue;
        }
        file = fitted;
        resized = true;
      }
      const isImage = file.type.startsWith("image/") || !file.name.toLowerCase().endsWith(".pdf");
      accepted.push({ key: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, preview: isImage ? URL.createObjectURL(file) : null, resized });
      room--;
    }
    if (accepted.length) setFiles((f) => [...f, ...accepted]);
    setFileNotice(refused.length ? `Not added — ${refused.join("; ")}.` : accepted.length ? `${accepted.length} ${accepted.length === 1 ? "file" : "files"} added.` : "");
  };

  const removeFile = (key: string) => {
    const target = files.find((f) => f.key === key);
    if (target?.preview) URL.revokeObjectURL(target.preview);
    setFiles((f) => f.filter((x) => x.key !== key));
    setFileNotice(target ? `${target.file.name} removed.` : "");
  };

  const upload = async (item: Reference): Promise<string> => {
    const body = new FormData();
    body.append("file", item.file, item.file.name);
    const response = await fetch(`${endpoint}/upload`, { method: "POST", body });
    const json = (await response.json().catch(() => null)) as { ok?: boolean; ref?: string; message?: string } | null;
    if (!response.ok || !json?.ok || !json.ref) {
      throw new Error(response.status === 415 || response.status === 413 ? `${item.file.name}: ${json?.message ?? "not accepted"}` : FAILED);
    }
    return json.ref;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.state === "sending") return;
    const found = validateFields(fields);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      setStatus({ state: "idle" });
      return;
    }

    try {
      const refs: string[] = [];
      let current = filesRef.current;
      for (let i = 0; i < current.length; i++) {
        const item = current[i];
        if (item.ref) {
          refs.push(item.ref);
          continue;
        }
        setStatus({ state: "sending", step: `Uploading ${i + 1} of ${current.length}` });
        const ref = await upload(item);
        refs.push(ref);
        current = current.map((f) => (f.key === item.key ? { ...f, ref } : f));
        setFiles(current);
      }

      setStatus({ state: "sending", step: "Sending your request" });
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields, files: refs, website: honeypot }),
      });
      const json = (await response.json().catch(() => null)) as { ok?: boolean; id?: string; errors?: FieldErrors; message?: string } | null;
      if (response.ok && json?.ok && json.id) {
        filesRef.current.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        setStatus({ state: "sent", id: json.id });
        return;
      }
      if (response.status === 422 && json?.errors) {
        setErrors(json.errors);
        setStatus({ state: "failed", message: "Some details need another look before we can send your request." });
        return;
      }
      if (response.status === 429) {
        setStatus({ state: "failed", message: `${json?.message ?? "Too many requests in a short time."} Your files have not been lost from this page.` });
        return;
      }
      setStatus({ state: "failed", message: FAILED });
    } catch (error) {
      setStatus({ state: "failed", message: error instanceof Error && error.message !== FAILED ? `${error.message}. ${FAILED}` : FAILED });
    }
  };

  if (status.state === "sent") {
    return (
      <section data-testid="commission-success" className="commission-success" aria-labelledby={`${uid}-received`}>
        <p className="label-xs text-garnet">Thank you</p>
        <h2 id={`${uid}-received`} ref={received} tabIndex={-1} className="commission-success-title">
          Request received
        </h2>
        <p className="label-xs mt-6 text-ash">Reference</p>
        <p data-testid="commission-reference" className="commission-reference">
          {status.id}
        </p>
        <p className="commission-success-copy">
          We’ve received your concept.
          <br />
          DERMAL will review the design, placement and production feasibility before sending you a quote and next steps.
        </p>
        <div className="commission-success-links">
          <Link href="/shop" className="btn-line">
            Back to shop
          </Link>
          <Link href="/collections" className="text-link">
            View collection <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    );
  }

  const sending = status.state === "sending";
  const describedBy = (key: keyof CommissionFields, hint?: string) => [errors[key] ? `${uid}-${key}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined;
  const errorText = (key: keyof CommissionFields) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} className="commission-error" data-testid={`error-${key}`}>
        {errors[key]}
      </p>
    ) : null;

  const text = (key: "name" | "email" | "phone" | "instagram", label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="commission-field">
      <label htmlFor={`${uid}-${key}`} className="commission-label">
        {label}
      </label>
      <input
        id={`${uid}-${key}`}
        data-field={key}
        name={key}
        value={fields[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={describedBy(key)}
        className="commission-input"
        {...props}
      />
      {errorText(key)}
    </div>
  );

  const choices = (key: "placement" | "designType" | "material" | "stone" | "budget", legend: string, options: readonly string[]) => (
    <fieldset className="commission-choices" data-testid={`choices-${key}`} aria-describedby={describedBy(key)}>
      <legend className="commission-label">{legend}</legend>
      <div className="commission-chips">
        {options.map((option, i) => (
          <label key={option} className="commission-chip">
            <input
              type="radio"
              name={key}
              value={option}
              checked={fields[key] === option}
              onChange={() => set(key, option)}
              data-field={i === 0 ? key : undefined}
              className="sr-only"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {errorText(key)}
    </fieldset>
  );

  return (
    <form ref={form} onSubmit={submit} noValidate data-testid="commission-form" data-ready={ready} aria-describedby={`${uid}-required`} className="commission-form">
      <fieldset disabled={!ready} className="commission-fieldset">
      <p id={`${uid}-required`} className="label-xs text-ash">
        Name, email, a description and the two confirmations are required. Everything else is optional.
      </p>

      {/* 01 */}
      <section className="commission-step" aria-labelledby={`${uid}-you`}>
        <h2 id={`${uid}-you`} className="commission-step-title">
          <span aria-hidden="true">01</span> You
        </h2>
        <div className="commission-grid">
          {text("name", "Name", { autoComplete: "name", required: true, maxLength: LIMITS.name })}
          {text("email", "Email", { type: "email", autoComplete: "email", inputMode: "email", required: true, maxLength: LIMITS.email })}
          {text("phone", "Phone / WhatsApp (optional)", { type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: LIMITS.phone })}
          {text("instagram", "Instagram (optional)", { autoComplete: "off", autoCapitalize: "none", spellCheck: false, maxLength: LIMITS.instagram, placeholder: "@" })}
        </div>
      </section>

      {/* 02 */}
      <section className="commission-step" aria-labelledby={`${uid}-piece`}>
        <h2 id={`${uid}-piece`} className="commission-step-title">
          <span aria-hidden="true">02</span> The piece
        </h2>
        {choices("placement", "Placement", PLACEMENTS)}
        <div className="commission-field">
          <label htmlFor={`${uid}-description`} className="commission-label">
            What do you want made?
          </label>
          <textarea
            id={`${uid}-description`}
            data-field="description"
            name="description"
            rows={7}
            required
            maxLength={LIMITS.description}
            value={fields.description}
            onChange={(e) => set("description", e.target.value)}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy("description", `${uid}-description-count`)}
            placeholder="Describe the piece you want — shape, symbol, initials, stone, material direction, placement, size, references, etc."
            className="commission-input commission-textarea"
          />
          <p id={`${uid}-description-count`} className="label-xs mt-2 text-right text-ash">
            {fields.description.length} / {LIMITS.description}
          </p>
          {errorText("description")}
        </div>
      </section>

      {/* 03 */}
      <section className="commission-step" aria-labelledby={`${uid}-refs`}>
        <h2 id={`${uid}-refs`} className="commission-step-title">
          <span aria-hidden="true">03</span> Reference images
        </h2>
        <div
          data-testid="commission-dropzone"
          data-dragging={dragging}
          className="commission-drop"
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
          }}
        >
          <p className="commission-drop-lede">
            <span className="commission-desktop-only">Drop sketches, photos or a PDF here, or </span>
            <span className="commission-touch-only">Add sketches, photos or a PDF from your library or camera.</span>
          </p>
          <div className="commission-drop-actions">
            <button type="button" data-testid="choose-files" className="btn-line" onClick={() => chooser.current?.click()} disabled={files.length >= FILES.maxCount}>
              Choose files
            </button>
            {/* A separate camera button for phones. The main button still opens the photo library. */}
            <button type="button" data-testid="take-photo" className="btn-line commission-touch-only" onClick={() => camera.current?.click()} disabled={files.length >= FILES.maxCount}>
              Take photo
            </button>
          </div>
          <p className="label-xs text-ash">
            Up to {FILES.maxCount} files · JPG, PNG, WEBP or PDF · {size(FILES.maxBytes)} each · large photos are resized for you
          </p>
          <input
            ref={chooser}
            type="file"
            multiple
            accept={FILES.accept}
            data-testid="file-input"
            aria-label="Choose reference files"
            tabIndex={-1}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={camera}
            type="file"
            accept="image/*"
            capture="environment"
            data-testid="camera-input"
            aria-label="Take a reference photo"
            tabIndex={-1}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <p role="status" aria-live="polite" data-testid="file-notice" className="commission-notice">
          {fileNotice}
        </p>
        {files.length > 0 && (
          <ul data-testid="file-previews" className="commission-previews" aria-label="Files to send">
            {files.map((item) => (
              <li key={item.key} data-testid="file-preview" className="commission-preview">
                <div className="commission-thumb">
                  {item.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.preview} alt={`Preview of ${item.file.name}`} />
                  ) : (
                    <span aria-hidden="true" className="commission-thumb-pdf">
                      PDF
                    </span>
                  )}
                </div>
                <p className="commission-thumb-name" title={item.file.name}>
                  {item.file.name}
                </p>
                <p className="label-xs text-ash">
                  {size(item.file.size)}
                  {item.resized ? " · resized" : ""}
                </p>
                <button type="button" data-testid="remove-file" onClick={() => removeFile(item.key)} disabled={sending} className="commission-remove">
                  Remove<span className="sr-only"> {item.file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 04 */}
      <section className="commission-step" aria-labelledby={`${uid}-prefs`}>
        <h2 id={`${uid}-prefs`} className="commission-step-title">
          <span aria-hidden="true">04</span> Preferences <span className="commission-optional">optional</span>
        </h2>
        <p className="commission-help">Preferences only. They help us understand the idea; they are not a promise that a material, stone or price is possible.</p>
        {choices("designType", "Design type", DESIGN_TYPES)}
        {choices("material", "Material direction", MATERIALS)}
        {choices("stone", "Stone / colour", STONES)}
        {choices("budget", "Budget", BUDGETS)}
      </section>

      {/* 05 */}
      <section className="commission-step" aria-labelledby={`${uid}-confirm`}>
        <h2 id={`${uid}-confirm`} className="commission-step-title">
          <span aria-hidden="true">05</span> Confirm
        </h2>
        {(
          [
            ["rights", "I confirm that I have the right to submit the reference material and design provided."],
            ["acknowledge", "I understand this is a design request, not an order. DERMAL will review feasibility and pricing before production."],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="commission-check-row">
            <label className="commission-check">
              <input
                type="checkbox"
                data-field={key}
                checked={fields[key]}
                onChange={(e) => set(key, e.target.checked)}
                aria-invalid={errors[key] ? true : undefined}
                aria-describedby={describedBy(key)}
              />
              <span>{label}</span>
            </label>
            {errorText(key)}
          </div>
        ))}

        {/* A field no person sees or reaches. A script that fills every box fills this one too. */}
        <div className="commission-trap" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </label>
        </div>
      </section>

      {status.state === "failed" && (
        <div ref={failure} tabIndex={-1} role="alert" data-testid="commission-failed" className="commission-failed">
          {status.message}
        </div>
      )}

      <div className="commission-submit">
        <button type="submit" data-testid="commission-submit" className="btn-solid" disabled={sending} aria-busy={sending}>
          {sending ? "Sending…" : "Send request"}
        </button>
        <p role="status" aria-live="polite" className="label-xs text-ash" data-testid="commission-progress">
          {status.state === "sending" ? status.step : "Nothing is ordered or charged. We reply by email."}
        </p>
      </div>
      </fieldset>
    </form>
  );
}
