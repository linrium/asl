import { alterExpr } from "../alter"

describe("alter", function() {
  it("simple", function() {
    const result = alterExpr.tryParse(`alter config 'tet'  
    `)

    console.log(result)

    expect(true).toBe(true)
  })
})