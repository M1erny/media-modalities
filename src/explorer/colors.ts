import * as THREE from 'three';
import type { Modality } from '../data/modalities';
import { modeOf } from '../data/derive';
import { FAMILY_CONFIG, MODE_CONFIG } from '../data/taxonomy';

export type CameraPreset = 'isometric' | 'xy' | 'zy' | 'xz';
export type ColorMode = 'mode' | 'family' | 'senses';

/** Blend of the three sensory channels mapped onto a hue wheel (visual cyan, auditory amber, physical magenta). */
export function sensesColor({ visual, auditory, physical }: Modality['senses']): string {
  const angles = { v: 195, a: 42, p: 325 };
  const w = { v: visual ** 1.5, a: auditory ** 1.5, p: physical ** 1.5 };
  const sum = w.v + w.a + w.p || 1;
  const rad = (d: number) => (d * Math.PI) / 180;
  const x = (w.v * Math.cos(rad(angles.v)) + w.a * Math.cos(rad(angles.a)) + w.p * Math.cos(rad(angles.p))) / sum;
  const y = (w.v * Math.sin(rad(angles.v)) + w.a * Math.sin(rad(angles.a)) + w.p * Math.sin(rad(angles.p))) / sum;
  let hue = (Math.atan2(y, x) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return '#' + new THREE.Color().setHSL(hue / 360, 0.85, 0.55).getHexString();
}

export function nodeColor(m: Modality, mode: ColorMode) {
  if (mode === 'family') return FAMILY_CONFIG[m.family].color;
  if (mode === 'senses') return sensesColor(m.senses);
  return MODE_CONFIG[modeOf(m)].color;
}
