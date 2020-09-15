import P from "parsimmon"
import { multipleSpaces, stringLiteral, textLiteral } from "./common"

export class DropStatement {
  constructor(public type: string, id: string) {
  }
}

export const dropExpr = P.seqMap(
  multipleSpaces,
  P.string('drop'),
  multipleSpaces,
  textLiteral,
  multipleSpaces,
  stringLiteral,
  P.all,
  function() {
    return new DropStatement(arguments[3], arguments[5])
  }
)