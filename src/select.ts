import P from "parsimmon"
import {
  asAlias,
  commentManyExpr,
  CurrentBounds,
  CurrentFeatures,
  CurrentPoints,
  Func,
  Literal,
  LiteralList,
  multipleSpaces,
  Operator,
  opt,
} from "./common"
import { DocumentKeyword, documentKeywords } from "./keywords"
import { Parameter, simpleExpr, WhereClause } from "./condition"
import { declareVariableExpr, Variable } from "./variable"

function takeUntil(end) {
  return P(function (input, i) {
    let words = []

    for (let j = i; j < input.length; j++) {
      words.push(input.charAt(j))

      if (
        words.length >= end.length &&
        words.slice(-end.length).join("") === end
      ) {
        return P.makeSuccess(
          j - end.length,
          words.slice(0, words.length - end.length).join("")
        )
      }
    }

    return P.makeFailure(i, "something went wrong")
  })
}

/**
 * Document
 */
export class Document {
  constructor(public name: DocumentKeyword, public alias?: string) {}
}

export class Property {
  constructor(public document: string, public name: string) {}
}

/**
 * Join
 */
export class JoinClause {
  constructor(public left: Property, public right: Property) {}
}

const propertyExpr = P.seqMap(
  documentKeywords,
  P.string("."),
  P.regexp(/[a-zA-Z_]*/),
  function () {
    return new Property(arguments[0], arguments[2])
  }
)

const joinOperator = P.string("on")

const joinCondition = P.seq(multipleSpaces, P.string("="), multipleSpaces)

const joinClause = P.seqMap(
  P.seq(multipleSpaces, P.string("join"), multipleSpaces),
  P.seq(documentKeywords, multipleSpaces, joinOperator, multipleSpaces),
  propertyExpr,
  joinCondition,
  propertyExpr,
  function () {
    return new JoinClause(arguments[2], arguments[4])
  }
)

const whereClause = P.seqMap(
  P.seq(multipleSpaces, P.string("where"), multipleSpaces),
  simpleExpr,
  function () {
    return arguments[1]
  }
)

/**
 * Field
 */
class AllField {}

class ColField {
  constructor(public value: string) {}
}

export type FieldValue = AllField | ColField

class FieldDefinitionExpression {
  constructor(public value: FieldValue) {}
}

const fieldDefinitionExpr = P.alt(
  P.string("*").map(() => new AllField()),
  takeUntil("from").map((result) =>
    result
      .trim()
      .split(",")
      .map((result) => new ColField(result.trim()))
  )
).map((result) => new FieldDefinitionExpression(result))

/**
 * Limit
 */
export class LimitClause {
  constructor(public value: number) {}
}

export const limitExpr = P.seqMap(
  P.seq(multipleSpaces, P.string("limit"), multipleSpaces),
  P.digits,
  function () {
    return new LimitClause(arguments[1])
  }
)

/**
 * Selection
 */

export class SelectStatement {
  public globalVariables: { [key: string]: any } = {}

  constructor(
    public variables: Variable[],
    public document: Document,
    public fields: FieldDefinitionExpression,
    public joinClause?: JoinClause,
    public whereClause?: WhereClause,
    public limitClause?: LimitClause
  ) {
    // set all variables to where clause
    this.whereClause = this.whereClause.map((it) => {
      return {
        ...it,
        right: it.right.getValue(this.variables),
      }
    })
  }

  inject(globalVariables: any) {
    this.globalVariables = globalVariables
  }

  get currentBounds() {
    const bounds = this.globalVariables.mapbox.getBounds()

    if (bounds) {
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      return [sw.lat, sw.lng, ne.lat, ne.lng]
    }

    return [0, 0, 0, 0]
  }

  get currentPoints() {
    const { layers, layerData, currentPoint } = this.globalVariables
    if (!layers || !layerData) {
      return currentPoint
    }

    return layers
      .map((o, i) => {
        if (/geocoder_layer/.test(o.id)) {
          return layerData[i]
        }

        return null
      })
      .filter((o) => !!o)
  }

  get currentFeatures() {
    if (this.globalVariables.geometry) {
      return this.globalVariables.geometry
    }

    return null
  }

  parse() {
    if (this.document.name === DocumentKeyword.Tile38) {
      return this.tile38Query()
    }

    return this.urlQuery()
  }

  urlQuery() {
    const options = {
      alias: this.document.alias,
      documentName: "url",
      method: "GET",
      url: "",
      params: {},
      filters: [],
    }

    for (let i = 0; i < this.whereClause.length; i++) {
      const current = this.whereClause[i]

      const right = current.right
      const rightValue = right.value

      if (current.left === "url_id") {
        options.url = rightValue as string
        options.documentName = DocumentKeyword.Url
      }

      if (current.left === "metabase_id") {
        options.url = `https://ep.ahamove.com/bi/v1/metabase_card?cardid=${rightValue}`
        options.documentName = DocumentKeyword.Metabase
      }

      if (right instanceof Parameter) {
        if (
          rightValue instanceof LiteralList ||
          rightValue instanceof Literal
        ) {
          options.params[current.left] = rightValue.value
        }
      }

      if (rightValue instanceof Literal || rightValue instanceof LiteralList) {
        options.filters.push(rightValue.getValue(this.variables))
      }
    }

    if (this.limitClause) {
      options.params["limit"] = this.limitClause.value
    }

    return [options]
  }

