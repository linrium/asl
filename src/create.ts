import P from "parsimmon"
import { BaseStatement, multipleSpaces, opt, stringLiteral, textLiteral, word } from "./common"
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
  constructor(public value: ConditionTree[]) {
  }
}

export class CreateStatement implements BaseStatement {
  globalVariables: any

  constructor(public createType: CreateType, public constraints: CreateConstraints) {}

  inject(globalVariables: any): void {
    this.globalVariables = globalVariables
  }

  parse() {
    if (this.createType.type === 'config') {
      return this.createConfig()
    }

    if (this.createType.type === 'widget') {
      const widgetType = this.constraints.value.find(o => o.left === 'type')

      if (widgetType.right.value === 'metabase') {
        return this.createMetabaseWidget()
      }
    }
  }

  createMetabaseWidget() {
    const data = {}
    const config = {}

    this.constraints.value.forEach(current => {
      if (current.left === 'metabase_id') {
        data[current.left] = current.right.value
      }

      config[current.left] = current.right.value
    })

    return {
      url: 'https://ep.ahamove.com/bi/v1/metabase_generate_iframe_url',
      data,
      config,
      type: 'metabase_widget'
    }
  }

  createBarchartWidget() {

  }

  createConfig() {
    return {
      url: 'https://ep.ahamove.com/ahakepler-api/staging/save-config',
      method: 'POST'
    }
  }
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
