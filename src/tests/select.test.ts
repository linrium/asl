import {
  AllField,
  ColField,
  Document,
  FieldDefinitionExpression,
  JoinClause,
  Property,
  selectExpr,
  SelectStatement,
} from "../select"
import { DocumentKeyword } from "../keywords"
import { ConditionTree, Parameter } from "../condition"
import { Literal, Operator } from "../common"
import { Variable } from "../variable"

describe("select", function () {
  it("simple tile38", function () {
    const result = selectExpr.tryParse(`select * from tile38`)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("simple url", function () {
    const result = selectExpr.tryParse(`select * from url`)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Url),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("simple metabase", function () {
    const result = selectExpr.tryParse(`select * from metabase`)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Metabase),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("multiple fields", function () {
    const result = selectExpr.tryParse(`select _id, username from tile38`)

    console.log(result)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression([
        new ColField("_id"),
        new ColField("username"),
      ])
    )
    expect(result).toEqual(expected)
  })

  it("multiple lines", function () {
    const result = selectExpr.tryParse(`
    
    select  *  from  tile38
    
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("the comment above", function () {
    const result = selectExpr.tryParse(`
    -- this is a comment
    select  *  from  tile38
    
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("the comment below", function () {
    const result = selectExpr.tryParse(`
    select  *  from  tile38
    -- this is a comment
    
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("break to new line", function () {
    const result = selectExpr.tryParse(`
    select  
    *  
    from  
    tile38
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("declare variables", function () {
    const result = selectExpr.tryParse(`
    declare @name = "Linh"
    declare @age = 10
    select * from tile38
    `)

    const expected = new SelectStatement(
      [
        new Variable("name", new Literal("Linh")),
        new Variable("age", new Literal(10)),
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField())
    )
    expect(result).toEqual(expected)
  })

  it("simple where", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where tile38_id = "order-stop-sgn-bike" and within in get('Ho_Chi_Minh_City', 'District_5')
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "tile38_id", new Literal("Linh")),
        new ConditionTree(Operator.Equal, "age", new Literal(18)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple lines where", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where 
      name  
      =  
      "Linh"
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [new ConditionTree(Operator.Equal, "name", new Literal("Linh"))]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions with and", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where 
      name = "Linh" and
      age > 10
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "name", new Literal("Linh")),
        new ConditionTree(Operator.Greater, "age", new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions without and", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where 
      name = "Linh"
      age > 10
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "name", new Literal("Linh")),
        new ConditionTree(Operator.Greater, "age", new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions with semicolon", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where 
      name = "Linh",
      age > 10
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "name", new Literal("Linh")),
        new ConditionTree(Operator.Greater, "age", new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions with Chinese semicolon", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where 
      name = "陈俊岭"，
      age = 18
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "name", new Literal("陈俊岭")),
        new ConditionTree(Operator.Equal, "age", new Literal(18)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("condition with comment above", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where 
      -- name = "Linh",
      age > 10
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        // new ConditionTree(Operator.Equal, 'name', new Literal("Linh")),
        new ConditionTree(Operator.Greater, "age", new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("condition with comment above and below", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    where 
      -- this is the above comment,
      age > 10
      -- this is the below comment
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        // new ConditionTree(Operator.Equal, 'name', new Literal("Linh")),
        new ConditionTree(Operator.Greater, "age", new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("comment between select and where", function () {
    const result = selectExpr.tryParse(`
    select * from tile38
    -- this is a comment
    where 
      -- name = "Linh",
      age > 10
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        // new ConditionTree(Operator.Equal, 'name', new Literal("Linh")),
        new ConditionTree(Operator.Greater, "age", new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("conditions with binding values", function () {
    const result = selectExpr.tryParse(`
    declare @name_vi = 'Trần Tuấn Linh'
    declare @name_cn = '陈俊岭'
    declare @age = 18
    
    select * from tile38
    -- this is a comment
    where 
      name_vi = @name_vi and
      name_cn = @name_cn and
      age > @age
    `)

    const expected = new SelectStatement(
      [
        new Variable("name_vi", new Literal("Trần Tuấn Linh")),
        new Variable("name_cn", new Literal("陈俊岭")),
        new Variable("age", new Literal(18)),
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(
          Operator.Equal,
          "name_vi",
          new Literal("Trần Tuấn Linh")
        ),
        new ConditionTree(Operator.Equal, "name_cn", new Literal("陈俊岭")),
        new ConditionTree(Operator.Greater, "age", new Literal(18)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("conditions with binding parameters", function () {
    const result = selectExpr.tryParse(`
    declare @name_vi = 'Trần Tuấn Linh'
    declare @name_cn = '陈俊岭'
    declare @age = 18
    
    select * from tile38
    -- this is a comment
    where 
      name_vi = {{@name_vi}} and
      name_cn = {{@name_cn}} and
      age > {{@age}}
    `)

    const expected = new SelectStatement(
      [
        new Variable("name_vi", new Literal("Trần Tuấn Linh")),
        new Variable("name_cn", new Literal("陈俊岭")),
        new Variable("age", new Literal(18)),
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(
          Operator.Equal,
          "name_vi",
          new Parameter(new Literal("Trần Tuấn Linh"))
        ),
        new ConditionTree(
          Operator.Equal,
          "name_cn",
          new Parameter(new Literal("陈俊岭"))
        ),
        new ConditionTree(
          Operator.Greater,
          "age",
          new Parameter(new Literal(18))
        ),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("conditions with binding parameters and comments", function () {
    const result = selectExpr.tryParse(`
    declare @name_vi = 'Trần Tuấn Linh'
    -- declare @name_cn = '陈俊岭'
    declare @age = 18
    
    select * from tile38
    -- this is a comment
    where 
      name_vi = {{@name_vi}} and
      -- this is another comment
      age > {{@age}}
    `)

    const expected = new SelectStatement(
      [
        new Variable("name_vi", new Literal("Trần Tuấn Linh")),
        // new Variable('name_cn', new Literal('陈俊岭')),
        new Variable("age", new Literal(18)),
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(
          Operator.Equal,
          "name_vi",
          new Parameter(new Literal("Trần Tuấn Linh"))
        ),
        // new ConditionTree(Operator.Equal, 'name_cn', new Parameter(new Literal("陈俊岭"))),
        new ConditionTree(
          Operator.Greater,
          "age",
          new Parameter(new Literal(18))
        ),
      ]
    )

    expect(result).toEqual(expected)
  })

  it("simple join", function () {
    const result = selectExpr.tryParse(`
    declare @name_vi = 'Trần Tuấn Linh'
    declare @age = 18
    
    select * from tile38
    join tile38 on tile38.id = url.id
    where 
      name_vi = {{@name_vi}} and
      age > {{@age}}
    `)

    const expected = new SelectStatement(
      [
        new Variable("name_vi", new Literal("Trần Tuấn Linh")),
        // new Variable('name_cn', new Literal('陈俊岭')),
        new Variable("age", new Literal(18)),
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      new JoinClause(new Property("tile38", "id"), new Property("url", "id")),
      [
        new ConditionTree(
          Operator.Equal,
          "name_vi",
          new Parameter(new Literal("Trần Tuấn Linh"))
        ),
        // new ConditionTree(Operator.Equal, 'name_cn', new Parameter(new Literal("陈俊岭"))),
        new ConditionTree(
          Operator.Greater,
          "age",
          new Parameter(new Literal(18))
        ),
      ]
    )

    expect(result).toEqual(expected)
  })

  it("comment between join clause", function () {
    const result = selectExpr.tryParse(`
    declare @name_vi = 'Trần Tuấn Linh'
    declare @age = 18
    
    select * from tile38
    -- test1
    join tile38 on tile38.id = url.id
    -- test2
    where 
      name_vi = {{@name_vi}} and
      age > {{@age}}
    `)

    const expected = new SelectStatement(
      [
        new Variable("name_vi", new Literal("Trần Tuấn Linh")),
        // new Variable('name_cn', new Literal('陈俊岭')),
        new Variable("age", new Literal(18)),
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      new JoinClause(new Property("tile38", "id"), new Property("url", "id")),
      [
        new ConditionTree(
          Operator.Equal,
          "name_vi",
          new Parameter(new Literal("Trần Tuấn Linh"))
        ),
        // new ConditionTree(Operator.Equal, 'name_cn', new Parameter(new Literal("陈俊岭"))),
        new ConditionTree(
          Operator.Greater,
          "age",
          new Parameter(new Literal(18))
        ),
      ]
    )

    expect(result).toEqual(expected)
  })

  it("join url with metabase", function () {
    const result = selectExpr.tryParse(`
    select * from url
    join metabase on url.user_id = metabase.id
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Url),
      new FieldDefinitionExpression(new AllField()),
      new JoinClause(
        new Property("url", "user_id"),
        new Property("metabase", "id")
      )
    )

    expect(result).toEqual(expected)
  })

  it("join metabase with tile38", function () {
    const result = selectExpr.tryParse(`
    select * from metabase
    join tile38 on metabase.id = tile38.user_id
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Metabase),
      new FieldDefinitionExpression(new AllField()),
      new JoinClause(
        new Property("metabase", "id"),
        new Property("tile38", "user_id")
      )
    )

    expect(result).toEqual(expected)
  })

  it("insert to tile38", function () {
    const result = selectExpr.tryParse(`
    select * from metabase
  where
  metabase_id = 20248 and
  insert_to_tile38 = true
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Metabase),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "metabase_id", new Literal(20248)),
        new ConditionTree(
          Operator.Equal,
          "insert_to_tile38",
          new Literal(true)
        ),
      ]
    )

    console.log("expected", JSON.stringify(result.parse(), null, 2))

    expect(result).toEqual(expected)
  })

  it("cast from metabase to tile38", function () {
    const result = selectExpr.tryParse(`
    select * from metabase
  where
  metabase_id = 20248 and
  cast_to = "tile38" and
  supplier_name = "Lê_Khang" and
  current_stp >= 0 and
  current_stp <= 1 and
  scan in get('')
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Metabase),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "metabase_id", new Literal(20248)),
        new ConditionTree(
          Operator.Equal,
          "insert_to_tile38",
          new Literal(true)
        ),
      ]
    )

    console.log("expected", JSON.stringify(result.parse(), null, 2))

    expect(result).toEqual(expected)
  })

  it("cast from metabase to tile38 within", function () {
    const result = selectExpr.tryParse(`
    select * from metabase
where 
    metabase_id = 19899 and
    cast_to = 'tile38' and
    within in get('Ho_Chi_Minh_City', 'District_11')
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Metabase),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "metabase_id", new Literal(20248)),
        new ConditionTree(
          Operator.Equal,
          "insert_to_tile38",
          new Literal(true)
        ),
      ]
    )

    console.log("expected", JSON.stringify(result.parse(), null, 2))

    expect(result).toEqual(expected)
  })

  it("metabase nearby", function () {
    const result = selectExpr.tryParse(`
select * from tile38
where
    tile38_id = 'sup-ahamove-motorbike' and
    nearby in point(current_points, 1000)
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Metabase),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, "metabase_id", new Literal(20248)),
        new ConditionTree(
          Operator.Equal,
          "insert_to_tile38",
          new Literal(true)
        ),
      ]
    )

    console.log("expected", JSON.stringify(result.parse(), null, 2))

    expect(result).toEqual(expected)
  })
})
