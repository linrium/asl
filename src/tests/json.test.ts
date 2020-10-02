import { JSONParser } from "../json"

describe("json", function () {
  it("simple json", function () {
    let text = `\
{
  "id": "a thing\\\\nice\\tab",
  "another property!"
    : "also cool"
  , "weird formatting is ok too........😂": 123.45e1,
  "": [
    true, false, null,
    "",
    " ",
    {},
    {"": {}}
  ]
}
`
    const result = JSONParser.value.tryParse(text)

    console.log(result)

    expect(true).toBe(true)
  })
})
