// The commission request, as the customer fills it in and as the server checks it. Every choice is a
// preference, never a promise: DERMAL reviews feasibility, materials and price before anything is made.

export const PLACEMENTS = ["Anti-eyebrow", "Dermal", "Eyebrow", "Nose", "Septum", "Lip", "Ear", "Other", "Not sure"] as const;
export const DESIGN_TYPES = ["Initial / monogram", "Symbol", "Custom shape", "Object / weapon", "Stone-focused", "Text / glyph", "Other"] as const;
export const MATERIALS = ["Polished silver-tone", "Gold-tone", "Dark metal", "Mixed", "Not sure", "Other"] as const;
export const STONES = ["None", "Red", "Black", "Clear", "Blue", "Green", "Other", "Not sure"] as const;
export const BUDGETS = ["Under 500 QAR", "500–1,000 QAR", "1,000–2,500 QAR", "2,500+ QAR", "Not sure"] as const;

export const LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  instagram: 60,
  description: 4000,
  descriptionMin: 10,
} as const;

/** Reference files: kept conservative, so one request stays well inside an email and a function body. */
export const FILES = {
  maxCount: 6,
  /** Per file, after the browser has resized a large photo. */
  maxBytes: 4 * 1024 * 1024,
  /** A large photo is resized in the browser to fit, never rejected outright. */
  resizeLongEdge: 2560,
  extensions: [".jpg", ".jpeg", ".png", ".webp", ".pdf"],
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  accept: "image/*,.pdf",
} as const;

export type CommissionFields = {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  placement: string;
  designType: string;
  material: string;
  stone: string;
  budget: string;
  description: string;
  rights: boolean;
  acknowledge: boolean;
};

export const EMPTY_FIELDS: CommissionFields = {
  name: "",
  email: "",
  phone: "",
  instagram: "",
  placement: "",
  designType: "",
  material: "",
  stone: "",
  budget: "",
  description: "",
  rights: false,
  acknowledge: false,
};

export type FieldErrors = Partial<Record<keyof CommissionFields, string>>;

// Deliberately plain: one @, no spaces, a dot in the domain. The server is the one that decides.
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

export function isEmail(value: string): boolean {
  return value.length <= LIMITS.email && EMAIL.test(value);
}

const oneOf = (list: readonly string[], value: string) => value === "" || list.includes(value);

/**
 * Checks a request. The same function runs in the browser, for the customer, and on the server,
 * where it is the one that counts: the server never trusts what the browser already checked.
 */
export function validateFields(input: CommissionFields): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const description = input.description.trim();

  if (!name) errors.name = "Tell us your name.";
  else if (name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`;

  if (!email) errors.email = "Tell us where to reply.";
  else if (!isEmail(email)) errors.email = "That email address doesn’t look complete.";

  if (input.phone.length > LIMITS.phone) errors.phone = `Keep this under ${LIMITS.phone} characters.`;
  else if (input.phone && !/^[+\d\s().-]{5,}$/.test(input.phone.trim())) errors.phone = "Use digits, spaces and + only.";

  if (input.instagram.length > LIMITS.instagram) errors.instagram = `Keep this under ${LIMITS.instagram} characters.`;

  if (!oneOf(PLACEMENTS, input.placement)) errors.placement = "Choose one of the placements.";
  if (!oneOf(DESIGN_TYPES, input.designType)) errors.designType = "Choose one of the design types.";
  if (!oneOf(MATERIALS, input.material)) errors.material = "Choose one of the material directions.";
  if (!oneOf(STONES, input.stone)) errors.stone = "Choose one of the stone colours.";
  if (!oneOf(BUDGETS, input.budget)) errors.budget = "Choose one of the budgets.";

  if (description.length < LIMITS.descriptionMin) errors.description = "Describe the piece in a sentence or two.";
  else if (description.length > LIMITS.description) errors.description = `Keep the description under ${LIMITS.description} characters.`;

  if (!input.rights) errors.rights = "Please confirm you have the right to send this material.";
  if (!input.acknowledge) errors.acknowledge = "Please confirm you understand this is a request, not an order.";
  return errors;
}

/** Reads untrusted JSON into the field shape, dropping anything that is not the right type. */
export function readFields(value: unknown): CommissionFields {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const text = (key: keyof CommissionFields) => (typeof v[key] === "string" ? (v[key] as string) : "");
  return {
    name: text("name"),
    email: text("email").trim(),
    phone: text("phone"),
    instagram: text("instagram"),
    placement: text("placement"),
    designType: text("designType"),
    material: text("material"),
    stone: text("stone"),
    budget: text("budget"),
    description: text("description"),
    rights: v.rights === true,
    acknowledge: v.acknowledge === true,
  };
}

/** Whether a file name or type names one of the accepted kinds. The server still reads the bytes. */
export function looksAllowed(name: string, type: string): boolean {
  const lower = name.toLowerCase();
  const extensionOk = FILES.extensions.some((ext) => lower.endsWith(ext));
  // Some phones send no type at all; then the extension decides. A declared type must be one we take.
  return type ? (FILES.mimeTypes as readonly string[]).includes(type) && extensionOk : extensionOk;
}
