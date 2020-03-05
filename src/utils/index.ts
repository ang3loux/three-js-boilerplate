export const randomInRange = (from: number, to: number): number => Math.random() * (to - from) + from;

export const randomHexColor = (): number => Math.random() * 0xffffff;
