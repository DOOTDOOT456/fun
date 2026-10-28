export type Team = "cyan" | "magenta";

export const teams: { id: Team; label: string; color: string }[] = [
  { id: "cyan", label: "Cyan", color: "#22d3ee" },
  { id: "magenta", label: "Magenta", color: "#f472b6" },
];

export interface PlayerState {
  id: string;
  name: string;
  avatarUrl: string;
  team: Team;
  x: number;
  z: number;
  health: number;
  ammo: number;
  killed: number;
  lastSeen: number;
}

export const defaultPlayerState = (
  id: string,
  name: string,
  avatarUrl: string,
  team: Team,
): PlayerState => ({
  id,
  name,
  avatarUrl,
  team,
  x: 0,
  z: 0,
  health: 100,
  ammo: 30,
  killed: 0,
  lastSeen: Date.now(),
});
