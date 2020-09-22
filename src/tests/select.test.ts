import { AllField, Document, FieldDefinitionExpression, selectExpr, SelectStatement } from "../select"
import { DocumentKeyword } from "../keywords"
import { ConditionTree, Parameter } from "../condition"
import { Literal, Operator } from "../common"
import { Variable } from "../variable"
import util from 'util'

describe("tile38", function() {
  it("simple", function() {
    const result = selectExpr.tryParse(`select * from tile38`)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
    )
    expect(result).toEqual(expected)
  })

  it("multiple lines", function() {
    const result = selectExpr.tryParse(`
    
    select  *  from  tile38
    
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
    )
    expect(result).toEqual(expected)
  })

  it("the comment above", function() {
    const result = selectExpr.tryParse(`
    -- this is a comment
    select  *  from  tile38
    
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
    )
    expect(result).toEqual(expected)
  })

  it("the comment below", function() {
    const result = selectExpr.tryParse(`
    select  *  from  tile38
    -- this is a comment
    
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
    )
    expect(result).toEqual(expected)
  })

  it("break to new line", function() {
    const result = selectExpr.tryParse(`
    select  
    *  
    from  
    tile38
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
    )
    expect(result).toEqual(expected)
  })

  it("declare variables", function() {
    const result = selectExpr.tryParse(`
    declare @name = "Linh"
    declare @age = 10
    select * from tile38
    `)

    const expected = new SelectStatement(
      [
        new Variable('name', new Literal("Linh")),
        new Variable('age', new Literal(10))
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
    )
    expect(result).toEqual(expected)
  })

  it("simple where", function() {
    const result = selectExpr.tryParse(`
    select * from tile38
    where name = "Linh"
    `)

    const expected = new SelectStatement(
      [],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, 'name', new Literal("Linh"))
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple lines where", function() {
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
      [
        new ConditionTree(Operator.Equal, 'name', new Literal("Linh"))
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions with and", function() {
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
        new ConditionTree(Operator.Equal, 'name', new Literal("Linh")),
        new ConditionTree(Operator.Greater, 'age', new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions without and", function() {
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
        new ConditionTree(Operator.Equal, 'name', new Literal("Linh")),
        new ConditionTree(Operator.Greater, 'age', new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions with semicolon", function() {
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
        new ConditionTree(Operator.Equal, 'name', new Literal("Linh")),
        new ConditionTree(Operator.Greater, 'age', new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("multiple conditions with Chinese semicolon", function() {
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
        new ConditionTree(Operator.Equal, 'name', new Literal("陈俊岭")),
        new ConditionTree(Operator.Equal, 'age', new Literal(18)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("condition with comment above", function() {
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
        new ConditionTree(Operator.Greater, 'age', new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("condition with comment above and below", function() {
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
        new ConditionTree(Operator.Greater, 'age', new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("comment between select and where", function() {
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
        new ConditionTree(Operator.Greater, 'age', new Literal(10)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("conditions with binding values", function() {
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
        new Variable('name_vi', new Literal('Trần Tuấn Linh')),
        new Variable('name_cn', new Literal('陈俊岭')),
        new Variable('age', new Literal(18))
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, 'name_vi', new Literal("Trần Tuấn Linh")),
        new ConditionTree(Operator.Equal, 'name_cn', new Literal("陈俊岭")),
        new ConditionTree(Operator.Greater, 'age', new Literal(18)),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("conditions with binding parameters", function() {
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
        new Variable('name_vi', new Literal('Trần Tuấn Linh')),
        new Variable('name_cn', new Literal('陈俊岭')),
        new Variable('age', new Literal(18))
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, 'name_vi', new Parameter(new Literal("Trần Tuấn Linh"))),
        new ConditionTree(Operator.Equal, 'name_cn', new Parameter(new Literal("陈俊岭"))),
        new ConditionTree(Operator.Greater, 'age', new Parameter(new Literal(18))),
      ]
    )
    expect(result).toEqual(expected)
  })

  it("conditions with binding parameters and comments", function() {
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
        new Variable('name_vi', new Literal('Trần Tuấn Linh')),
        // new Variable('name_cn', new Literal('陈俊岭')),
        new Variable('age', new Literal(18))
      ],
      new Document(DocumentKeyword.Tile38),
      new FieldDefinitionExpression(new AllField()),
      undefined,
      [
        new ConditionTree(Operator.Equal, 'name_vi', new Parameter(new Literal("Trần Tuấn Linh"))),
        // new ConditionTree(Operator.Equal, 'name_cn', new Parameter(new Literal("陈俊岭"))),
        new ConditionTree(Operator.Greater, 'age', new Parameter(new Literal(18))),
      ]
    )

    expect(result).toEqual(expected)
  })
})