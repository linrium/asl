import P from "parsimmon"
import { multipleSpaces, opt, stringLiteral, textLiteral, word } from "./common"
import util  from "util"
import { ConditionTree, constraintExpr } from "./condition"

export class CreateType {
  constructor(public type: string, public name: string) {}
}

export const createTypeExpr = P.seqMap(
  P.string("create"),
  multipleSpaces,
  textLiteral,
  multipleSpaces,
  stringLiteral,
  function () {
    return new CreateType(arguments[2], arguments[4])
  }
)

export class CreateConstraints {
  constructor(public constraint: ConditionTree[]) {
  }
}

export class CreateStatement {
  constructor(public createType: CreateType, public constraints: CreateConstraints) {}
}

export const creation = P.seqMap(
  multipleSpaces,
  createTypeExpr,
  multipleSpaces,
  constraintExpr.or(opt),
  function() {
    return new CreateStatement(arguments[1], arguments[3])
  }
)

const result = creation.tryParse(`
create widget 'test' (
  type = 'metabase'
  column = 'name'
)
`)

console.log(
  util.inspect(result, {
    showHidden: false,
    depth: null,
    colors: true,
  })
)
