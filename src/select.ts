import P from "parsimmon"
import {
  asAlias,
  BaseStatement,
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
  takeUntil,
} from "./common"
import { DocumentKeyword, documentKeywords } from "./keywords"
import { ConditionTree, Parameter, simpleExpr, WhereClause } from "./condition"
import { declareVariableExpr, Variable } from "./variable"

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
  commentManyExpr,
  P.seq(multipleSpaces, P.string("join"), multipleSpaces),
  P.seq(documentKeywords, multipleSpaces, joinOperator, multipleSpaces),
  propertyExpr,
  joinCondition,
  propertyExpr,
  function () {
    return new JoinClause(arguments[3], arguments[5])
  }
)

const whereClause = P.seqMap(
  commentManyExpr,
  P.seq(multipleSpaces, P.string("where"), multipleSpaces),
  simpleExpr,
  function () {
    // console.log('arguments', arguments)
    return arguments[2]
  }
)

/**
 * Field
 */
export class AllField {}

export class ColField {
  constructor(public value: string) {}
}

export type FieldValue = AllField | ColField

export class FieldDefinitionExpression {
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
export class SelectStatement implements BaseStatement {
  public globalVariables: any = {}

  constructor(
    public variables: Variable[],
    public document: Document,
    public fields: FieldDefinitionExpression,
    public joinClause?: JoinClause,
    public whereClause?: WhereClause,
    public limitClause?: LimitClause
  ) {
    // set all variables to where clause
    if (this.whereClause) {
      this.whereClause = this.whereClause.map((it) => {
        return {
          ...it,
          right: it.right.getValue(this.variables),
        }
      })
    }
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

  getAdminLevel(index: number) {
    switch (index) {
      case 0:
        return "admin-2"
      case 1:
        return "admin-3"
      case 2:
        return "admin-4"
    }
  }

  parse() {
    const hasCastTo = this.whereClause.find((where) => where.left === "cast_to")

    if (hasCastTo) {
      const castToValue = hasCastTo.right.value

      return this.tile38Query(castToValue as string)
    }

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
        continue
      }

      if (current.left === "metabase_id") {
        options.params["cardid"] = rightValue
        options.documentName = DocumentKeyword.Metabase
        continue
      }

      if (right instanceof Parameter) {
        if (
          rightValue instanceof LiteralList ||
          rightValue instanceof Literal
        ) {
          options.params[current.left] = rightValue.value
        }
      }

      if (right instanceof Literal || right instanceof LiteralList) {
        options.filters.push(current)
      }
    }

    if (this.limitClause) {
      options.params["limit"] = this.limitClause.value
    }

    return [options]
  }

  tile38Query(castToValue?: string) {
    const options = []
    const head = []
    const tail: any[] = []
    const rawFilters: ConditionTree[] = []
    const filters = {}
    const areas = []
    let metabaseId = ""
    let funcType = ""
    let castFrom = ""

    for (let i = 0; i < this.whereClause.length; i++) {
      const current = this.whereClause[i]

      const right = current.right
      const rightValue = right.value

      if (castToValue) {
        head[1] = "replacement_tile38_id"
      }

      if (current.left === "tile38_id") {
        head[1] = rightValue
      }

      if (current.left === "metabase_id") {
        castFrom = DocumentKeyword.Metabase
        metabaseId = rightValue as string
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

      if (current.left === "scan") {
        head[0] = current.left
        continue
      }

      if (["nearby", "intersects", "within", "search"].includes(current.left)) {
        head[0] = current.left

        const func = rightValue

        if (func instanceof Func) {
          if (func.identifier === "get") {
            func.args.value.forEach((literal, index) => {
              areas.push({
                name: literal.value,
                level: this.getAdminLevel(index),
              })
            })
            continue
          }

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

      if (right instanceof Literal || right instanceof LiteralList) {
        rawFilters.push(current)
      }
    }

    if (this.limitClause) {
      options.push(`limit ${this.limitClause.value}`)
    }

    if (funcType === "current_points") {
      console.log('this.currentPoints', this.currentPoints, tail)
      return this.currentPoints
        .map((item) => {
          const [lat, lon, , text] = item.data[0].data

          const tailCloned = [...tail]
          const currentPointIndex = tailCloned.indexOf("current_points")
          if (currentPointIndex > -1) {
            tailCloned.splice(currentPointIndex, 1, lat, lon)
            // const newTail = tail[currentPointIndex].replace('current_points', `${lat} ${lon}`)

            return {
              data: {
                query: head.concat(options).concat(tailCloned).join(" "),
              },
              documentName: DocumentKeyword.Tile38,
              method: "POST",
              alias: this.document.alias,
              filters: rawFilters,
            }
          }

          return null
        })
        .filter((o) => !!o)
    }

    rawFilters.forEach((data) => {
      if (["metabase_id", "url_id", "cast_to"].includes(data.left)) {
        return
      }

      const rightValue = data.right.value

      if (data.operator === Operator.Equal && typeof rightValue === "string") {
        filters[data.left] = [data.right.value]
      }

      if (rightValue instanceof LiteralList) {
        filters[data.left] = rightValue.value.map((o) => o.value)
      }

      if (typeof rightValue === "number") {
        if (filters[data.left]) {
          filters[data.left][0].numeric.push(data.operator, rightValue)
          return
        }

        filters[data.left] = [
          {
            numeric: [data.operator, rightValue],
          },
        ]
      }
    })

    return [
      {
        data: {
          query: head.concat(options).concat(tail).join(" "),
          filters,
        },
        castTo: castToValue,
        castFrom,
        metabaseId,
        head,
        options,
        tail,
        areas,
        documentName: DocumentKeyword.Tile38,
        method: "POST",
        alias: this.document.alias,
        filters,
        rawFilters,
        setId(id: string) {
          this.head[1] = id
          this.data.query = this.data.query.replace('replacement_tile38_id', id)
        },
      },
    ]
  }
}

export const selectExpr = P.seqMap(
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
  limitExpr.or(opt).or(commentManyExpr),
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
//   within in get('Ho_Chi_Minh_City', 'District_8')
// `
//
// const result = selectExpr.tryParse(testMetabase)
//
// console.log(
//   util.inspect(result, {
//     showHidden: false,
//     depth: null,
//     colors: true,
//   })
// )
