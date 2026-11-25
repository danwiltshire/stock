export const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export function getTheme(value) {
  return themes.some((theme) => theme.id === value) ? value : "light";
}
