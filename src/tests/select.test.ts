import { selectExpr } from "../select"

describe("select", function() {
  it("should success", async function() {
    const result = selectExpr.tryParse(`
-- nearby sup--motorbike limit 10 where service-han-dg 1 1 point 21.0241349 105.8063289 1000
declare @services = 'han-dg'

select * from tile38
join url on url.id = tile38.id
where 
    tile38_id = 'sup--motorbike'
    -- service in {{@services}} and
    url_id = 'http://localhost:3004/orders'
    within in get('Ho_Chi_Minh_City', 'District_8')
limit 10
    `)

    console.log(result)

    expect(true).toBe(true)
  })
})