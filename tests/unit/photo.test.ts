import { describe, expect, it } from "vitest";
import { fitWithin, MAX_FILE_BYTES, PhotoError, sniffFormat, validatePhotoBytes } from "@/lib/studio/photo";

const bytes = (...b: number[]) => new Uint8Array(b);
const text = (s: string) => new TextEncoder().encode(s);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0);
const WEBP = new Uint8Array([...text("RIFF"), 0, 0, 0, 0, ...text("WEBP")]);
const HEIC = new Uint8Array([0, 0, 0, 0x18, ...text("ftypheic")]);

describe("sniffFormat", () => {
  it("recognises supported formats by their bytes", () => {
    expect(sniffFormat(PNG)).toBe("png");
    expect(sniffFormat(JPEG)).toBe("jpeg");
    expect(sniffFormat(WEBP)).toBe("webp");
  });

  it("recognises HEIC and SVG so they can be refused clearly", () => {
    expect(sniffFormat(HEIC)).toBe("heic");
    expect(sniffFormat(text(`<svg xmlns="http://www.w3.org/2000/svg"></svg>`))).toBe("svg");
    expect(sniffFormat(text(`<?xml version="1.0"?><svg></svg>`))).toBe("svg");
  });

  it("does not trust a file that only claims to be an image", () => {
    expect(sniffFormat(text("this is not an image"))).toBe("unknown");
  });
});

describe("validatePhotoBytes", () => {
  const code = (fn: () => unknown) => {
    try {
      fn();
    } catch (e) {
      return e instanceof PhotoError ? e.code : "other";
    }
    return "ok";
  };

  it("accepts a supported photo", () => {
    expect(validatePhotoBytes(1000, PNG)).toBe("png");
  });

  it("refuses oversized, empty, HEIC, SVG and unknown files", () => {
    expect(code(() => validatePhotoBytes(MAX_FILE_BYTES + 1, PNG))).toBe("too-large");
    expect(code(() => validatePhotoBytes(0, PNG))).toBe("empty");
    expect(code(() => validatePhotoBytes(1000, HEIC))).toBe("heic");
    expect(code(() => validatePhotoBytes(1000, text("<svg></svg>")))).toBe("unsupported");
    expect(code(() => validatePhotoBytes(1000, text("hello")))).toBe("unsupported");
  });
});

describe("fitWithin", () => {
  it("leaves small photos alone and limits the longest edge of large ones", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(4096, 3072)).toEqual({ width: 2048, height: 1536 });
    expect(fitWithin(3000, 6000)).toEqual({ width: 1024, height: 2048 });
  });
});
