import {
  commentManyExpr,
  Into,
  Literal,
  literal,
  multipleSpaces, opt,
  textLiteral,
  valueList
} from "./common"
import P from "parsimmon"

export class Variable {
  constructor(public left: string, public right: Literal) {}
}

export class VariableBinding implements Into {
  constructor(public value: string) {}

  getValue(variables: Variable[]) {
    const bindingValue = variables.find(
      (variable) => variable.left === this.value
    )

    if (bindingValue) {
      return bindingValue.right
    }

    return null
  }
}

export const declareVariableExpr = P.seqMap(
  P.seq(commentManyExpr, multipleSpaces),
  P.string("declare"),
  multipleSpaces,
  P.string("@").then(textLiteral),
  P.seq(multipleSpaces, P.string("="), P.optWhitespace),
  literal.or(valueList),
  function () {
    return new Variable(arguments[3], arguments[5])
  }
).many()

export const variableBindingLiteral = P.seqMap(
  P.string("@"),
  textLiteral,
  function () {
    return new VariableBinding(arguments[1])
  }
)

// const result = variableExpr.tryParse(`
// declare @age = 12
// declare @name = "Linh"
// declare @list = ('linh', 1, 34, 3.4, -45)
// `)
//
// console.log(result)
