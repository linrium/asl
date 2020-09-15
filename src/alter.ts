import P from "parsimmon"
import { multipleSpaces, opt, stringLiteral, textLiteral, word } from "./common"
import util  from "util"
import { ConditionTree, constraintExpr } from "./condition"

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

export class AlterConstraints {
  constructor(public constraint: ConditionTree[]) {
  }
}

export class AlterStatement {
  constructor(public alterType: AlterType, public constraints: AlterConstraints) {}
}

export const alteration = P.seqMap(
  multipleSpaces,
  alterTypeExpr,
  multipleSpaces,
  constraintExpr.or(opt),
  function() {
    return new AlterStatement(arguments[1], arguments[3])
  }
)

const result = alteration.tryParse(`
alter widget 'test' (
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
