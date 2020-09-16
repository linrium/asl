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
    if (this.getType.type === 'config') {
      return this.getConfig()
    }

    return this.getType
  }

  getConfig() {
    const params = {
      name: this.getType.name
    }
    const config = {}

    this.constraints.value.forEach((current) => {
      if (current.left === "config_id") {
        params["id"] = current.right.value
        return
      }

      if (current.left === 'user_id') {
        params["user_id"] = current.right.value
        return
      }

      config[current.left] = current.right.value
    })

    return {
      params,
      config,
      type: "config",
    }
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
