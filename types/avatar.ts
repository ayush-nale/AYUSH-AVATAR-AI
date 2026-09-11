export const EXPRESSIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking", "confused"] as const;
export type Expression = (typeof EXPRESSIONS)[number];
export type AvatarState = "idle" | "listening" | "thinking" | "speaking" | "error";
export type AvatarId = "ayush" | "girl" | "robot";
