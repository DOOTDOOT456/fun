import { anyApi, type ApiFromModules } from "convex/server";
import type * as users from "../users.js";
import type * as game from "../game.js";

const fullApi: ApiFromModules<{
  users: typeof users;
  game: typeof game;
}> = anyApi as unknown as ApiFromModules<{
  users: typeof users;
  game: typeof game;
}>;

export const api: typeof fullApi = anyApi as unknown as typeof fullApi;
