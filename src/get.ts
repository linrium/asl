import P from "parsimmon"
import {
  BaseStatement,
  multipleSpaces,
  opt,
  stringLiteral,
  textLiteral,
} from "./common"
import { constraintExpr, Constraints } from "./condition"

export class GetType {
  constructor(public type: string, public name: string) {}
}

export const getTypeExpr = P.seqMap(
  P.string("get"),
  multipleSpaces,
  textLiteral,
  multipleSpaces,
  stringLiteral,
  function () {
    return new GetType(arguments[2], arguments[4])
  }
)

export class GetStatement implements BaseStatement {
  globalVariables: any

  constructor(public getType: GetType, public constraints: Constraints) {}

  inject(globalVariables: any): void {
    this.globalVariables = globalVariables
  }

  parse() {
    return this.getType
  }
}

export const getExpr = P.seqMap(
  multipleSpaces,
  getTypeExpr,
  multipleSpaces,
  constraintExpr.or(opt),
  function () {
    return new GetStatement(arguments[1], new Constraints(arguments[3]))
  }
)
