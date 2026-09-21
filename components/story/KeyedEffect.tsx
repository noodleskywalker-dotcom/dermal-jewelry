"use client";

import { useEffect, useRef } from "react";
import { effectPlacement, KEY_FRAGMENT, KEY_VERTEX } from "@/lib/story/chroma-key";
import type { StoryEffect } from "@/lib/story";

// Effect footage over the live page. Each frame of the clip is keyed on the GPU, so the canvas has
// real per-pixel opacity: nothing is drawn where there is no sand, and dense sand is fully opaque.
// There is no rectangle, no blend mode, and no fringe. The canvas is moved with a transform so the
// point the sand comes from sits on a point of the page, then grows to cover the viewport.
//
// The clip contains only sand. Nothing here animates the character.
export function KeyedEffect({
  video,
  effect,
  target,
  onUnavailable,
}: {
  /** A prepared, muted, preloaded video element. The owner of the timeline plays it. */
  video: HTMLVideoElement;
  effect: StoryEffect;
  /** Where the sand must first appear, in viewport pixels. */
  target: { x: number; y: number; pictureWidth: number };
  /** Called when this browser cannot key the footage. The caller then skips the story honestly. */
  onUnavailable: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const unavailable = useRef(onUnavailable);
  useEffect(() => {
    unavailable.current = onUnavailable;
  });

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) {
      unavailable.current();
      return;
    }
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, KEY_VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, KEY_FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      unavailable.current();
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const { key, solidAt, clearAt } = effect.key;
    gl.uniform3f(gl.getUniformLocation(program, "key"), key[0], key[1], key[2]);
    gl.uniform1f(gl.getUniformLocation(program, "solidAt"), solidAt);
    gl.uniform1f(gl.getUniformLocation(program, "clearAt"), clearAt);
    gl.uniform1f(gl.getUniformLocation(program, "edge"), effect.edgeFeather);
    const floorAt = gl.getUniformLocation(program, "floorAt");
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let frame = 0;
    let lastTime = -1;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const t = video.currentTime;
      const footage = { width: effect.width, height: effect.height };
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const progress = (t - effect.settleFrom) / (effect.settleTo - effect.settleFrom);
      const place = effectPlacement(footage, effect.emission, viewport, target, progress, target.pictureWidth);
      el.style.transform = `translate(${place.left}px, ${place.top}px) scale(${place.width / effect.width})`;
      el.dataset.time = t.toFixed(2);
      el.dataset.covered = String(t >= effect.coveredAt);
      // Nothing is drawn until the clip has really started, so its first frame never flashes early.
      if (video.readyState < 2 || t === lastTime || (t === 0 && video.paused)) return;
      lastTime = t;
      // The floor opens up over a quarter of a second once the sand reaches it.
      const open = Math.min(1, Math.max(0, (t - effect.floor.until) / 0.25));
      gl.uniform1f(floorAt, effect.floor.y + (1 - effect.floor.y) * open + open * 0.02);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    frame = requestAnimationFrame(draw);
    // The context is left alive: React mounts effects twice in development, and a canvas whose
    // context was deliberately lost cannot be given a working one again.
    return () => {
      cancelAnimationFrame(frame);
      gl.deleteProgram(program);
    };
  }, [video, effect, target]);

  return (
    <canvas
      ref={canvas}
      data-testid="story-effect"
      aria-hidden="true"
      width={effect.width}
      height={effect.height}
      className="pointer-events-none absolute left-0 top-0 origin-top-left will-change-transform"
      style={{ width: effect.width, height: effect.height }}
    />
  );
}
