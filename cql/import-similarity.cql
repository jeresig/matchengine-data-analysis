USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file://FILE" AS line
MATCH (a:Image {id: line.idA, source: line.sourceA}),
(b:Image {id: line.idB, source: line.sourceB})
CREATE (a)-[:match {overlap: toFloat(line.overlap), similarity: toFloat(line.similarity)}]->(b);