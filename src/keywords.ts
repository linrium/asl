import P from "parsimmon"

export const keywordFollowChar = P.alt(
  P.string(" "),
  P.string("\n"),
  P.string(";"),
  P.string("("),
  P.string(")"),
  P.string("\t"),
  P.string(","),
  P.string("="),
  P.eof
)

export enum DocumentKeyword {
  Metabase = 'metabase',
  Url = 'url',
  Tile38 = 'tile38',
  Static = 'static'
}

export const documentKeywords = P.alt(
  P.string("metabase"),
  P.string("url"),
  P.string("tile38")
).map(result => {
  switch (result) {
    case 'metabase':
      return DocumentKeyword.Metabase
    case 'url':
      return DocumentKeyword.Url
    case 'tile38':
      return DocumentKeyword.Tile38
  }
})

export const idKeywords = P.alt(
  P.string('tile38_id'),
  P.string('metabase_id'),
  P.string('url_id')
)

export const tile38Keywords = P.alt(
  P.string("intersects"),
  P.string("within"),
  P.string("search"),
  P.string("scan"),
  P.string("nearby"),
  P.string("points"),
  P.string("bounds"),
  P.string("objects"),
  P.string("hash"),
)

export const sqlKeyword = P.alt(
  P.string("select"),
  P.string("from"),
  P.string("as"),
  P.string("where"),
  P.string("set"),
  P.string("alter"),
  P.string("drop"),
  P.string("update"),
  P.string("create"),
  P.string("on"),
  P.string("join"),
  P.string("limit"),
  P.string("in"),
  P.string("current_date"),
  P.string("current_time"),
  P.string("current_bound"),
  P.string("current_point"),
  P.string("current_feature"),
)

export const keywords = P.alt(
  sqlKeyword,
  idKeywords,
  tile38Keywords
)