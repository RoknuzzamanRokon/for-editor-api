import { cn } from "@/lib/utils";

export type AvatarKey =
  | "avatar_1"
  | "avatar_2"
  | "avatar_3"
  | "avatar_4"
  | "avatar_5"
  | "avatar_6"
  | "avatar_7"
  | "avatar_8"
  | "avatar_9"
  | "avatar_10";

export const AVATAR_PRESETS: Array<{
  key: AvatarKey;
  label: string;
  icon: string;
  gradient: string;
}> = [
  { key: "avatar_1", label: "Comet", icon: "bolt", gradient: "from-sky-500 to-blue-700" },
  { key: "avatar_2", label: "Orbit", icon: "radio_button_checked", gradient: "from-indigo-500 to-violet-700" },
  { key: "avatar_3", label: "Nova", icon: "auto_awesome", gradient: "from-fuchsia-500 to-rose-600" },
  { key: "avatar_4", label: "Sage", icon: "eco", gradient: "from-emerald-500 to-green-700" },
  { key: "avatar_5", label: "Amber", icon: "wb_sunny", gradient: "from-amber-400 to-orange-600" },
  { key: "avatar_6", label: "Pulse", icon: "favorite", gradient: "from-rose-500 to-pink-700" },
  { key: "avatar_7", label: "Wave", icon: "water_drop", gradient: "from-cyan-400 to-sky-700" },
  { key: "avatar_8", label: "Flare", icon: "whatshot", gradient: "from-orange-500 to-red-700" },
  { key: "avatar_9", label: "Luna", icon: "dark_mode", gradient: "from-slate-500 to-slate-900" },
  { key: "avatar_10", label: "Pixel", icon: "apps", gradient: "from-teal-500 to-emerald-700" },
];

export function getAvatarPreset(key?: string | null) {
  return AVATAR_PRESETS.find((item) => item.key === key) ?? AVATAR_PRESETS[0];
}

export function AvatarBadge({
  avatarKey,
  size = "md",
  className,
}: {
  avatarKey?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const preset = getAvatarPreset(avatarKey);
  const sizeClass =
    size === "sm" ? "h-9 w-9 text-base" : size === "lg" ? "h-16 w-16 text-2xl" : "h-10 w-10 text-lg";

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full border border-slate-900 bg-gradient-to-br text-slate-950 shadow-lg ring-2 ring-slate-900/55 dark:border-slate-700 dark:text-white dark:ring-slate-800/80",
        preset.gradient,
        sizeClass,
        className,
      )}
    >
      <span className="material-symbols-outlined">{preset.icon}</span>
    </div>
  );
}
