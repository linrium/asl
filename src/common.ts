import P from "parsimmon"
import { Variable, VariableBinding, variableBindingLiteral } from "./variable"

export const multipleSpaces = P.newline.or(P.whitespace).many()

export const token = (parser) => parser.skip(P.optWhitespace)

export const word = (str) => P.string(str).thru(token)

export const opt = P.string("").map(() => undefined)

export const wsSepComma = P.seq(multipleSpaces, P.string(","), multipleSpaces)

export const trueValue = word("true").result(true)
export const falseValue = word("false").result(false)

export function takeUntil(end) {
  return P(function (input, i) {
    let words = []

    for (let j = i; j < input.length; j++) {
      words.push(input.charAt(j))

      if (
        words.length >= end.length &&
        words.slice(-end.length).join("") === end
      ) {
        return P.makeSuccess(
          j - end.length,
          words.slice(0, words.length - end.length).join("")
        )
      }
    }

    return P.makeFailure(i, "something went wrong")
  })
}

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

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1)

const deAccent = str => {
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  str = str.replace(/[ìíịỉĩ]/g, "i");
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
  str = str.replace(/[ỳýỵỷỹ]/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A");
  str = str.replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E");
  str = str.replace(/[ÌÍỊỈĨ]/g, "I");
  str = str.replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O");
  str = str.replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U");
  str = str.replace(/[ỲÝỴỶỸ]/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/\s+/g, ' ');

  return str.trim();
}

const formatWord = text => text.split(' ').map(t => capitalizeFirstLetter(deAccent(t))).join('_')

export class AdminArea {
  constructor(public areas: string[]) {
    // this.areas = areas.map(formatWord)
  }

  adminLevel(name: string, len: number) {
    if (/Province|City/gi.test(name) && len === 1) {
      return 'admin-2'
    }

    if (/District|City|Town/gi.test(name)) {
      return 'admin-3'
    }

    if (/Ward|Townlet/gi.test(name)) {
      return 'admin-4'
    }

    return null
  }

  // format() {
  //   return this.areas.map(name => {
  //     const adminLevel = this.adminLevel(name, this.areas.length)
  //     const formattedName = `name_${name.replaceAll(' ', '_')}`
  //
  //     return {
  //       name: name,
  //       formattedName,
  //       data: {
  //         query: `scan ${adminLevel} where ${formattedName} 1 1`
  //       }
  //     }
  //   })
  // }
}

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

export const stringLiteral = P.regexp(/[\u4e00-\u9fa5_a-zA-Z0-9/:.@#?=AĂÂÁẮẤÀẰẦẢẲẨÃẴẪẠẶẬĐEÊÉẾÈỀẺỂẼỄẸỆIÍÌỈĨỊOÔƠÓỐỚÒỒỜỎỔỞÕỖỠỌỘỢUƯÚỨÙỪỦỬŨỮỤỰYÝỲỶỸỴ\s-]*/i)
  .trim(P.optWhitespace)
  .wrap(quote, quote)

export const literal = P.alt(
  stringLiteral,
  numberLiteral,
  trueValue,
  falseValue,
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

export const asAlias = P.seqMap(
  multipleSpaces,
  P.string("as"),
  multipleSpaces,
  textLiteral,
  function () {
    return arguments[3]
  }
)
  .times(0, 1)
  .or(opt)

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

export const objectExpr = P.seq(
  P.seq(P.string("{"), multipleSpaces),

)

export type IntoIntoType = number | string | Array<number | string>

export interface Into {
  getValue(variables: Variable[]): Literal
  // into(): IntoIntoType
}

export interface BaseStatement {
  globalVariables: any
  inject(globalVariables: any): void
  parse(): any
}