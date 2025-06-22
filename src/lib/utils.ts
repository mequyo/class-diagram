import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { KeyboardEvent } from "react"
import { Vec } from "@/app/types";
import { vec } from "./vec";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function onKeysPressed(e: KeyboardEvent, keys: string, f: () => void) {
  const current = e.key.toLowerCase();
  const arr = keys.toLowerCase().split(" ");

  for (const key of arr) {
    switch (key) {
      case "space": if (current != " ") return; else continue;
      case "ctrl": if (!e.ctrlKey) return; else continue;
      case "alt": if (!e.altKey) return; else continue;
      case "meta": if (!e.metaKey) return; else continue;
      default: if (current != key) return; else continue;
    }
  }

  f();
}

export function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type Side = "top" | "bottom" | "right" | "left";

export const bezier = (start: HTMLDivElement, end: HTMLDivElement, offset: Vec): [Vec, Vec, Vec, Vec] => {
  const possible: { from: Side, to: Side }[] = [];

  const srect = start.getBoundingClientRect();
  const erect = end.getBoundingClientRect();

  const s: Record<Side, Vec> = {
    top: { x: srect.left + srect.width / 2, y: srect.top },
    right: { x: srect.right, y: srect.top + srect.height / 2 },
    bottom: { x: srect.left + srect.width / 2, y: srect.bottom },
    left: { x: srect.left, y: srect.top + srect.height / 2 }
  }

  const e: Record<Side, Vec> = {
    top: { x: erect.left + erect.width / 2, y: erect.top },
    right: { x: erect.right, y: erect.top + erect.height / 2 },
    bottom: { x: erect.left + erect.width / 2, y: erect.bottom },
    left: { x: erect.left, y: erect.top + erect.height / 2 }
  }

  if (s.top.y > e.right.y && e.right.x < s.top.x) possible.push({ from: "top", to: "right" });
  if (s.top.y > e.bottom.y) possible.push({ from: "top", to: "bottom" });
  if (s.top.y > e.left.y && e.left.x > s.top.x) possible.push({ from: "top", to: "left" });

  if (s.bottom.y < e.right.y && e.right.x < s.bottom.x) possible.push({ from: "bottom", to: "right" });
  if (s.bottom.y < e.top.y) possible.push({ from: "bottom", to: "top" });
  if (s.bottom.y < e.left.y && e.left.x > s.bottom.x) possible.push({ from: "bottom", to: "left" });

  if (s.right.x < e.top.x && e.top.y > s.right.y) possible.push({ from: "right", to: "top" });
  if (s.right.x < e.bottom.x && e.bottom.y < s.right.y) possible.push({ from: "right", to: "bottom" });
  if (s.right.x < e.left.x) possible.push({ from: "right", to: "left" });

  if (s.left.x > e.right.x) possible.push({ from: "left", to: "right" });
  if (s.left.x > e.bottom.x && e.bottom.y < s.left.y) possible.push({ from: "left", to: "bottom" });
  if (s.left.x > e.top.x && e.top.y > s.left.y) possible.push({ from: "left", to: "top" });

  const normals: Record<Side, Vec> = {
    top: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    bottom: { x: 0, y: 1 },
    left: { x: -1, y: 0 }
  };

  let min = {
    from: { x: 0, y: 0, normal: { x: 0, y: 0 } },
    to: { x: 0, y: 0, normal: { x: 0, y: 0 } },
    score: Infinity,
    fromDot: 0,
    toDot: 0
  };

  for (const combination of possible) {
    const from = combination.from as keyof typeof s;
    const to = combination.to as keyof typeof e;
    const a = s[from] as Vec;
    const b = e[to] as Vec;
    const v = vec.sub(a, b);

    const fromDot = Math.abs(vec.dot(v, normals[combination.from]));
    const toDot = Math.abs(vec.dot(v, normals[combination.to]));

    const score = 3 * Math.abs(0.5 - fromDot) + Math.abs(0.5 - toDot);

    if (score < min.score) min = {
      from: { x: a.x, y: a.y, normal: normals[combination.from] },
      to: { x: b.x, y: b.y, normal: normals[combination.to] },
      score, fromDot, toDot
    }; // Assign new min and remember a and b
  }

  const d = vec.abs(vec.sub(min.to, min.from));

  return [
    vec.add(min.from, offset),
    vec.sum(min.from, offset, vec.mul(min.from.normal, d)),
    vec.sum(min.to, offset, vec.mul(min.to.normal, d)),
    vec.add(min.to, offset)
  ]
}