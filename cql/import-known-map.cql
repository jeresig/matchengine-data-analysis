USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file://FILE" AS line
MATCH (a:Artwork {id: line.idA, source: line.sourceA}),
(b:Artwork {id: line.idB, source: line.sourceB})
CREATE (a)-[:known]->(b);