  tile38Query() {
    const options = []
    const head = []
    const tail: any[] = []
    const filters = []
    let funcType = ""

    for (let i = 0; i < this.whereClause.length; i++) {
      const current = this.whereClause[i]

      const right = current.right
      const rightValue = right.value

      if (current.left === "tile38_id") {
        head[1] = rightValue
      }

      if (right instanceof Parameter) {
        if (current.left === "match") {
          if (rightValue instanceof LiteralList) {
            rightValue.value.forEach((o) => {
              options.push(`match ${o.value}`)
            })
          }

          if (rightValue instanceof Literal) {
            options.push(`match ${rightValue.value}`)
          }

          continue
        }

        if (current.left === "service") {
          if (rightValue instanceof LiteralList) {
            rightValue.value.forEach((v) => {
              options.push(`where service-${v.value} 1 1`)
            })
          }

          if (rightValue instanceof Literal) {
            options.push(`where service-${rightValue.value} 1 1`)
          }

          continue
        }

        if (
          rightValue instanceof Literal &&
          typeof rightValue.value === "number"
        ) {
          switch (current.operator) {
            case Operator.Equal:
              options.push(
                `where ${current.left} ${rightValue.value} ${rightValue.value}`
              )
              break
            case Operator.Greater:
              options.push(`where ${current.left} ${rightValue.value} +inf`)
              break
            case Operator.GreaterOrEqual:
              options.push(`where ${current.left} ${rightValue.value - 1} +inf`)
              break
            case Operator.Less:
              options.push(`where ${current.left} -inf ${rightValue.value}`)
              break
            case Operator.LessOrEqual:
              options.push(`where ${current.left} -inf ${rightValue.value - 1}`)
              break
          }
        }

        if (rightValue instanceof LiteralList) {
          options.push(
            `wherein ${current.left} ${
              rightValue.value.length
            } ${rightValue.value.map((o) => o.value).join(" ")}`
          )
        }
      }

      if (
        ["nearby", "intersects", "within", "scan", "search"].includes(
          current.left
        )
      ) {
        head[0] = current.left

        const func = rightValue

        if (func instanceof Func) {
          tail.push(func.identifier)

          func.args.value.forEach((arg) => {
            // if (arg.value instanceof CurrentPoints) {
            //   return currentPoints.forEach((cp) => tail.push(...cp))
            // }

            if (arg.value instanceof CurrentPoints) {
              funcType = "current_points"
              return tail.push("current_points")
            }

            if (arg.value instanceof CurrentBounds) {
              return tail.push(...this.currentBounds)
            }

            if (arg.value instanceof CurrentFeatures) {
              return tail.push(JSON.stringify(this.currentFeatures))
            }

            tail.push(arg.value)
          })
        }
      }

      if (rightValue instanceof Literal || rightValue instanceof LiteralList) {
        filters.push(rightValue.getValue(this.variables))
      }
    }

    if (this.limitClause) {
      options.push(`limit ${this.limitClause.value}`)
    }

    if (funcType === "current_points") {
      return this.currentPoints
        .map((item) => {
          const [lat, lon, , text] = item.data[0].data

          const currentPointIndex = tail.indexOf("current_points")
          if (currentPointIndex > -1) {
            tail.splice(currentPointIndex, 1, lat, lon)

            return {
              url: "https://tile38.ahamove.com/query",
              data: {
                query: head.concat(options).concat(tail).join(" "),
              },
              documentName: DocumentKeyword.Tile38,
              method: "POST",
              alias: this.document.alias,
              filters,
            }
          }

          return null
        })
        .filter((o) => !!o)
    }

    return [
      {
        url: "https://tile38.ahamove.com/query",
        data: {
          query: head.concat(options).concat(tail).join(" "),
        },
        documentName: DocumentKeyword.Tile38,
        method: "POST",
        alias: this.document.alias,
        filters,
      },
    ]
  }
}

export const selection = P.seqMap(
  P.seq(commentManyExpr, multipleSpaces),
  declareVariableExpr,
  P.seq(multipleSpaces, P.string("select"), multipleSpaces),
  fieldDefinitionExpr,
  P.seq(multipleSpaces, P.string("from"), multipleSpaces),
  P.seq(documentKeywords, multipleSpaces, asAlias).map(
    (result) => new Document(result[0], result[2][0])
  ),
  joinClause.or(opt),
  whereClause.or(opt),
  limitExpr.or(opt),
  P.all,
  function () {
    const variables = arguments[1]

    return new SelectStatement(
      variables,
      arguments[5],
      arguments[3],
      arguments[6],
      arguments[7],
      arguments[8]
    )
  }
)

// const testTile38 = `
// -- test2
// declare @services = 'han-dg'
//
// select * from tile38
// where
//   tile38_id = 'sup--motorbike' and
//   nearby in points(current_points, 1000) and
//   service = {{'han-dg'}} and
//   wheels in {{(2, 4, 5)}} and
//   speed >= {{40}}
// `
//
// const testUrl = `
// declare @url = 'https://jsonplaceholder.typicode.com/comments'
// declare @postId = 1
//
// select * from url
// where
//   url_id = @url and
//   postId = {{@postId}} and
// `
//
// const testMetabase = `
// declare @url = 'https://jsonplaceholder.typicode.com/comments'
// declare @postId = 1
//
// select * from metabase
// where
//   metabase_id = 11106 and
//   postId = {{@postId}} and
// `
//
// const result = selection.tryParse(testMetabase)
//
// console.log(
//   util.inspect(result.urlQuery(), {
//     showHidden: false,
//     depth: null,
//     colors: true,
//   })
// )
