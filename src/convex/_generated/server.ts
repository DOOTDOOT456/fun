import type { DataModel } from "./dataModel.js";
import type {
  QueryBuilder,
  MutationBuilder,
} from "convex/server";

export type { DataModel, TableNames, Doc, Id } from "./dataModel.js";

export const query: QueryBuilder<DataModel, "public"> =
  null as unknown as QueryBuilder<DataModel, "public">;

export const mutation: MutationBuilder<DataModel, "public"> =
  null as unknown as MutationBuilder<DataModel, "public">;
