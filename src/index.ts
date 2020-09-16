export * from "./select"
export * from "./drop"
export * from "./alter"
export * from "./create"
export * from "./keywords"
export * from "./get"

import { selectExpr } from "./select"
import { alterExpr } from "./alter"
import { dropExpr } from "./drop"
import { createExpr } from "./create"
import { getExpr } from "./get"

export const compile = selectExpr
  .or(createExpr)
  .or(alterExpr)
  .or(dropExpr)
  .or(getExpr)
