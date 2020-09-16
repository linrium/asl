import P from "parsimmon"
import {
  BaseStatement,
  multipleSpaces,
  opt,
  stringLiteral,
  textLiteral,
} from "./common"
import { constraintExpr, Constraints } from "./condition"

export class DropType {
  constructor(public type: string, public name: string) {}
}

export const dropTypeExpr = P.seqMap(
  P.string("drop"),
  multipleSpaces,
  textLiteral,
  multipleSpaces,
  stringLiteral,
  function () {
    return new DropType(arguments[2], arguments[4])
  }
)

export class DropStatement implements BaseStatement {
  constructor(public dropType: DropType, public constraints: Constraints) {}

  globalVariables: any

  inject(globalVariables: any): void {
    this.globalVariables = globalVariables
  }

  parse() {
    const options: any = {}
    const config: any = {}

    if (Array.isArray(this.constraints.value)) {
      this.constraints.value.forEach(current => {
        switch (current.left) {
          case 'type':
            options.type = current.right.value
            break
          case 'key':
            options.key = current.right.value
            break
          default:
            config[current.left] = current.right.value
        }
      })
    }

    return {
      ...this.dropType,
      options,
      config,
    }
  }
}

export const dropExpr = P.seqMap(
  multipleSpaces,
  dropTypeExpr,
  multipleSpaces,
  constraintExpr.or(opt),
  function () {
    return new DropStatement(arguments[1], new Constraints(arguments[3]))
  }
)

// const result = dropation.tryParse(`
// drop widget 'test' (
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
