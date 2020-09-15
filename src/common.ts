import P from "parsimmon"
import { Variable, VariableBinding, variableBindingLiteral } from "./variable"

export const multipleSpaces = P.newline.or(P.whitespace).many()

export const token = (parser) => parser.skip(P.optWhitespace)

export const word = (str) => P.string(str).thru(token)

export const opt = P.string("")

export const wsSepComma = P.seq(multipleSpaces, P.string(","), multipleSpaces)

export const asAlias = P.seqMap(
  multipleSpaces,
  P.string("as"),
  multipleSpaces,
  P.letters,
  function () {
    return arguments[3]
  }
)
  .times(0, 1)
  .or(opt)

/**
 * Comment
 */
export class Comment {
  constructor(public message) {}
}

export const commentExpr = P.seqMap(
  multipleSpaces,
  P.string("--"),
  P.takeWhile((c) => c !== "\n"),
  multipleSpaces,
  function () {
    return new Comment(arguments[2])
  }
)

export const commentManyExpr = commentExpr.many()

/**
 * Literal
 */
export class CurrentTime {
  constructor() {}
}

const currentTimeExpr = P.string('current_time')

export class CurrentDate {
  constructor() {}
}

const currentDateExpr = P.string('current_date')

export class CurrentBounds {
  constructor() {}
}

const currentBounds = P.string('current_bounds')

export class CurrentPoints {
  constructor() {}
}

const currentPoints = P.string('current_points')

export class CurrentFeatures {
  constructor() {}
}

const currentFeatures = P.string('current_features')

export const builtInValueExpr = P.alt(
  currentTimeExpr,
  currentDateExpr,
  currentBounds,
  currentPoints,
  currentFeatures
)

export class Func {
  constructor(public identifier: string, public args: LiteralList) {}
}

export type LiteralValue =
  | null
  | number
  | string
  | CurrentTime
  | CurrentDate
  | CurrentBounds
  | CurrentPoints
  | CurrentFeatures
  | Func
  | VariableBinding

export class Literal implements Into {
  constructor(public value: LiteralValue) {}

  getValue(variables: Variable[]): Literal {
    return this
  }
}

export class LiteralList implements Into {
  constructor(public value: Literal[]) {}

  getValue(variables: Variable[]): LiteralList {
    return this
  }
}

export const numberLiteral = P.regexp(/[+-]?([0-9]*[.])?[0-9]+/).map(Number)

export const quote = P.alt(P.string("'"), P.string('"'))

export const textLiteral = P.regexp(/[a-zA-Z0-9-_]*/)

export const stringLiteral = P.regexp(/[a-zA-Z0-9/:.@#_?=-]*/)
  .trim(P.optWhitespace)
  .wrap(quote, quote)

export const literal = P.alt(
  stringLiteral,
  numberLiteral,
  P.string("current_date").map(() => new CurrentDate()),
  P.string("current_time").map(() => new CurrentTime()),
  P.string("current_bounds").map(() => new CurrentBounds()),
  P.string("current_points").map(() => new CurrentPoints()),
  P.string("current_features").map(() => new CurrentFeatures())
).map((result) => new Literal(result))

export const valueList = word("(")
  .then(literal.sepBy(word(",")))
  .skip(word(")"))
  .map(result => new LiteralList(result))

export enum Operator {
  Not = "not",
  Equal = "=",
  NotEqual = "<>",
  Greater = ">",
  GreaterOrEqual = ">=",
  Less = "<",
  LessOrEqual = "<=",
  In = "in",
}

export const operatorExpr = P.alt(
  P.string(Operator.Not),
  P.string(Operator.Equal),
  P.string(Operator.NotEqual),
  P.string(Operator.GreaterOrEqual),
  P.string(Operator.Greater),
  P.string(Operator.LessOrEqual),
  P.string(Operator.Less),
  P.string(Operator.In)
)

export type IntoIntoType = number | string | Array<number | string>

export interface Into {
  getValue(variables: Variable[]): Literal
  // into(): IntoIntoType
}