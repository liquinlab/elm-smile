# :fork_and_knife: NestedTable API

NestedTable is a chainable, tree-like data structure that allows nested
operations, hierarchical data storage, and flexible path-based access.

## Initialization

```javascript
// Create a new NestedTable with a state machine reference
const table = new NestedTable(stateMachine)
```

The `stateMachine` parameter is required and provides a reference to the state
machine that will be used by the table for operations that need to interact with
the application state.

## Core Methods

### `append(value)`

Adds a new item to the table with the specified value and returns the parent for
chaining.

```javascript
table.append(1) // Adds value 1 to the table
table[0].append(2) // Adds value 2 as a child of the first item
table[0][0].append(3) // Adds value 3 as a child of the second item

// Chain operations
table.append(1).append(2).append(3) // Add multiple top-level items
```

### `ref()`

Creates a new reference to the current node, making it the base node for
relative path calculations.

```javascript
const secondLevel = table[0][0].ref() // Create a reference at table[0][0]
console.log(secondLevel[0].path) // [0] (relative to the new reference)
```

### `pop()`

Removes and returns the last item in the current level.

```javascript
table.append(1)
table.append(2)
const lastItem = table.pop() // Removes and returns the last item (2)
```

## Data Access

### `.data`

Gets or sets the data value of the current node.

```javascript
table.append(1)
console.log(table[0].data) // 1
table[0].data = 5 // Update the value
```

### `.length`

Returns the number of items at the current level.

```javascript
table.append(1)
table.append(2)
console.log(table.length) // 2
```

### `.rows`

Returns an array of all items at the current level.

```javascript
table.append(1)
table.append(2)
console.log(table.rows) // Array of NestedTable nodes containing values 1 and 2
```

## Path Properties

All path properties provide information about the location of a node in the
tree, but in different formats and with different reference points.

### Absolute Path Properties (from root, regardless of reference point)

#### `.path`

Returns an array of indices representing the absolute path from the root to the
current node.

```javascript
const level1 = table[0].ref()
console.log(level1[0].path) // [0, 0] (absolute path)
```

#### `.paths`

Returns the absolute path as a hyphen-separated string.

```javascript
console.log(level1[0].paths) // "0-0"
```

## Data Collection Properties

### `.pathdata`

Returns an array of data values along the relative path from the base node to
the current node.

```javascript
console.log(table[0][0].pathdata) // [1, 2]
```

## Iteration Methods

NestedTable supports standard iteration patterns including:

### `forEach(callback)`

Iterates over each item at the current level.

```javascript
table.append(1)
table.append(2)
table.append(3)

table.forEach((item, index) => {
  console.log(`Item ${index}: ${item.data}`)
})
// Outputs:
// Item 0: 1
// Item 1: 2
// Item 2: 3
```

### `map(callback)`

Maps each item at the current level to a new value.

```javascript
table.append(1)
table.append(2)

const doubled = table.map((item) => item.data * 2)
// doubled contains values [2, 4]
```

### Standard Iteration

NestedTable implements the iterator protocol, allowing it to be used with
for...of loops and the spread operator.

```javascript
table.append(1)
table.append(2)

// Using for...of
for (const item of table) {
  console.log(item.data)
}

// Using spread operator
const items = [...table]
```

## Advanced Usage

### Creating Nested Structures

```javascript
const table = new NestedTable(stateMachine)
table.append(1)
table[0].append(2)
table[0][0].append(3)
table[0][0][0].append(4)

// Access deeply nested data
console.log(table[0][0][0][0].data) // 4
```

### Working with References

```javascript
// Create a reference at a specific level in the tree
const secondLevel = table[0][0].ref()

// The reference forms a new "base" for relative paths
console.log(secondLevel[0].data) // 3
console.log(secondLevel[0].path) // [0]
console.log(secondLevel[0].abspath) // [0, 0, 0]

// Data collection respects the reference point
console.log(secondLevel.subtreedata) // [2, 3, 4]
```

### Array-like Access

The NestedTable behaves like an array, allowing indexed access:

```javascript
table.append(1)
table.append(2)
console.log(table[0].data) // 1
console.log(table[1].data) // 2
```

## Best Practices and Tips

### When to Use References

References (`ref()`) are particularly useful when:

- Working with deeply nested structures to avoid long chains of indices
- Creating localized views of a subtree
- Building recursive algorithms that need a consistent base point

```javascript
// Instead of this:
processDeepData(table[0][1][2][3][0])

// Create a reference and simplify:
const deepRef = table[0][1][2][3].ref()
processDeepData(deepRef[0])
```

### Choosing Between Path Properties

- Use `.path` and `.paths` when you need the location relative to your current
  context
- Use `.abspath` and `.abspaths` when you need global positioning regardless of
  context
- Use string paths (`.paths` and `.abspaths`) when you need to store paths as
  keys or in storage

### Optimizing Data Collection

Choose the right data collection method for your needs:

- `.subtreedata` - When you need all data in a subtree (regardless of structure)
- `.pathdata` - When you need data along a specific path from your reference
  point
- `.abspathdata` - When you need data along the absolute path from root

### Preserving Type Safety

Since the NestedTable wraps primitive values, always use the `.data` property to
access the actual value:

```javascript
// Incorrect:
const sum = table[0] + table[1] // This will concatenate objects, not values

// Correct:
const sum = table[0].data + table[1].data // This uses the actual values
```

### Memory Management

When working with large trees, consider these practices:

1. Create references only when needed and don't keep them longer than necessary
2. Prefer `.forEach()` over creating arrays with `.map()` when you don't need
   the returned array
3. Be mindful of deep nesting as each level creates new objects

## Summary

The NestedTable provides a flexible way to work with hierarchical data, offering
both relative and absolute path access, data collection at different levels, and
the ability to create references that simplify working with deeply nested
structures.

Key features:

- Chainable API for building nested data structures
- Relative and absolute path access
- Data collection along paths or within subtrees
- Reference-based relative paths for simpler access to deep structures
- Array-like behavior with iteration support
