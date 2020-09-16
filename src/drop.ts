import P from "parsimmon"
import { BaseStatement, multipleSpaces, stringLiteral, textLiteral } from "./common"

export class DropStatement implements BaseStatement {
  constructor(public type: string, public id: string) {
  }

  globalVariables: any

  inject(globalVariables: any): void {
    this.globalVariables = globalVariables
  }

  parse() {
    return {
      type: this.type,
      id: this.id
    }
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