# Table of content
 - [Variable](#Variable)
	 - [string](#string)
	 - [number](#number)
	 - [object](#object)
	 - [array](#array)
 - [Select](#Select)
	 - [with metabase](#with-metabase)
	 - [metabase](#metabase)
	 - [tile38](#tile38)
 - [Where](#Where)
	 - [equal](#equal)
	 - [not equal](#not-equal)
	 - [greater](#greater)
	 - [greater or equal](#greater-or-equal)
	 - [less](#less)
	 - [less or equal](#less-or-equal)
	 - [in](#in)
	 - [is](#is)
	 - [not in](#not-in)
	 - [query](#query)
 - [Tile38](#Tile38)
	 - [nearby](#nearby)
	 - [intersects](#intersects)
	 - [scan](#scan)
	 - [within](#within)
	 - [search options](#search-options)
	 - [output formats](#output-formats)
	 - [area formats](#area-formats)
 - [Join](#Join)
 - [Create](#Create)
	 - [config](#config)
	 - [widget](#widget)
 - [Update](#Update)
	 - [config](#config)
	 - [widget](#widget)
 - [Drop](#Drop)
	 - [config](#config)
	 - [widget](#widget)
 - [Built-in constants](#Builtin-constants)
	 - [current_bounds](#current_bounds)
	 - [current_points](#current_points)
	 - [current_features](#current_features)
 - Hotkeys
	 - Ctrl + Enter: Run query

# Variables:

## string

**Example**:
```sql
declare @name1 = "Linh"
declare @name2 = 'Linh'
```

## number

**Example**:
```sql
declare @year = 2000
declare @date = 2.9
```

## object

**Example**:
```sql
declare @profile = {
	"name": "Linh",
	"age": 18
}
```

## array

**Example**:
```sql
declare @vietlott = (1, 2, 3, 4)

// with multiple types
declare @something = (1, 2.4, "Linh")
```
# Select statement:

## with metabase

**Example**:
```sql
select * from metabase
where metabase_id = 11106

-- with alias
select * from metabase 300 as card1
where metabase_id = 11106

-- with where query
select * from metbase 300
where
	name = {{'Linh'}}
	age = {{18}}

-- with variable
declare @matabase_card_id = 300
declare @name = "Linh"
declare @age = 18

select * from metabase @matabase_card_id
where
	name = {{@name}}
	age = {{18}}
```

## with url

**Example**:
```sql
select * from url
where url_id = 'https://jsonplaceholder.typicode.com/todos/1'

-- with alias
select * from url as link1
where url_id = 'https://jsonplaceholder.typicode.com/todos/1'

-- with query string
select * from url as link1
where url_id = 'https://jsonplaceholder.typicode.com/todos/1?name=Linh'

-- with where query
select * from url
where 
	url_id = 'https://jsonplaceholder.typicode.com/todos/1'
	name = {{'Linh'}}

-- with variable
declare @url = 'https://jsonplaceholder.typicode.com/todos/1'
declare @name = "Linh"

select * from url as link2
where 
	url_id = @url
	name = {{@name}}
```

## with tile38

**Example**:
```sql
select * from tile38
where 
	tile38_id = 'sup--location'
	query = "nearby sup--location limit 1 points current_points"

-- with alias
select * from tile38 as sp
where 
	tile38_id = 'sup--location'
	query = "nearby sup--location limit 1 bounds current_bound"

-- or with sql style
declare @wheels = (1, 2, 3, 4)

select * from tile38
where 
	tile38_id = 'sup--location'
	speed >= {{70}}
	age <= {{24}}
	nearby in bounds(current_bound) and
	-- this would be equivlent to bounds(30, -110, 40, -100)
	wheels in @wheels
limit 10
```

# Where

## equal

**Example**:
```sql
select * from metabase 11106
where name = "Linh"
```
## not equal

**Example**:
```sql
select * from metabase 11106
where name != "Linh"
```
## greater

**Example**:
```sql
select * from metabase 11106
where age > 18
```
## greater or equal

**Example**:
```sql
select * from metabase 11106
where age >= 18
```
## less

**Example**:
```sql
select * from metabase 11106
where age < 20
```
## less or equal

**Example**:
```sql
select * from metabase 11106
where age <= 20
```
## in

**Example**:
```sql
select * from metabase 11106
where age in (18, 20, 24)
```
## not in

**Example**:
```sql
select * from metabase 11106
where age not in (18, 20, 24)
```
### is

**Example**:
```sql
select * from tile38 'sup--location'
where query is "name=Linh&age=18"
```
## query

**Example**:
```sql
-- with normal style
select * from metabase
where metabase_id = 11106 and name = {{"Linh"}} and age = {{18}}

-- with string style
select * from metabase
where metabase_id = 11106 and query = "name=Linh&age=18"
```

# Tile38

## nearby

**NEARBY** searches a collection for objects that intersect a specified radius.

![Search Nearby](https://github.com/tidwall/tile38/raw/master/.github/images/search-nearby.png =400x)

**Example**:
```sql
select * from tile38
where 
	tile38_id = 'sup--location'
	query is "nearby sup--location limit 1 points current_points"

-- or with sql style
declare @wheels = (1, 2, 3, 4)

select * from tile38
where 
	tile38_id = 'sup--location'
	speed >= 70 or 
	age <= 24 and 
	nearby in bounds(current_bound) and
	wheels in @wheels
limit 10
```

## intersects

**INTERSECTS** searches a collection for objects that intersect a specified bounding area.

![Search Intersects](https://github.com/tidwall/tile38/raw/master/.github/images/search-intersects.png =400x)

**Example**:
```sql
select * from tile38
where 
	tile38_id = 'sup--location'
	query = "intersects sup--location limit 1 points current_points"

-- or with sql style
declare @wheels = (1, 2, 3, 4)

select * from tile38
where 
	tile38_id = 'sup--location'
	speed >= 70 or 
	age <= 24 and 
	intersects in bounds(current_bound) and
	wheels in @wheels
limit 10
```
## scan

**Example**:
```sql
select * from tile38 scan
where 
	tile38_id = 'sup--location'
	query = "scan sup--location limit 1 points current_points"

-- or with sql style
declare @wheels = (1, 2, 3, 4)

select * from tile38 'sup--location'
where 
	speed >= 70 or 
	age <= 24 and 
	scan in bounds(current_bound) and
	wheels in @wheels
```
## within

**WITHIN** searches a collection for objects that are fully contained inside a specified bounding area.

![Search Within](https://github.com/tidwall/tile38/raw/master/.github/images/search-within.png =400x)

**Example**:
```sql
select * from tile38
where 
	tile38_id = 'sup--location'
	query = "within sup--location limit 1 points current_points"

-- or with sql style
declare @wheels = (1, 2, 3, 4)

select * from tile38
where 
	tile38_id = 'sup--location' and
	speed >= 70 or 
	age <= 24 and 
	within = bounds(current_bound) and
	wheels in @wheels
```

## Search options

### Detect *(only tile38)*

The  **`detect`**  may be one of the following values.

-   **`inside`**  is when an object is inside the specified area.
-   **`outside`**  is when an object is outside the specified area.
-   **`enter`**  is when an object that  **was not**  previously in the fence has entered the area.
-   **`exit`**  is when an object that  **was**  previously in the fence has exited the area.
-   **`cross`**  is when an object that  **was not**  previously in the fence has entered  **and**  exited the area

**Example**:
```sql
select * from tile38
where 
	tile38_id = 'sup--location' and
	query = "nearby sup--location detect inside, outside limit 1 points current_points"

-- or with sql style
declare @wheels = (1, 2, 3, 4)

select * from tile38
where 
	tile38_id = 'sup--location' and
	speed >= 70 or 
	age <= 24 and 
	nearby in bounds(current_bound) and
	detect in ('inside', 'outside')
	wheels in @wheels
```

### Sparse *(only tile38)*

This option will distribute the results of a search evenly across the requested area.  
This is very helpful for example; when you have many (perhaps millions) of objects and do not want them all clustered together on a map. Sparse will limit the number of objects returned and provide them evenly distributed so that your map looks clean.  
  
You can choose a value between 1 and 8. The value 1 will result in no more than 4 items. The value 8 will result in no more than 65536. _1=4, 2=16, 3=64, 4=256, 5=1024, 6=4098, 7=16384, 8=65536_

| No Sparsing | Sparse 1 | Sparse 2 | Sparse 3| Sparse 4 | Sparse 5 |
|--|--|--|--|--|--|
| ![Search Within](https://github.com/tidwall/tile38/raw/master/.github/images/sparse-none.png =100x) | ![Search Within](https://github.com/tidwall/tile38/raw/master/.github/images/sparse-1.png =100x)|![Search Within](https://github.com/tidwall/tile38/raw/master/.github/images/sparse-2.png =100x)|![Search Within](https://github.com/tidwall/tile38/raw/master/.github/images/sparse-3.png =100x)|![Search Within](https://github.com/tidwall/tile38/raw/master/.github/images/sparse-4.png =100x)|![Search Within](https://github.com/tidwall/tile38/raw/master/.github/images/sparse-5.png =100x)|

_**Please note that the higher the sparse value, the slower the performance. Also, LIMIT and CURSOR are not available when using SPARSE.**_
**Example**:

```sql
select * from metabase
where metabase_id = 11106 and name = "Linh"
```

### Limit

LIMIT can be used to limit the number of objects returned for a single search request.

**Example**:
```sql
-- with metabase card
select * from metabase
where metabase_id = 11106
limit 100

-- with url
select from url
where 
	name = {{'Linh'}} and 
	url_id = 'https://jsonplaceholder.typicode.com/todos/1'
limit 100


-- with tile38
declare @wheels = (1, 2, 3, 4)

select from tile38 'sup--location'
where 
	speed >= 70 or 
	age <= 24 and 
	within in bounds(current_bound) and
	wheels in @wheels
limit 100
```

## Output formats

**count**  - Total object count sent in the response. When LIMIT or CURSOR are provided, COUNT returns the number of results that would otherwise be sent as objects. When LIMIT is not specified, COUNT totals up all items starting from provided CURSOR position (or zero if a cursor is omitted).  _`LIMIT`  and  `CURSOR`  options are ignored_

**ids**  - A list of IDs belonging to the key. Will not return the objects.

**objects**  - A list of  [GeoJSON](http://geojson.org/)  objects.

**points**  - A list of standard latitude, longitude points.

**bounds**  - A list of  [minimum bounding rectangle](https://en.wikipedia.org/wiki/Minimum_bounding_rectangle).

**hashes**  - A list of  [Geohash](https://en.wikipedia.org/wiki/Geohash).  _Requires a precision of 1 to 22._

## Area formats
Below is a complete list of area formats. These formats are shared by the  [WITHIN](#within)  and  [INTERSECTS](#intersects)  commands.

**Important to note that all coordinates are in Longitude, Latitude order.**

### Bounds 
A bounding box consists of two points. The first being the *southwestern* most point and the second is the *northeastern* most point.

### Objects
[GeoJSON](http://geojson.org/)  is an industry standard format for representing a variety of object types including a point, multipoint, linestring, multilinestring, polygon, multipolygon, geometrycollection, feature, and featurecollection. Tile38 supports all of the standards with these exceptions.

1.  The  `crs`  member is not supported and will be ignored. The  [CRS84/WGS84](https://en.wikipedia.org/wiki/World_Geodetic_System)  projection is assumed.
2.  Any member that is not recognized (including  `crs`) will be ignored.
3.  All coordinates can be 2 or 3 axes. Less than 2 axes or more than 3 will result in a parsing error.

_* All ignored members will not persist._

**Example**:
```sql
-- with query string
select from tile38 'sup--location'
where query is 'within sup--location limit 1 objects {"type":"Polygon","coordinates":[[[-111.9787,33.4411],[-111.8902,33.4377],[-111.895,33.2892],[-111.9739,33.2932],[-111.9787,33.4411]]]}'

-- or with sql style
declare @wheels = (1, 2, 3, 4)
declare @object = {
  "type": "Polygon",
  "coordinates": [
    [
      [
        -111.9787,
        33.4411
      ],
      [
        -111.8902,
        33.4377
      ],
      [
        -111.895,
        33.2892
      ],
      [
        -111.9739,
        33.2932
      ],
      [
        -111.9787,
        33.4411
      ]
    ]
  ]
}

select from tile38 'sup--location'
where 
	speed >= {{70}} and 
	age <= {{24}} and 
	within in objects(@object) and
	wheels in {{@wheels}}
```

### Circle 
A circle with the specified center and radius.

**Example**:
```sql
select * from tile38
where 
	tile38_id = 'sup--location' and
	query = "nearby sup--location points 21.0247374 105.8058525 1000"

-- or with sql style
select * from tile38
where 
	tile38_id = 'sup--location' and
	speed >= 70 or 
	age <= 24 and 
	nearby in points(21.0247374, 105.8058525, 1000)
```

### Tile 
An XYZ tile is rectangle bounding area on earth that is represented by an X, Y coordinate and a Z (zoom) level. Check out [maptiler.org](http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/) for an interactive example.

### Quadkey

A QuadKey used the same coordinate system as an XYZ tile except that the string representation is a string characters composed of 0, 1, 2, or 3. For a detailed explanation checkout [The Bing Maps Tile System](https://msdn.microsoft.com/en-us/library/bb259689.aspx).

### Hash

A [geohash](https://en.wikipedia.org/wiki/Geohash) is a string respresentation of a point. With the length of the string indicating the precision of the point.

**Example**:
```sql
-- hash 9tbnthxzr # this would be equivlent to 'POINT 33.5123 -112.2693'

select * from tile38
where 
	tile38_id = 'sup--location' and
	query = "nearby sup--location hash 9tbnthxzr"

-- or with sql style
select * from tile38
where 
	tile38_id = 'sup--location'
	speed >= 70 or 
	age <= 24 and 
	nearby in hash("9tbnthxzr")
```

# Join

**Syntax**

```sql
-- source_type = ['metabase'|'url'|'tile38']
select from source_type [source]
join source_type on source_type.[column_name] = source_type.[column_name]
where ...
```

**Example**:
```sql
declare @url = 'https://jsonplaceholder.typicode.com/todos/1'
declare @card_id = 11106
declare @name = "Linh"

-- join url with metabase
select * from url @url
join metabase on url.order_id = metabase.order_id
where name = {{@name}} and metabase_id = 11106 and url_id = @url

-- join url with tile38
select * from url
join tile38 on url.order_id = tile38.order_id
where 
	url_id = @url
	tile38_id = 'order'
	name = {{@name}}
	speed >= 70 or 
	age <= 24 and 
	nearby in hash("9tbnthxzr")

-- join metabase with tile38
select * from metabase
join tile38 on metabase.order_id = tile38.order_id
where 
	metabase_id = @card_id
	tile38_id = 'order'
	speed >= {{70}} or 
	age <= {{24}} and 
	nearby in hash("9tbnthxzr")
```

# Create

## config

**Example**:
```sql
create config

-- with alias name
create config 'my-config'
```

## widget

### metabase

**Example**:
```sql
create widget 'test' (
	metabase_id = 11106,
	type = 'metabase',
	column = 'name'
)

-- with alias name
declare @column_name = 'name'

create widget 'my-metabase-card' (
	metabase_id = 11106,
	type = 'metabase',
	column = @column_name'
)
```

### bar chart

**Example**:
```sql
-- with horizontal bar
create widget 'test' (
	metabase_id = 11106,
	type = 'horizontal-bar',
	column = 'name'
)
	
-- with vertical bar
create widget 'test' (
	metabase_id = 11106,
	type = 'vertical-bar',
	column = 'name'
)
```

# Alter

## config

**Example**:
```sql
alter config

-- doesn't support alias name
```

## widget

### metabase

**Example**:
```sql
alter widget 'HSX20XS'(
	type = 'metabase'
	column = 'name'
)

alter widget 'HSX20XS' (
	label = 'Yesss' -- label must be unique
	type = 'metabase'
	column = 'name'
)
```

### bar chart

**Example**:
```sql
-- with horizontal bar
alter widget 'HSX20XS' (
	type = 'horizontal-bar'
	column = 'name'
)
	
-- with vertical bar
alter widget 'HSX20XS' (
	label = 'Yesss' -- label must be unique
	type = 'vertical-bar'
	column = 'name'
)
```

# Drop

## config

**Example**:
```sql
drop config

-- doesn't support alias name
```

## widget

**Syntax**
```sql
-- with id
drop widget 'HSX20XS'

-- with label
-- it will delete all widgets has the label 'Yesss'
drop widget 'Yesss'
```

# Builtin constants

## current_bounds
## current_points
## current_features