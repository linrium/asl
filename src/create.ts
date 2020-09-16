import P from "parsimmon"
import {
  BaseStatement,
  multipleSpaces,
  opt,
  stringLiteral,
  textLiteral,
} from "./common"
import { constraintExpr, Constraints } from "./condition"

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

export class CreateStatement implements BaseStatement {
  globalVariables: any

  constructor(public createType: CreateType, public constraints: Constraints) {}

  inject(globalVariables: any): void {
    this.globalVariables = globalVariables
  }

  parse() {
    if (this.createType.type === "config") {
      return this.createConfig()
    }

    if (this.createType.type === "widget") {
      const widgetType = this.constraints.value.find((o) => o.left === "type")

      if (widgetType.right.value === "metabase") {
        return this.createMetabaseWidget()
      }
    }
  }

  createMetabaseWidget() {
    const data = {}
    const config = {}

    this.constraints.value.forEach((current) => {
      if (current.left === "metabase_id") {
        data["cardid"] = current.right.value
        return
      }

      config[current.left] = current.right.value
    })

    return {
      data,
      config,
      type: "metabase",
    }
  }

  createBarchartWidget() {
    const data = {}
    const config = {}
    let type = ""

    this.constraints.value.forEach((current) => {
      if (current.left === "metabase_id") {
        data[current.left] = current.right.value
        return
      }

      if (current.left === "type") {
        type = current.right.value as string
        return
      }

      config[current.left] = current.right.value
    })

    return {
      config,
      type,
    }
  }

  createConfig() {
    return this.createType
  }
}

export const createExpr = P.seqMap(
  multipleSpaces,
  createTypeExpr,
  multipleSpaces,
  constraintExpr.or(opt),
  function () {
    return new CreateStatement(
      arguments[1],
      new Constraints(arguments[3])
    )
  }
)
//
// const result = creation.tryParse(`
// create widget 'test' (
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
