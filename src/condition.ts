import {
  builtInValueExpr,
  commentExpr,
  Func,
  Into,
  literal,
  Literal,
  LiteralList,
  multipleSpaces,
  Operator,
  operatorExpr,
  opt,
  textLiteral,
  valueList,
  word,
} from "./common"
import P from "parsimmon"
import { Variable, VariableBinding, variableBindingLiteral } from "./variable"

export class ConditionTree {
  constructor(
    public operator: Operator,
    public left: string,
    public right: Literal | LiteralList | Parameter
  ) {}
}

export class Parameter implements Into {
  constructor(public value: Literal | VariableBinding) {}

  getValue(variables: Variable[]) {
    if (this.value instanceof VariableBinding) {
      const value = this.value.getValue(variables)

      return new Parameter(value)
    }

    return this
  }
}

const parameterExpr = P.seqMap(
  P.string("{{"),
  multipleSpaces,
  literal.or(valueList).or(variableBindingLiteral),
  multipleSpaces,
  P.string("}}"),
  function () {
    return new Parameter(arguments[2])
  }
)

/**
 * Where
 */
export type WhereClause = ConditionTree[]

export enum BuiltInFunction {
  Bounds = "bounds",
  Point = "point",
  Object = "object",
  Hash = "hash",
  Get = "get",
}

const funcExpr = P.seqMap(
  P.alt(
    P.string(BuiltInFunction.Bounds),
    P.string(BuiltInFunction.Point),
    P.string(BuiltInFunction.Object),
    P.string(BuiltInFunction.Hash),
    P.string(BuiltInFunction.Get)
  ),
  P.seq(multipleSpaces, P.string("("), multipleSpaces),
  literal
    .trim(P.optWhitespace)
    .sepBy(P.string(","))
    .map((result) => new LiteralList(result))
    .or(valueList)
    .or(variableBindingLiteral)
    .or(builtInValueExpr),
  P.seq(multipleSpaces, P.string(")")),
  multipleSpaces,
  function () {
    return new Literal(new Func(arguments[0], arguments[2]))
  }
)

export const simpleExpr = P.seqMap(
  P.seq(
    multipleSpaces,
    P.string("and").or(P.string(",")).or(opt),
    multipleSpaces
  ),
  textLiteral,
  multipleSpaces,
  operatorExpr,
  multipleSpaces,
  literal
    .or(valueList)
    .or(variableBindingLiteral)
    .or(parameterExpr)
    .or(funcExpr),
  multipleSpaces,
  function () {
    return new ConditionTree(arguments[3], arguments[1], arguments[5])
  }
)
  .or(commentExpr)
  .many()
  .map((result) => result.filter((item) => item instanceof ConditionTree))

export const constraintExpr = word("(")
  .then(simpleExpr)
  .skip(word(")"))
  .map((result) => result)

export class Constraints {
  constructor(public value: ConditionTree[] = []) {}
}
