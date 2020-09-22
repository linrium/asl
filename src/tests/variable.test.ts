import { declareVariableExpr, Variable } from "../variable"
import { Literal, LiteralList } from "../common"

describe("test declare variables", function() {
  it("declare string", function() {
    const result = declareVariableExpr.tryParse(`declare @name_vi = "Trần Tuấn Linh"`)

    const expected = [
      new Variable('name_vi', new Literal('Trần Tuấn Linh'))
    ]
    expect(result).toEqual(expected)
  })

  it("declare Chinese character", function() {
    const result = declareVariableExpr.tryParse(`declare @name = "陈俊岭"`)

    console.log(result)

    const expected = [
      new Variable('name', new Literal('陈俊岭'))
    ]
    expect(result).toEqual(expected)
  })

  it("declare number", function() {
    const result = declareVariableExpr.tryParse(`declare @age = 10`)

    console.log(result)

    const expected = [
      new Variable('age', new Literal(10))
    ]
    expect(result).toEqual(expected)
  })

  it("declare array of Vietnamese characters", function() {
    const result = declareVariableExpr.tryParse(`declare @animals = ('Con chó', 'Con mèo', 'Con cá vàng')`)

    const expected = [
      new Variable('animals', new LiteralList([
        new Literal('Con chó'),
        new Literal('Con mèo'),
        new Literal('Con cá vàng'),
      ]))
    ]
    expect(result).toEqual(expected)
  })

  it("declare array of Chinese characters", function() {
    const result = declareVariableExpr.tryParse(`declare @animals = ('小猫', '小狗', '仓鼠', '金鱼')`)

    const expected = [
      new Variable('animals', new LiteralList([
        new Literal('小猫'),
        new Literal('小狗'),
        new Literal('仓鼠'),
        new Literal('金鱼')
      ]))
    ]
    expect(result).toEqual(expected)
  })

  it("declare array of number", function() {
    const result = declareVariableExpr.tryParse(`declare @wheels = (4, 6, 8, 12)`)

    const expected = [
      new Variable('wheels', new LiteralList([
        new Literal(4),
        new Literal(6),
        new Literal(8),
        new Literal(12)
      ]))
    ]
    expect(result).toEqual(expected)
  })

  it("with comments", function() {
    const result = declareVariableExpr.tryParse(`
    -- this is an comment
    -- this is another comment
    declare @wheels = (4, 6, 8, 12)
    `)

    const expected = [
      new Variable('wheels', new LiteralList([
        new Literal(4),
        new Literal(6),
        new Literal(8),
        new Literal(12)
      ]))
    ]
    expect(result).toEqual(expected)
  })

  // it("multiple declares", function() {
  //   const result = declareVariableExpr.tryParse(`
  //   declare @wheels = (4, 6, 8, 12)
  //   declare @name = '陈俊岭'
  //   `)
  //
  //   console.log('result', result)
  //
  //   const expected = [
  //     new Variable('wheels', new LiteralList([
  //       new Literal(4),
  //       new Literal(6),
  //       new Literal(8),
  //       new Literal(12)
  //     ])),
  //   ]
  //   expect(result).toEqual(expected)
  // })
})