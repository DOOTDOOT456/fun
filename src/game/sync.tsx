import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { PlayerState } from "./types";

interface SyncContextValue {
  state: PlayerState[];
  setState: Dispatch<SetStateAction<PlayerState[]>>;
  activePlayerId: string | null;
  setActivePlayerId: (id: string | null) => void;
  pushAction: (playerId: string, fn: (s: PlayerState[]) => void) => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const value = useMemo(() => ({
    state,
    setState,
    activePlayerId,
    setActivePlayerId,
    pushAction,
  }), [state, setState, activePlayerId, setActivePlayerId]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be inside SyncProvider");
  return ctx;
}

export function pushAction(
  _playerId: string,
  fn: (s: PlayerState[]) => void,
): void {
  // Reserved for future optimistic-wrapper use.
  fn([]);
}
