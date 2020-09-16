import P from "parsimmon"
import {
  BaseStatement,
  multipleSpaces,
  opt,
  stringLiteral,
  textLiteral,
} from "./common"
import { constraintExpr, Constraints } from "./condition"

export class AlterType {
  constructor(public type: string, public name: string) {}
}

export const alterTypeExpr = P.seqMap(
  P.string("alter"),
  multipleSpaces,
  textLiteral,
  multipleSpaces,
  stringLiteral,
  function () {
    return new AlterType(arguments[2], arguments[4])
  }
)

export class AlterStatement implements BaseStatement {
  constructor(public alterType: AlterType, public constraints: Constraints) {}

  globalVariables: any

  inject(globalVariables: any): void {
    this.globalVariables = globalVariables
  }

  parse() {
    return this.alterType
  }
}

export const alterExpr = P.seqMap(
  multipleSpaces,
  alterTypeExpr,
  multipleSpaces,
  constraintExpr.or(opt),
  function () {
    return new AlterStatement(arguments[1], new Constraints(arguments[3]))
  }
)

// const result = alteration.tryParse(`
// alter widget 'test' (
//   type = 'metabase'
//   column = 'name'
// )
// `)
//
// console.log(
//   util.inspect(result, {
//     showHidden: false,
//     depth: null,
//     colors: true,
//   })
// )
