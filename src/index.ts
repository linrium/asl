import { selection } from "./select"

export * from './select'
export * from './drop'
export * from './alter'
export * from './create'
export * from './keywords'

import { alteration } from "./alter"
import { dropExpr } from "./drop"
import { creation } from "./create"

export const compile = selection.or(creation).or(alteration).or(dropExpr)