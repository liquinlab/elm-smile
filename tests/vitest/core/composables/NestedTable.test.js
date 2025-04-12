import { describe, it, expect, beforeEach, vi } from 'vitest'
import NestedTable from '@/core/composables/NestedTable'
import seedrandom from 'seedrandom'
import config from '@/core/config'

// Mock must be defined inline without external variables
vi.mock('@/core/config', () => ({
  default: {
    maxStepperRows: 5000,
  },
}))

/**
 * Recursively validates the parent-child relationships in a NestedTable structure.
 * Verifies that each node's _parent field correctly points to its parent node.
 *
 * @param {NestedTable} node - The node to start validation from
 * @param {NestedTable|null} expectedParent - The expected parent of this node (null for root)
 * @param {string} path - Current path string for error reporting
 * @returns {void} - Throws an error if any inconsistency is found
 */
function validateTreeConsistency(node, expectedParent = null, path = 'root') {
  // Verify this node's parent reference
  if (node._parent?._id !== expectedParent?._id && node._parent !== expectedParent) {
    // console.log('Node ID:', node._id)
    // console.log('Actual parent ID:', node._parent?._id)
    // console.log('Expected parent ID:', expectedParent?._id)
    throw new Error(
      `Parent reference is incorrect at path ${path}. Expected parent: ${expectedParent?._id}, Actual parent: ${node._parent?._id}`
    )
  }

  // Recursively check children
  for (let i = 0; i < node.length; i++) {
    const childPath = `${path}[${i}]`

    // Child's parent should be this node
    validateTreeConsistency(node[i], node, childPath)
  }
}

describe('NestedTable', () => {
  let table
  let sm
  beforeEach(() => {
    //mock the state machine
    sm = {
      //push_table: vi.fn(),
    }
    //table = createNestedTable(sm)
    table = new NestedTable(sm)
  })

  describe('Interactive tests', () => {
    it('should create a new table with chainable methods', () => {
      table.append(1)
      expect(table[0].data).toBe(1)
      expect(table[0].pathdata).toEqual([1])
      expect(table[0].path).toEqual([0])
      expect(table[0].paths).toBe('0')

      table[0].append(2)
      expect(table[0][0].data).toBe(2)
      expect(table[0][0].pathdata).toEqual([1, 2])
      expect(table[0][0].path).toEqual([0, 0])
      expect(table[0][0].paths).toBe('0-0')

      table[0][0].append(3)
      expect(table[0][0][0].data).toBe(3)
      expect(table[0][0][0].pathdata).toEqual([1, 2, 3])
      expect(table[0][0][0].path).toEqual([0, 0, 0])
      expect(table[0][0][0].paths).toBe('0-0-0')

      table[0][0][0].append(4)
      expect(table[0][0][0][0].data).toBe(4)
      expect(table[0][0][0][0].pathdata).toEqual([1, 2, 3, 4])
      expect(table[0][0][0][0].path).toEqual([0, 0, 0, 0])
      expect(table[0][0][0][0].paths).toBe('0-0-0-0')

      // Test absolute paths from pointers
      const secondLevel = table[0][0]
      //console.log(secondLevel._baseNode)
      expect(secondLevel[0].data).toBe(3)
      expect(secondLevel[0].pathdata).toEqual([1, 2, 3])
      expect(secondLevel[0].path).toEqual([0, 0, 0])
      expect(secondLevel[0].paths).toBe('0-0-0')

      // expect(secondLevel[0][0].data).toBe(4)
      expect(secondLevel[0][0].path).toEqual([0, 0, 0, 0])
      expect(secondLevel[0][0].paths).toBe('0-0-0-0')

      // The original path still returns the absolute path
      expect(table[0][0][0].path).toEqual([0, 0, 0])
      expect(table[0][0][0][0].path).toEqual([0, 0, 0, 0])
    })
  })

  describe('Basic Table Operations', () => {
    it('should create an empty table', () => {
      expect(table.length).toBe(0)
      // test the the rows are empty
      expect(table.rows).toEqual([])
      expect(table[0]).toBeUndefined()
      expect(table[1]).toBeUndefined()
      // Verify that attempting to call methods on undefined throws TypeError
      expect(() => table[0].append(1)).toThrow(TypeError)
    })

    it('should allow iterating on the .rows', () => {
      table.append(1)
      table.append(2)
      table.append(3)
      table.rows.forEach((row, index) => {
        expect(row.data).toBe(index + 1)
      })
      expect(table.length).toBe(3)
      expect(table[0].data).toBe(1)
    })

    it('should allow iterating on the .rows with a for loop', () => {
      table.append(1)
      table.append(2)
      table.append(3)
      let index = 0
      for (const row of table.rows) {
        expect(row.data).toBe(index + 1)
        index++
      }
      expect(index).toBe(3) // verify we iterated over all items
    })

    it('should return path from root to leaf when accessing nested indices', () => {
      const table = new NestedTable(sm)
      const trials = table.append([{ id: 1, block: 'A' }])

      trials[0].append([{ type: 'stim', value: 'X' }])

      // Check that array indexing returns the path data
      const path = trials[0][0].pathdata
      expect(Array.isArray(path)).toBe(true)
      expect(path).toHaveLength(2)
      expect(path[0]).toEqual({ id: 1, block: 'A' })
      expect(path[1]).toEqual({ type: 'stim', value: 'X' })

      // Test that table operations still work
      trials[0][0].append([{ response: 'yes' }])

      // Check deeper path
      const deepPath = trials[0][0][0].pathdata
      expect(deepPath).toHaveLength(3)
      expect(deepPath[0]).toEqual({ id: 1, block: 'A' })
      expect(deepPath[1]).toEqual({ type: 'stim', value: 'X' })
      expect(deepPath[2]).toEqual({ response: 'yes' })
    })

    it('should return just data values with datarows', () => {
      // check basic data
      table.append(1)
      table.append(2)
      table.append(3)
      expect(table.rowsdata).toEqual([1, 2, 3])

      // Test with structured data
      const newTable = new NestedTable(sm)
      newTable.append({ id: 1, value: 'A' })
      newTable.append({ id: 2, value: 'B' })
      expect(newTable.rowsdata).toEqual([
        { id: 1, value: 'A' },
        { id: 2, value: 'B' },
      ])
    })

    it('should create a new table with chainable methods', () => {
      // Basic properties and methods
      expect(table).toBeDefined()
      expect(table.rows).toBeDefined()
      expect(Array.isArray(table.rows)).toBe(true)
      expect(table.rowsdata).toBeDefined()
      expect(Array.isArray(table.rowsdata)).toBe(true)
      expect(table).toHaveProperty('data') // this is undefined at first
      expect(table.length).toBe(0)

      // Iteration and spreading
      expect(table[Symbol.iterator]).toBeInstanceOf(Function)
      expect(table[Symbol.isConcatSpreadable]).toBe(true)

      // building methods
      expect(table.append).toBeInstanceOf(Function)
      expect(table.indexOf).toBeInstanceOf(Function)
      expect(table.slice).toBeInstanceOf(Function)
      expect(table.forEach).toBeInstanceOf(Function)
      expect(table.range).toBeInstanceOf(Function)
      expect(table.repeat).toBeInstanceOf(Function)

      // not implemented yet
      expect(table.zip).toBeInstanceOf(Function)
      expect(table.outer).toBeInstanceOf(Function)
      expect(table.interleave).toBeInstanceOf(Function)
      expect(table.partition).toBeInstanceOf(Function)
      expect(table.shuffle).toBeInstanceOf(Function)
      expect(table.sample).toBeInstanceOf(Function)

      // expect(table.push).toBeInstanceOf(Function)
      expect(table.print).toBeInstanceOf(Function)
      expect(table.pop).toBeInstanceOf(Function)

      expect(table.setReadOnly).toBeInstanceOf(Function)
    })

    it('should provide array-like access to rows', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const t1 = table.append(trials)

      // Test length
      expect(t1.length).toBe(2)

      // Test array indexing
      expect(t1[0].data).toEqual(trials[0])
      expect(t1[1].data).toEqual(trials[1])

      // Test iteration
      const items = [...t1]
      expect(items).toEqual(trials)

      // Test array methods
      expect(t1.indexOf(trials[0])).toBe(0)
      expect(t1.slice(0, 1)).toEqual([trials[0]])

      // Test spread operator
      const spreadArray = [...t1]
      expect(spreadArray).toEqual(trials)
    })

    it('should create an empty table when table() is called without data operations', () => {
      const t1 = table

      // Test empty state
      expect(t1.length).toBe(0)
      expect(t1.rows).toHaveLength(0)
      expect([...t1]).toHaveLength(0)
      expect(t1.slice()).toHaveLength(0)
      expect(t1.indexOf({})).toBe(-1)

      // Test array-like properties still work
      expect(t1[0]).toBeUndefined()
      expect(t1[1]).toBeUndefined()
      expect(t1[-1]).toBeUndefined()
    })
  })

  describe('Tree Consistency Validation', () => {
    it('should correctly validate parent-child relationships', () => {
      // Create a simple hierarchical structure
      table.append(1)
      table[0].append(2)
      table[0][0].append(3)

      // This should not throw an error
      validateTreeConsistency(table)

      // Check each level individually
      validateTreeConsistency(table[0], table)
      validateTreeConsistency(table[0][0], table[0])
      validateTreeConsistency(table[0][0][0], table[0][0])
    })

    it('should detect incorrect parent references', () => {
      // Create a structure with a deliberate error
      table.append(1)
      table[0].append(2)
      table[0][0].append(3)

      // Manually break the parent reference
      table[0][0]._parent = table // This is wrong, should be table[0]

      // This should throw an error
      expect(() => validateTreeConsistency(table)).toThrow(/Parent reference is incorrect/)
    })
  })

  describe('Nested Table Operations', () => {
    it('should support creating nested tables', () => {
      table.append({ id: 1 })
      const childTable = table[0]
      childTable.append({ nested: true })
      expect(table[0][0].data).toEqual({ nested: true })
    })

    it('should maintain nested table references when using forEach', () => {
      table.append({ id: 1 })
      table.forEach((row) => {
        row.append({ nested: true })
      })
      expect(table[0][0].data).toEqual({ nested: true })
    })

    it('should store nested tables in the row', () => {
      table.range(2)
      const childTable = table[0].range(3)
      expect(table[0]).toBeDefined()
      expect(table[0]).toBe(childTable)
    })

    it('should overwrite existing nested table when creating a new one', () => {
      table.range(2)
      const firstChildTable = table[0].range(2)
      const secondChildTable = table[0].range(3)

      // The second table should replace the first
      expect(firstChildTable.length).toBe(3)
      expect(secondChildTable.length).toBe(3)
      expect(table[0]).toBe(secondChildTable)
    })

    it('should support deeply nested tables', () => {
      table.range(3)
      const level1Table = table[0].range(3)
      const level2Table = level1Table[0].range(3)
      const level3Table = level2Table[0].range(3)

      expect(table.rows).toHaveLength(3)
      expect(level1Table.rows).toHaveLength(3)
      expect(level2Table.rows).toHaveLength(3)
      expect(level3Table.rows).toHaveLength(3)

      level3Table[1].append({ color: 'red', shape: 'triangle' })
      expect(level3Table[1][0].data).toEqual({ color: 'red', shape: 'triangle' })
    })
  })

  describe('append()', () => {
    it('should allow building complex tables through multiple append operations', () => {
      // Create a table with multiple append operations
      const t1 = table
        .append([{ color: 'red', shape: 'triangle' }])
        .append([{ color: 'blue', shape: 'square' }])
        .append([{ color: 'green', shape: 'circle' }])
        .append([{ color: 'yellow', shape: 'star' }])

      // Test the final state
      expect(t1.rows).toHaveLength(4)
      expect(t1.rowsdata).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
        { color: 'yellow', shape: 'star' },
      ])

      // Test array-like access still works
      expect(t1.length).toBe(4)
      expect(t1[0].data).toEqual({ color: 'red', shape: 'triangle' })
      expect(t1[3].data).toEqual({ color: 'yellow', shape: 'star' })
      expect([...t1]).toHaveLength(4)
      expect(t1.slice(1, 3)).toEqual([
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])
    })

    it('should allow appending another table', () => {
      const table1 = new NestedTable(sm)
      table1.append({ color: 'red', shape: 'triangle' })

      const table2 = new NestedTable(sm)
      table2.append({ color: 'blue', shape: 'square' })

      // Append table2 to table1
      table1.append(table2)

      // Verify length and content
      expect(table1.length).toBe(2)
      expect(table1.rowsdata).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ])

      // verify that the parent-child relationship is correct
      validateTreeConsistency(table1)

      // Verify that modifying table2 doesn't affect table1 (copy not reference)
      table2.append({ color: 'green', shape: 'circle' })
      expect(table1.length).toBe(2) // Should still be 2
      expect(table2.length).toBe(2) // Should now be 2
      expect(table2.rowsdata).toEqual([
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])

      // verify the paths are correct
      expect(table1[0].paths).toEqual('0')
      expect(table1[1].paths).toEqual('1')

      // verify that paths are correct
      expect(table1[0].path).toEqual([0])
      expect(table1[0].paths).toEqual('0')
      expect(table1[0].path).toEqual([0])
      expect(table1[0].paths).toEqual('0')
      expect(table1[0].pathdata).toEqual([{ color: 'red', shape: 'triangle' }])
    })

    it('should allow appending mixed single objects and arrays', () => {
      const table1 = table

      table1.append({ color: 'red', shape: 'triangle' })
      expect(table1.rows).toHaveLength(1)
      expect(table1[0].data).toEqual({ color: 'red', shape: 'triangle' })

      // Should still work with arrays after appending single object
      table1.append([{ color: 'blue', shape: 'square' }])
      expect(table1.rows).toHaveLength(2)
      expect(table1[1].data).toEqual({ color: 'blue', shape: 'square' })

      // Should work with another single object
      table1.append({ color: 'green', shape: 'circle' })
      expect(table1.rows).toHaveLength(3)
      expect(table1[2].data).toEqual({ color: 'green', shape: 'circle' })
    })

    it('should append sequentially to the non-nested table', () => {
      //table = new NestedTable(sm)
      table.append(1)
      table.append(2)
      table.append(3)
      expect(table.length).toBe(3)
      expect(table[0].data).toBe(1)
      expect(table[1].data).toBe(2)
      expect(table[2].data).toBe(3)
    })

    it('should append sequentially to the non-nested table when stored in a local variable', () => {
      const el = table.append(1)
      el.append(2)
      el.append(3)

      // check original table was modified
      expect(table.length).toBe(3)
      expect(table[0].data).toBe(1)
      expect(table[1].data).toBe(2)
      expect(table[2].data).toBe(3)

      // check el was modified
      expect(el.length).toBe(3)
      expect(el[0].data).toBe(1)
      expect(el[1].data).toBe(2)
      expect(el[2].data).toBe(3)
    })

    it('should allow appending in a chain', () => {
      table.append(1).append(2).append(3)
      expect(table).toBeDefined()
      expect(table.length).toBe(3)
      expect(table[0]).toBeDefined()
      expect(table[1]).toBeDefined()
      expect(table[2]).toBeDefined()
      expect(table[0].data).toBe(1)
      expect(table[1].data).toBe(2)
      expect(table[2].data).toBe(3)
    })

    it('should create an empty table and you should append to it', () => {
      table = new NestedTable(sm)
      //expect(table.rows).toEqual([])
      expect(table.length).toBe(0)

      const trials = table.append([{ id: 1, block: 'A' }])
      //console.log(trials[0])
      expect(trials[0]).toBeDefined()

      expect(table.length).toBe(1)
      const trials2 = table.append([{ id: 1, block: 'A' }])
      expect(trials).toEqual(trials2)
      expect(table.length).toBe(2)
      //console.log(trials[1])
      expect(trials[1]).toBeDefined()
    })

    it('should allow appending single structured items', () => {
      const table = new NestedTable(sm)
      table.append({ value: 1 })
      expect(table.length).toBe(1)
      expect(table[0].data).toEqual({ value: 1 })
    })

    it('should append multiple items as array', () => {
      const items = [{ value: 1 }, { value: 2 }, { value: 3 }]
      table.append(items)
      expect(table.rows).toHaveLength(3)
      expect(table.rowsdata).toEqual(items)
      expect(table.length).toBe(3)
      let index = 0
      for (const row of table.rowsdata) {
        expect(row).toEqual({ value: index + 1 })
        index++
      }
    })

    it('should throw error when appending table would exceed safety limit', () => {
      const smallTable = table.append([{ color: 'blue', shape: 'square' }])

      expect(() => {
        const largeTable = table.append(Array(config.maxStepperRows + 1).fill({ color: 'red', shape: 'circle' }))
        smallTable.append(largeTable)
      }).toThrow(/Cannot append \d+ rows as it exceeds the safety limit of \d+/)
    })

    it('should be chainable with other methods', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table1 = table
        .append(trials)
        .repeat(2)
        .append([{ color: 'green', shape: 'circle' }])

      expect(table1.rows).toHaveLength(5)
      expect(table1.rowsdata).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])
    })
  })

  describe('pop()', () => {
    it('should remove and return the last item', () => {
      const table1 = table.append([{ value: 1 }, { value: 2 }, { value: 3 }])
      const lastItem = table1.pop()
      expect(lastItem.data).toEqual({ value: 3 })
      expect(table1.rows).toHaveLength(2)
      expect(table1.rowsdata).toEqual([{ value: 1 }, { value: 2 }])
    })

    it('should return undefined if the table is empty', () => {
      const table1 = table

      const lastItem = table1.pop()
      expect(lastItem).toBeUndefined()
      expect(table1.rows).toHaveLength(0)
      expect(table1.rowsdata).toEqual([])
    })
  })

  describe('range()', () => {
    it('should create a range of rows', () => {
      const table1 = table.range(10)
      expect(table1.rows).toHaveLength(10)
      expect(table1.length).toBe(10)

      for (let i = 0; i < 10; i++) {
        expect(table1[i].data).toEqual({ range: i })
      }
    })

    it('should allow custom field name in range', () => {
      const table1 = table.range(3, 'index')
      expect(table1.rows).toHaveLength(3)

      for (let i = 0; i < 3; i++) {
        expect(table1[i].data).toEqual({ index: i })
      }

      const table2 = table.range(3, 'smileisgreat')
      expect(table2.rows).toHaveLength(3)

      for (let i = 0; i < 3; i++) {
        expect(table2[i].data).toEqual({ smileisgreat: i })
      }
    })

    it('should throw error if range is called with non-positive number', () => {
      expect(() => {
        table.range(0)
      }).toThrow('range() must be called with a positive integer')

      expect(() => {
        table.range(-1)
      }).toThrow('range() must be called with a positive integer')
    })

    it('should throw error if the number of elements is create the the max table size', () => {
      expect(() => {
        table.range(config.maxStepperRows + 1)
      }).toThrow(/Cannot append \d+ rows as it exceeds the safety limit of \d+/)
    })
  })

  describe('repeat()', () => {
    it('should repeat trials n times', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table1 = table.append(trials).repeat(3)

      expect(table1.rows).toHaveLength(6)
      expect(table1.rowsdata).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ])
      validateTreeConsistency(table1)
    })

    it('should handle empty table', () => {
      const table1 = table.repeat(10)
      expect(table1.length).toBe(0)
      expect(table1.rowsdata).toEqual([])
    })

    it('should handle n <= 0', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table1 = table.append(trials).repeat(0)
      expect(table1.rows).toHaveLength(2)
      expect(table1.rowsdata).toEqual(trials)

      // reset table
      table = new NestedTable(sm)
      const table2 = table.append(trials).repeat(-1)
      expect(table2.rows).toHaveLength(2)
      expect(table2.rowsdata).toEqual(trials)
    })

    it('should be chainable with other methods', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table1 = table
        .append(trials)
        .repeat(2)
        .append([{ color: 'green', shape: 'circle' }])

      expect(table1.rows).toHaveLength(5)
      expect(table1.rowsdata).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])
    })
  })

  describe('zip()', () => {
    it('should zip columns with equal lengths', () => {
      const trials = {
        shape: ['circle', 'square', 'triangle'],
        color: ['red', 'green', 'blue'],
      }

      table.zip(trials)

      expect(table.rows).toHaveLength(3)
      expect(table.rows[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table.rows[1].data).toEqual({ shape: 'square', color: 'green' })
      expect(table.rows[2].data).toEqual({ shape: 'triangle', color: 'blue' })
    })

    it('should throw error by default when columns have different lengths', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        table.zip(trials)
      }).toThrow(
        'All columns must have the same length when using zip(). Specify a method (loop, pad, last) to handle different lengths.'
      )
    })

    it('should pad with specified value when using pad method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.zip(trials, { method: 'pad', padValue: 'unknown' })

      expect(table1.rows).toHaveLength(3)
      expect(table1.rows[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table1.rows[1].data).toEqual({ shape: 'square', color: 'green' })
      expect(table1.rows[2].data).toEqual({ shape: 'unknown', color: 'blue' })
    })

    it('should handle null padValue', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const tableNull = table.zip(trials, { method: 'pad', padValue: null })
      expect(tableNull.rows).toHaveLength(3)
      expect(tableNull.rows[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(tableNull.rows[1].data).toEqual({ shape: 'square', color: 'green' })
      expect(tableNull.rows[2].data).toEqual({ shape: null, color: 'blue' })
    })

    it('should throw error when padValue is undefined', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        table.zip(trials, { method: 'pad' })
      }).toThrow('padValue is required when using the pad method')
    })

    it('should loop shorter columns', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.zip(trials, { method: 'loop' })

      expect(table1.rows).toHaveLength(3)
      expect(table1.rows[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table1.rows[1].data).toEqual({ shape: 'square', color: 'green' })
      expect(table1.rows[2].data).toEqual({ shape: 'circle', color: 'blue' })

      // Test with more loops
      const trials2 = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue', 'yellow', 'purple'],
      }

      table = new NestedTable(sm)
      const table2 = table.zip(trials2, { method: 'loop' })

      expect(table2.rows).toHaveLength(5)
      expect(table2.rows[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table2.rows[1].data).toEqual({ shape: 'square', color: 'green' })
      expect(table2.rows[2].data).toEqual({ shape: 'circle', color: 'blue' })
      expect(table2.rows[3].data).toEqual({ shape: 'square', color: 'yellow' })
      expect(table2.rows[4].data).toEqual({ shape: 'circle', color: 'purple' })

      // Test with multiple columns of different lengths
      const trials3 = {
        shape: ['circle'],
        color: ['red', 'green', 'blue'],
        size: ['small', 'medium'],
      }

      table = new NestedTable(sm)
      const table3 = table.zip(trials3, { method: 'loop' })

      expect(table3.rows).toHaveLength(3)
      expect(table3.rows[0].data).toEqual({ shape: 'circle', color: 'red', size: 'small' })
      expect(table3.rows[1].data).toEqual({ shape: 'circle', color: 'green', size: 'medium' })
      expect(table3.rows[2].data).toEqual({ shape: 'circle', color: 'blue', size: 'small' })
    })

    it('should handle non-array values as single-element arrays', () => {
      const trials = {
        shape: 'circle',
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.zip(trials, { method: 'loop' })

      expect(table1.length).toBe(3)
      expect(table1[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table1[1].data).toEqual({ shape: 'circle', color: 'green' })
      expect(table1[2].data).toEqual({ shape: 'circle', color: 'blue' })
    })

    it('should handle multiple non-array values', () => {
      const trials = {
        shape: 'circle',
        color: 'red',
        size: ['small', 'medium'],
      }

      const table1 = table.zip(trials, { method: 'loop' })

      expect(table1.length).toBe(2)
      expect(table1[0].data).toEqual({ shape: 'circle', color: 'red', size: 'small' })
      expect(table1[1].data).toEqual({ shape: 'circle', color: 'red', size: 'medium' })
    })

    it('should repeat last value when using last method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.zip(trials, { method: 'last' })

      expect(table1.rows).toHaveLength(3)
      expect(table1.rows[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table1.rows[1].data).toEqual({ shape: 'square', color: 'green' })
      expect(table1.rows[2].data).toEqual({ shape: 'square', color: 'blue' })
    })

    it('should throw error for invalid method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        table.zip(trials, { method: 'invalid' })
      }).toThrow('Invalid method: invalid. Must be one of: loop, pad, last')
    })

    it('should throw error for invalid input', () => {
      expect(() => {
        table.zip(null)
      }).toThrow('zip() requires an object with arrays as values')

      expect(() => {
        table.zip({})
      }).toThrow('zip() requires at least one column')
    })

    it('should throw error when zip would exceed safety limit', () => {
      // Create arrays that would exceed the limit when zipped
      const trials = {
        shape: Array(config.maxStepperRows + 1).fill('circle'),
        color: ['red', 'green'],
      }

      expect(() => {
        table.zip(trials)
      }).toThrow(/zip\(\) would generate \d+ rows, which exceeds the safety limit of \d+/)
    })

    it('should be chainable with other methods', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table.zip(trials).append([{ shape: 'triangle', color: 'blue' }])

      expect(table1.rows).toHaveLength(3)
      expect(table1[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table1[1].data).toEqual({ shape: 'square', color: 'green' })
      expect(table1[2].data).toEqual({ shape: 'triangle', color: 'blue' })
    })
  })

  describe('forEach()', () => {
    it('should handle forEach with no return value', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      table.append(trials).forEach((row) => {
        row.color = 'green' // Direct mutation
      })

      expect(table.rows).toHaveLength(2)
      expect(table[0].data).toEqual({ color: 'green', shape: 'triangle' })
      expect(table[1].data).toEqual({ color: 'green', shape: 'square' })
    })

    it('should allow modifying rows with forEach', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      table.append(trials).forEach((row, index) => {
        if (index === 0) {
          return { ...row, color: 'green' }
        }
        return row
      })

      expect(table.length).toBe(2)
      expect(table[0].data).toEqual({ color: 'green', shape: 'triangle' })
      expect(table[1].data).toEqual({ color: 'blue', shape: 'square' })
    })

    it('should allow forEach to be chained with other methods', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table
        .outer(trials)
        .forEach((row) => ({ ...row, size: 'medium' }))
        .append([{ shape: 'triangle', color: 'blue', size: 'large' }])

      expect(table1.length).toBe(5)
      //table1.print()
      expect(table1[0].data).toEqual({ shape: 'circle', color: 'red', size: 'medium' })
      expect(table1[1].data).toEqual({ shape: 'circle', color: 'green', size: 'medium' })
      expect(table1[2].data).toEqual({ shape: 'square', color: 'red', size: 'medium' })
      expect(table1[3].data).toEqual({ shape: 'square', color: 'green', size: 'medium' })
      expect(table1[4].data).toEqual({ shape: 'triangle', color: 'blue', size: 'large' })
    })
  })

  describe('interleave()', () => {
    it('should interleave two tables of equal length', () => {
      const table1 = new NestedTable(sm)
      table1.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      const table2 = new NestedTable(sm)
      table2.append([
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
      ])

      table1.interleave(table2)

      expect(table1.rows).toHaveLength(4)
      expect(table1.rows[0].data).toEqual({ id: 1, value: 'a' })
      expect(table1.rows[1].data).toEqual({ id: 3, value: 'c' })
      expect(table1.rows[2].data).toEqual({ id: 2, value: 'b' })
      expect(table1.rows[3].data).toEqual({ id: 4, value: 'd' })
    })

    it('should correctly set the parents of nested tables', () => {
      const table1 = new NestedTable(sm)
      table1.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      const table2 = new NestedTable(sm)
      table2.append([
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
      ])

      validateTreeConsistency(table1)
      validateTreeConsistency(table2)

      table1.interleave(table2)

      // Verify all elements in the interleaved result point to table1 as their parent
      expect(table1.rows).toHaveLength(4)
      table1.rows.forEach((row) => {
        expect(row._parent).toBeDefined()
        expect(table1._id).toBeDefined()
        expect(row._parent._id).toBe(table1._id)
        //console.log(row._parent._id, table1._id)
      })

      // Verify paths are sequential
      expect(table1.rows[0]._path).toEqual([0])
      expect(table1.rows[1]._path).toEqual([1])
      expect(table1.rows[2]._path).toEqual([2])
      expect(table1.rows[3]._path).toEqual([3])

      // Verify the original data is preserved in correct order
      expect(table1.rows[0].data).toEqual({ id: 1, value: 'a' })
      expect(table1.rows[1].data).toEqual({ id: 3, value: 'c' })
      expect(table1.rows[2].data).toEqual({ id: 2, value: 'b' })
      expect(table1.rows[3].data).toEqual({ id: 4, value: 'd' })
    })

    it('should interleave tables of different lengths', () => {
      const table1 = new NestedTable(sm)
      table1.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ])
      const table2 = new NestedTable(sm)
      table2.append([
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ])

      table1.interleave(table2)

      expect(table1.length).toBe(5)
      expect(table1.rows[0].data).toEqual({ id: 1, value: 'a' })
      expect(table1.rows[1].data).toEqual({ id: 4, value: 'd' })
      expect(table1.rows[2].data).toEqual({ id: 2, value: 'b' })
      expect(table1.rows[3].data).toEqual({ id: 5, value: 'e' })
      expect(table1.rows[4].data).toEqual({ id: 3, value: 'c' })

      validateTreeConsistency(table1)
    })

    it('should interleave with an array input', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      const array = [
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
      ]

      table1.interleave(array)

      expect(table1.rows).toHaveLength(4)
      expect(table1[0].data).toEqual({ id: 1, value: 'a' })
      expect(table1[1].data).toEqual({ id: 3, value: 'c' })
      expect(table1[2].data).toEqual({ id: 2, value: 'b' })
      expect(table1[3].data).toEqual({ id: 4, value: 'd' })
    })

    it('should interleave with a single object', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      table1.interleave({ id: 3, value: 'c' })

      expect(table1.rows).toHaveLength(3)
      expect(table1[0].data).toEqual({ id: 1, value: 'a' })
      expect(table1[1].data).toEqual({ id: 3, value: 'c' })
      expect(table1[2].data).toEqual({ id: 2, value: 'b' })
    })

    it('should throw error for invalid input', () => {
      const table1 = table.append([{ id: 1, value: 'a' }])

      expect(() => {
        table1.interleave(null)
      }).toThrow('interleave() requires an array, table, or object as input')

      expect(() => {
        table1.interleave(undefined)
      }).toThrow('interleave() requires an array, table, or object as input')

      expect(() => {
        table1.interleave('not an object')
      }).toThrow('interleave() requires an array, table, or object as input')
    })

    it('should throw error when result would exceed safety limit', () => {
      const table1 = new NestedTable(sm)
      table1.append(Array(config.maxStepperRows - 1).fill({ value: 'a' }))
      const table2 = new NestedTable(sm)
      table2.append([{ value: 'b' }, { value: 'c' }])

      expect(() => {
        table1.interleave(table2)
      }).toThrow(/interleave\(\) would generate \d+ rows, which exceeds the safety limit/)
    })

    it('should be chainable with other methods', () => {
      const table1 = new NestedTable(sm)
      table1.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      const table2 = new NestedTable(sm)
      table2.append([
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
      ])

      const result = table1
        .interleave(table2)
        .forEach((row) => {
          row.modified = true
        })
        .append({ id: 5, value: 'e', modified: true })

      expect(result.rows).toHaveLength(5)
      expect(result[0].data).toEqual({ id: 1, value: 'a', modified: true })
      expect(result[1].data).toEqual({ id: 3, value: 'c', modified: true })
      expect(result[2].data).toEqual({ id: 2, value: 'b', modified: true })
      expect(result[3].data).toEqual({ id: 4, value: 'd', modified: true })
      expect(result[4].data).toEqual({ id: 5, value: 'e', modified: true })
    })
  })

  describe('outer()', () => {
    it('should create factorial combinations of columns', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table.outer(trials)

      expect(table1.length).toBe(4)
      expect(table1.rowsdata).toEqual([
        { shape: 'circle', color: 'red' },
        { shape: 'circle', color: 'green' },
        { shape: 'square', color: 'red' },
        { shape: 'square', color: 'green' },
      ])
    })

    it('should handle three or more columns', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
        size: ['small', 'large'],
      }

      const table1 = table.outer(trials)

      expect(table1.length).toBe(8)
      expect(table1.rowsdata).toEqual([
        { shape: 'circle', color: 'red', size: 'small' },
        { shape: 'circle', color: 'red', size: 'large' },
        { shape: 'circle', color: 'green', size: 'small' },
        { shape: 'circle', color: 'green', size: 'large' },
        { shape: 'square', color: 'red', size: 'small' },
        { shape: 'square', color: 'red', size: 'large' },
        { shape: 'square', color: 'green', size: 'small' },
        { shape: 'square', color: 'green', size: 'large' },
      ])
    })

    it('should handle non-array values as single-element arrays', () => {
      const trials = {
        shape: 'circle',
        color: ['red', 'green'],
      }

      const table1 = table.outer(trials)

      expect(table1.length).toBe(2)
      expect(table1.rowsdata).toEqual([
        { shape: 'circle', color: 'red' },
        { shape: 'circle', color: 'green' },
      ])
    })

    it('should handle multiple non-array values', () => {
      const trials = {
        shape: 'circle',
        color: 'red',
        size: ['small', 'medium'],
      }

      const table1 = table.outer(trials)

      expect(table1.length).toBe(2)
      expect(table1.rowsdata).toEqual([
        { shape: 'circle', color: 'red', size: 'small' },
        { shape: 'circle', color: 'red', size: 'medium' },
      ])
    })

    it('should throw error for invalid input', () => {
      expect(() => {
        table.outer(null)
      }).toThrow('outer() requires an object with arrays as values')

      expect(() => {
        table.outer({})
      }).toThrow('outer() requires at least one column')
    })

    it('should throw error when combinations would exceed safety limit', () => {
      // This will generate 100 * 100 = 10000 combinations
      const trials = {
        x: Array(100).fill('x'),
        y: Array(100).fill('y'),
      }

      expect(() => {
        table.outer(trials)
      }).toThrow(/outer\(\) would generate 10000 combinations, which exceeds the safety limit of \d+/)
    })

    it('should allow combinations under the safety limit', () => {
      // This will generate 70 * 70 = 4900 combinations (under the 5000 limit)
      const trials = {
        x: Array(70).fill('x'),
        y: Array(70).fill('y'),
      }

      const table1 = table.outer(trials)
      expect(table1.length).toBe(4900)
    })

    it('should be chainable with other methods', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table.outer(trials).append([{ shape: 'triangle', color: 'blue' }])

      expect(table1.length).toBe(5)
      expect(table1[0].data).toEqual({ shape: 'circle', color: 'red' })
      expect(table1[1].data).toEqual({ shape: 'circle', color: 'green' })
      expect(table1[2].data).toEqual({ shape: 'square', color: 'red' })
      expect(table1[3].data).toEqual({ shape: 'square', color: 'green' })
      expect(table1[4].data).toEqual({ shape: 'triangle', color: 'blue' })
    })
  })

  describe('shuffle()', () => {
    it('should shuffle rows with a specific seed', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ])

      // Shuffle with a specific seed
      table1.shuffle('test-seed-123')

      // The order should be deterministic with this seed
      expect(table1.rowsdata.map((r) => r.id)).toEqual([3, 1, 5, 2, 4])
    })

    it('should produce consistent order with same seed', () => {
      const data = [
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ]

      // Create two tables with same data
      const table1 = table.append(data)
      const table2 = table.append(data)

      // Shuffle both with same seed
      table1.shuffle('test-seed-123')
      table2.shuffle('test-seed-123')

      // They should have the same order
      expect(table1.rowsdata.map((r) => r.id)).toEqual(table2.rowsdata.map((r) => r.id))
    })

    it('should use global seeded RNG when no seed is provided', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ])

      // Set up global seed
      seedrandom('global-test-seed', { global: true })

      // Shuffle without a seed
      table1.shuffle()

      // The order should be deterministic with the global seed
      expect(table1.rowsdata.map((r) => r.id)).toEqual([5, 2, 4, 1, 3])
    })

    it('should preserve all elements after shuffling', () => {
      const originalData = [
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ]

      const table1 = table.append(originalData)
      const originalIds = [...table1.rowsdata.map((r) => r.id)].sort()

      // Shuffle with a specific seed
      table1.shuffle('test-seed-123')
      const shuffledIds = [...table1.rowsdata.map((r) => r.id)].sort()

      // All elements should still be present, just in different order
      expect(shuffledIds).toEqual(originalIds)
    })

    it('should handle empty table', () => {
      const table1 = table
      table1.shuffle('test-seed-123')
      expect(table1.rowsdata).toEqual([])
    })

    it('should handle single element table', () => {
      const table1 = table.append([{ id: 1, value: 'a' }])
      table1.shuffle('test-seed-123')
      expect(table1.rowsdata).toEqual([{ id: 1, value: 'a' }])
    })

    it('should be chainable with other methods', () => {
      const table1 = table
        .append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ])
        .shuffle('test-seed-123')
        .append([{ id: 4, value: 'd' }])

      expect(table1.rowsdata).toHaveLength(4)
      expect(table1[3].data).toEqual({ id: 4, value: 'd' })
    })
  })

  describe('print()', () => {
    let consoleSpy

    beforeEach(() => {
      // Spy on console.log
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      // Clear the spy
      consoleSpy.mockRestore()
    })

    it('should print a simple table', () => {
      const table1 = table.append([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ])

      table1.print()

      expect(consoleSpy).toHaveBeenCalledTimes(3)
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Table with 2 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '[0]:', { color: 'red', shape: 'triangle' })
      expect(consoleSpy).toHaveBeenNthCalledWith(3, '[1]:', { color: 'blue', shape: 'square' })
    })

    it('should print nested tables with proper indentation', () => {
      const trials = table.range(2)
      trials[0].append([
        { type: 'stim', value: 1 },
        { type: 'feedback', value: 2 },
      ])
      trials[1].append([{ type: 'stim', value: 3 }])

      trials.print()

      expect(consoleSpy).toHaveBeenCalledTimes(8)
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Table with 2 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '[0]:', { range: 0 })
      expect(consoleSpy).toHaveBeenNthCalledWith(3, '  Nested table with 2 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(4, '  [0]:', { type: 'stim', value: 1 })
      expect(consoleSpy).toHaveBeenNthCalledWith(5, '  [1]:', { type: 'feedback', value: 2 })
      expect(consoleSpy).toHaveBeenNthCalledWith(6, '[1]:', { range: 1 })
      expect(consoleSpy).toHaveBeenNthCalledWith(7, '  Nested table with 1 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(8, '  [0]:', { type: 'stim', value: 3 })
    })

    it('should handle empty tables', () => {
      const emptyTable = table
      emptyTable.print()

      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith('Table with 0 rows:')
    })

    it('should return this for chaining', () => {
      const table1 = table.append([{ value: 1 }])
      const result = table1.print()

      expect(result).toBe(table1)
      expect(consoleSpy).toHaveBeenCalled()
    })

    it('should filter out methods and symbols from output', () => {
      const table1 = table.append([
        {
          value: 1,
          method: () => {},
          [Symbol('test')]: 'symbol value',
        },
      ])

      table1.print()

      expect(consoleSpy).toHaveBeenCalledTimes(2)
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Table with 1 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '[0]:', { value: 1 })
    })
  })

  describe('partition()', () => {
    it('should partition table into n chunks', () => {
      const table1 = table.range(6)
      table1.partition(2)
      //table1.print()
      expect(table1.length).toBe(2)
      expect(table1[0].data).toEqual({ partition: 0 })
      expect(table1[1].data).toEqual({ partition: 1 })

      // Check first partition
      const partition1 = table1[0]
      expect(partition1.rows).toHaveLength(3)
      expect(partition1[0].data).toEqual({ range: 0 })
      expect(partition1[1].data).toEqual({ range: 1 })
      expect(partition1[2].data).toEqual({ range: 2 })

      // Check second partition
      const partition2 = table1.rows[1]
      expect(partition2.rows).toHaveLength(3)
      expect(partition2[0].data).toEqual({ range: 3 })
      expect(partition2[1].data).toEqual({ range: 4 })
      expect(partition2[2].data).toEqual({ range: 5 })
    })

    it('should throw error for uneven partitions', () => {
      const table1 = table.range(5)
      expect(() => {
        table1.partition(2)
      }).toThrow('Table size (5) is not divisible by 2')
    })

    it('should handle empty table', () => {
      const table1 = table
      table1.partition(2)
      expect(table1.rows).toHaveLength(0)
    })

    it('should handle n=1 by doing nothing', () => {
      const table1 = table.range(6)
      const originalItems = [...table1.rows]

      // Partition with n=1 should not change the table
      table1.partition(1)

      // Verify length is unchanged
      expect(table1.rows).toHaveLength(originalItems.length)

      // Verify the data is unchanged
      for (let i = 0; i < originalItems.length; i++) {
        expect(table1[i].data).toEqual(originalItems[i].data)
      }
    })

    it('should throw error if n <= 0', () => {
      const table1 = table.range(6)
      expect(() => {
        table1.partition(0)
      }).toThrow('partition() must be called with a positive integer')
      expect(() => {
        table1.partition(-1)
      }).toThrow('partition() must be called with a positive integer')
    })

    it('should be chainable with other methods', () => {
      const table1 = table
        .range(6)
        .partition(2)
        .forEach((row) => {
          row.forEach((item) => {
            item.type = 'test'
          })
        })

      // Check that forEach worked on nested tables
      const partition1 = table1[0]
      const partition2 = table1[1]

      partition1.forEach((row) => {
        expect(row.type).toBe('test')
      })
      partition2.forEach((row) => {
        expect(row.type).toBe('test')
      })
    })
  })

  describe('sample()', () => {
    it('should handle empty table', () => {
      const table1 = table
      table1.sample({ type: 'without-replacement', size: 5 })
      expect(table1.rowsdata).toEqual([])
    })

    it('should throw error for invalid sampling type', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      expect(() => {
        table1.sample({ type: 'invalid-type' })
      }).toThrow('Invalid sampling type: invalid-type')
    })

    it('should throw error when exceeding safety limit', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      expect(() => {
        table1.sample({
          type: 'with-replacement',
          size: config.maxStepperRows + 1,
        })
      }).toThrow(/sample\(\) would generate \d+ rows, which exceeds the safety limit/)
    })

    describe('with-replacement sampling', () => {
      it('should require size parameter', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'with-replacement' })
        }).toThrow('size parameter is required for with-replacement sampling')
      })

      it('should sample with replacement', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ]

        const table1 = table.append(data)
        table1.sample({ type: 'with-replacement', size: 5 })

        expect(table1.rowsdata).toHaveLength(5)
        // Check that all sampled items are from the original data
        table1.rowsdata.forEach((row) => {
          expect(data).toContainEqual(row)
        })
      })

      it('should produce consistent results with same seed', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ]

        // Create two tables with same data
        const table1 = table.append(data)
        const table2 = table.append(data)

        // Sample both with same seed
        table1.sample({ type: 'with-replacement', size: 5, seed: 'test-seed-123' })
        table2.sample({ type: 'with-replacement', size: 5, seed: 'test-seed-123' })

        // They should have the same order
        expect(table1.rowsdata.map((r) => r.id)).toEqual(table2.rowsdata.map((r) => r.id))
      })

      it('should handle weighted sampling', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ]

        const table1 = table.append(data)
        table1.sample({
          type: 'with-replacement',
          size: 1000,
          weights: [0.5, 0.3, 0.2],
          seed: 'test-seed-123',
        })

        // Count occurrences
        const counts = table1.rowsdata.reduce((acc, row) => {
          acc[row.id] = (acc[row.id] || 0) + 1
          return acc
        }, {})

        // With these weights, we expect roughly:
        // id 1: ~500 occurrences
        // id 2: ~300 occurrences
        // id 3: ~200 occurrences
        expect(counts[1]).toBeGreaterThan(450)
        expect(counts[1]).toBeLessThan(550)
        expect(counts[2]).toBeGreaterThan(250)
        expect(counts[2]).toBeLessThan(350)
        expect(counts[3]).toBeGreaterThan(150)
        expect(counts[3]).toBeLessThan(250)
      })

      it('should throw error when weights length does not match table length', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ]

        const table1 = table.append(data)

        // Test with too few weights
        expect(() => {
          table1.sample({
            type: 'with-replacement',
            size: 5,
            weights: [0.5, 0.3], // Only 2 weights for 3 items
            seed: 'test-seed-123',
          })
        }).toThrow('Weights array length must match the number of row')

        // Test with too many weights
        expect(() => {
          table1.sample({
            type: 'with-replacement',
            size: 5,
            weights: [0.5, 0.3, 0.2, 0.1], // 4 weights for 3 items
            seed: 'test-seed-123',
          })
        }).toThrow('Weights array length must match the number of rows')
      })
    })

    describe('without-replacement sampling', () => {
      it('should require size parameter', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'without-replacement' })
        }).toThrow('size parameter is required for without-replacement sampling')
      })

      it('should not allow size larger than available trials', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'without-replacement', size: 3 })
        }).toThrow('Sample size cannot be larger than the number of available rows')
      })

      it('should sample without replacement', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        const table1 = table.append(data)
        table1.sample({ type: 'without-replacement', size: 2 })

        expect(table1.rows).toHaveLength(2)
        // Check that no item appears twice
        const ids = table1.rowsdata.map((r) => r.id)
        expect(new Set(ids).size).toBe(2)
        // Check that all sampled items are from the original data
        table1.rowsdata.forEach((row) => {
          expect(data).toContainEqual(row)
        })
      })

      it('should produce consistent results with same seed', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        // Create two tables with same data
        const table1 = table.append(data)
        const table2 = table.append(data)

        // Sample both with same seed
        table1.sample({ type: 'without-replacement', size: 2, seed: 'test-seed-123' })
        table2.sample({ type: 'without-replacement', size: 2, seed: 'test-seed-123' })

        // They should have the same order
        expect(table1.rowsdata.map((r) => r.id)).toEqual(table2.rowsdata.map((r) => r.id))
      })
    })

    describe('fixed-repetitions sampling', () => {
      it('should require size parameter', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'fixed-repetitions' })
        }).toThrow('size parameter is required for fixed-repetitions sampling')
      })

      it('should repeat each trial size times', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ]

        const table1 = table.append(data)
        table1.sample({ type: 'fixed-repetitions', size: 3 })

        expect(table1.rowsdata).toHaveLength(6) // 2 trials * 3 repetitions
        // Count occurrences of each trial
        const counts = table1.rowsdata.reduce((acc, row) => {
          acc[row.id] = (acc[row.id] || 0) + 1
          return acc
        }, {})
        expect(counts[1]).toBe(3)
        expect(counts[2]).toBe(3)
      })

      it('should shuffle the result', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ]

        const table1 = table.append(data)
        table1.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })

        // The order should be different from the original
        expect(table1.rowsdata.map((r) => r.id)).not.toEqual([1, 1, 1, 2, 2, 2])
      })

      it('should produce consistent results with same seed', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ]

        // Create two tables with same data
        const table1 = table.append(data)
        const table2 = table.append(data)

        // Sample both with same seed
        table1.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })
        table2.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })

        // They should have the same order
        expect(table1.rowsdata.map((r) => r.id)).toEqual(table2.rowsdata.map((r) => r.id))
      })
    })

    describe('alternate-groups sampling', () => {
      it('should require groups parameter', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'alternate-groups' })
        }).toThrow('groups parameter is required for alternate-groups sampling')
      })

      it('should require at least two groups', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'alternate-groups', groups: [[0]] })
        }).toThrow('groups must be an array with at least two groups')
      })

      it('should alternate between groups', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        const table1 = table.append(data)
        table1.sample({
          type: 'alternate-groups',
          groups: [
            [0, 2],
            [1, 3],
          ], // Group 1: [a, c], Group 2: [b, d]
        })

        // Should alternate between groups: [a, b, c, d]
        expect(table1.rowsdata.map((r) => r.id)).toEqual([1, 2, 3, 4])
      })

      it('should handle groups of different sizes', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
          { id: 5, value: 'e' },
        ]

        const table1 = table.append(data)
        table1.sample({
          type: 'alternate-groups',
          groups: [
            [0, 1],
            [2, 3, 4],
          ], // Group 1: [a, b], Group 2: [c, d, e]
        })

        // Should alternate between groups until shortest group is exhausted
        // and then continue with remaining elements from longer group
        expect(table1.rowsdata.map((r) => r.id)).toEqual([1, 3, 2, 4, 5])
      })

      it('should randomize group order when requested', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        const table1 = table.append(data)
        table1.sample({
          type: 'alternate-groups',
          groups: [
            [0, 2],
            [1, 3],
          ],
          randomize_group_order: true,
          seed: 'test-seed-12334',
        })

        // The order should be different from the default
        // With this seed, the groups should be in reverse order
        expect(table1.rowsdata.map((r) => r.id)).toEqual([2, 4, 1, 3])
      })

      it('should produce consistent results with same seed', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        // Create two tables with same data
        const table1 = table.append(data)
        const table2 = table.append(data)

        // Sample both with same seed
        const options = {
          type: 'alternate-groups',
          groups: [
            [0, 2],
            [1, 3],
          ],
          randomize_group_order: true,
          seed: 'test-seed-123',
        }
        table1.sample(options)
        table2.sample(options)

        // They should have the same order
        expect(table1.rowsdata.map((r) => r.id)).toEqual(table2.rowsdata.map((r) => r.id))
      })

      it('should validate group indices', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({
            type: 'alternate-groups',
            groups: [[0, 2], [1]], // Invalid index 2
          })
        }).toThrow('Invalid index 2 in group 0')
      })
    })

    describe('custom sampling', () => {
      it('should require fn parameter', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'custom' })
        }).toThrow('fn parameter is required for custom sampling')
      })

      it('should require fn to be a function', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'custom', fn: 'not a function' })
        }).toThrow('fn must be a function')
      })

      it('should use custom sampling function', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ]

        const table1 = table.append(data)
        table1.sample({
          type: 'custom',
          fn: (indices) => indices.reverse(), // Reverse the order
        })

        expect(table1.rowsdata.map((r) => r.id)).toEqual([3, 2, 1])
      })

      it('should validate custom function output', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({
            type: 'custom',
            fn: () => 'not an array',
          })
        }).toThrow('Custom sampling function must return an array')
      })

      it('should validate custom function indices', () => {
        const table1 = table.append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({
            type: 'custom',
            fn: () => [2], // Invalid index
          })
        }).toThrow('Invalid index 2 returned by custom sampling function')
      })
    })
  })

  describe('setReadOnly()', () => {
    it('should set the read-only status of the table', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      table1.setReadOnly(true)

      expect(table1.isReadOnly).toBe(true)
    })

    it('should set the read-only status of nested tables', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      table1[0].setReadOnly(true)

      expect(table1[0].isReadOnly).toBe(true)
    })

    it('should not allow setting read-only status of a read-only table', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      table1.setReadOnly(true)

      expect(() => table1[0].setReadOnly(true)).toThrow('Table is read-only')
    })

    it('should not allow setting read-only status of a nested table', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      // First add an item to table1[0] so table1[0][0] exists
      table1[0].append({ id: 3, value: 'c' })

      table1[0].setReadOnly(true)

      expect(() => table1[0][0].setReadOnly(true)).toThrow('Table is read-only')
    })

    it('should now allow modifications to a read-only table', () => {
      const table1 = table.append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      table1.setReadOnly(true)

      expect(() => table1.append({ id: 3, value: 'c' })).toThrow('Table is read-only')
      expect(() => table1[0].append({ id: 3, value: 'c' })).toThrow('Table is read-only')
    })
  })

  describe.skip('Complex Nested Operations', () => {
    it('should maintain correct parent-child relationships in complex structures', () => {
      // Create a deep structure with multiple operations
      table.append(1)
      table[0].append(2)
      table[0][0].append(3)
      table[0][0][0].append(4)
      table[0][0][0][0].append(5)

      // Create a parallel branch
      table.append(10)
      table[1].append(20)
      table[1][0].append(30)

      // Validate the entire tree
      validateTreeConsistency(table)

      // Add more complexity by appending at different levels
      table[0].append(6) // Second child of root's first child
      table[1][0].append(40) // Second child of the parallel branch

      // Validate again after modifications
      validateTreeConsistency(table)

      // Check specific parent-child relationships
      expect(table[0]._parent).toBe(table)
      expect(table[0][0]._parent).toBe(table[0])
      expect(table[0][0][0]._parent).toBe(table[0][0])
      expect(table[0][0][0][0]._parent).toBe(table[0][0][0])
      expect(table[0][0][0][0][0]._parent).toBe(table[0][0][0][0])

      expect(table[1]._parent).toBe(table)
      expect(table[1][0]._parent).toBe(table[1])
      expect(table[1][0][0]._parent).toBe(table[1][0])
      expect(table[1][0][1]._parent).toBe(table[1][0])

      // Check data integrity
      expect(table[0].data).toBe(1)
      expect(table[0][0].data).toBe(2)
      expect(table[0][0][0].data).toBe(3)
      expect(table[0][0][0][0].data).toBe(4)
      expect(table[0][0][0][0][0].data).toBe(5)
      expect(table[0][1].data).toBe(6)

      expect(table[1].data).toBe(10)
      expect(table[1][0].data).toBe(20)
      expect(table[1][0][0].data).toBe(30)
      expect(table[1][0][1].data).toBe(40)
    })

    it('should handle complex operations that could affect parent-child relationships', () => {
      // Create a nested structure
      table.range(3)

      // Add nested items to each row
      table[0].append(10)
      table[0].append(11)
      table[1].append(20)
      table[1].append(21)
      table[2].append(30)

      // Add another level of nesting
      table[0][0].append(100)
      table[1][0].append(200)
      table[2][0].append(300)

      // Validate initial structure
      validateTreeConsistency(table)

      // Perform repeat operation which should deep copy nested structures
      const repeatedTable = table.repeat(2)

      // Validate after repeat
      validateTreeConsistency(repeatedTable)

      // Check that original nodes and repeated nodes have correct relationships
      // Original nodes (first 3)
      for (let i = 0; i < 3; i++) {
        expect(repeatedTable[i]._parent).toBe(repeatedTable)
        for (let j = 0; j < repeatedTable[i]._items.length; j++) {
          expect(repeatedTable[i][j]._parent).toBe(repeatedTable[i])
          for (let k = 0; k < repeatedTable[i][j]._items.length; k++) {
            expect(repeatedTable[i][j][k]._parent).toBe(repeatedTable[i][j])
          }
        }
      }

      // Repeated nodes (last 3)
      for (let i = 3; i < 6; i++) {
        expect(repeatedTable[i]._parent).toBe(repeatedTable)
        for (let j = 0; j < repeatedTable[i]._items.length; j++) {
          expect(repeatedTable[i][j]._parent).toBe(repeatedTable[i])
          for (let k = 0; k < repeatedTable[i][j]._items.length; k++) {
            expect(repeatedTable[i][j][k]._parent).toBe(repeatedTable[i][j])
          }
        }
      }
    })
  })

  // describe.skip('push()', () => {
  //   it('should have push method available', () => {
  //     const table1 = table.table()
  //     expect(table1.push).toBeInstanceOf(Function)
  //   })

  //   it('should allow push in method chains', () => {
  //     const table1 = table.table()
  //     expect(() => {
  //       table1.range(3).push()
  //     }).not.toThrow()
  //   })

  //   it('should allow read operations after push', () => {
  //     const table1 = table
  //       .table()
  //       .append([
  //         { id: 1, value: 'a' },
  //         { id: 2, value: 'b' },
  //       ])
  //       .push()

  //     // Test length
  //     expect(table1.length).toBe(2)

  //     // Test indexing
  //     expect(table1[0]).toEqual({ id: 1, value: 'a' })
  //     expect(table1[1]).toEqual({ id: 2, value: 'b' })

  //     // Test spread operator
  //     expect([...table1]).toHaveLength(2)
  //     expect([...table1]).toEqual([
  //       { id: 1, value: 'a' },
  //       { id: 2, value: 'b' },
  //     ])

  //     // Test print (should not throw)
  //     expect(() => table1.print()).not.toThrow()

  //     // Test indexOf
  //     expect(table1.indexOf({ id: 1, value: 'a' })).toBe(0)
  //   })

  //   it('should block modifications after push', () => {
  //     const table1 = table
  //       .table()
  //       .append([
  //         { id: 1, value: 'a' },
  //         { id: 2, value: 'b' },
  //       ])
  //       .push()

  //     // Test append
  //     expect(() => {
  //       table1.append({ id: 3, value: 'c' })
  //     }).toThrow('Table is read-only after push()')

  //     // Test shuffle
  //     expect(() => {
  //       table1.shuffle()
  //     }).toThrow('Table is read-only after push()')

  //     // Test sample
  //     expect(() => {
  //       table1.sample({ type: 'with-replacement', size: 2 })
  //     }).toThrow('Table is read-only after push()')

  //     // Test repeat
  //     expect(() => {
  //       table1.repeat(2)
  //     }).toThrow('Table is read-only after push()')

  //     // Test zip
  //     expect(() => {
  //       table1.zip({ value: [1, 2] })
  //     }).toThrow('Table is read-only after push()')

  //     // Test outer
  //     expect(() => {
  //       table1.outer({ value: [1, 2] })
  //     }).toThrow('Table is read-only after push()')

  //     // Test range
  //     expect(() => {
  //       table1.range(3)
  //     }).toThrow('Table is read-only after push()')

  //     // Test head
  //     expect(() => {
  //       table1.head(1)
  //     }).toThrow('Table is read-only after push()')

  //     // Test tail
  //     expect(() => {
  //       table1.tail(1)
  //     }).toThrow('Table is read-only after push()')

  //     // Test partition
  //     expect(() => {
  //       table1.partition(2)
  //     }).toThrow('Table is read-only after push()')

  //     // Test forEach
  //     expect(() => {
  //       table1.forEach(() => {})
  //     }).toThrow('Table is read-only after push()')

  //     // Test map
  //     expect(() => {
  //       table1.map(() => {})
  //     }).toThrow('Table is read-only after push()')
  //   })

  //   it('makes nested tables read-only when parent table is pushed', () => {
  //     // Create a parent table with nested tables
  //     const trials = table.table().range(10)
  //     trials[0].table().range(10)

  //     // Push the parent table
  //     trials.push()

  //     // Verify nested table operations are blocked
  //     expect(() => trials[0].table()).toThrow('Table is read-only after push()')
  //     expect(() => trials[0][0].table().append({})).toThrow('Table is read-only after push()')
  //     expect(() => trials[0][0].append({})).toThrow('Table is read-only after push()')

  //     // Verify read operations still work
  //     expect(trials.length).toBe(10)
  //     expect(trials[0].length).toBe(10)
  //     expect(trials[0][0].length).toBe(null)
  //   })
  // })

  // describe.skip('.data getter', () => {
  //   it('should return raw data for main table rows', () => {
  //     const trials = table.table().range(2)
  //     trials[0].table().append({ type: 'test', value: 1 })
  //     trials[1].table().append({ type: 'test', value: 2 })

  //     // Test data getter on main rows - should return the range property
  //     expect(trials[0].data).toEqual({ range: 0 })
  //     expect(trials[1].data).toEqual({ range: 1 })

  //     // Test data getter on nested rows
  //     expect(trials[0][0].data).toEqual({ type: 'test', value: 1 })
  //     expect(trials[1][0].data).toEqual({ type: 'test', value: 2 })

  //     // Verify internal properties are excluded
  //     const data = trials[0][0].data
  //     expect(data.table).toBeUndefined()
  //     expect(data[Symbol.for('table')]).toBeUndefined()
  //   })

  //   it('should return raw data for nested table rows', () => {
  //     const trials = table.table().range(1)
  //     trials[0].table().append([
  //       { type: 'stim', value: 1 },
  //       { type: 'feedback', value: 2 },
  //     ])

  //     // Test data getter on nested rows
  //     expect(trials[0][0].data).toEqual({ type: 'stim', value: 1 })
  //     expect(trials[0][1].data).toEqual({ type: 'feedback', value: 2 })
  //   })

  //   it('should handle rows with nested tables', () => {
  //     const trials = table.table().range(1)
  //     trials[0].table().append({ type: 'child', value: 2 })
  //     Object.assign(trials[0], { type: 'parent', value: 1 })

  //     // Test data getter on parent row - should include parent properties
  //     expect(trials[0].data).toEqual({ range: 0, type: 'parent', value: 1 })

  //     // Test data getter on child row
  //     expect(trials[0][0].data).toEqual({ type: 'child', value: 2 })
  //   })

  //   it('should handle empty rows', () => {
  //     const trials = table.table().range(1)
  //     trials[0].table() // Create an empty table for the row
  //     expect(trials[0].data).toEqual({ range: 0 })
  //   })
  // })

  // describe.skip('recursive table functionality', () => {
  //   it('should allow creating nested tables on rows', () => {
  //     const trials = table.table().range(3)

  //     // Create nested tables
  //     const nestedTable1 = trials[0].table().range(3)
  //     const nestedTable2 = trials[1].table().range(5)
  //     const nestedTable3 = trials[1].table().append({ color: 'red', shape: 'triangle' })

  //     // Check first row's nested table
  //     expect(nestedTable1.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable1.rows[i]).toEqual({ range: i })
  //     }

  //     // Check second row's first nested table
  //     expect(nestedTable2.rows).toHaveLength(5)
  //     for (let i = 0; i < 5; i++) {
  //       expect(nestedTable2.rows[i]).toEqual({ range: i })
  //     }

  //     // Check second row's second nested table
  //     expect(nestedTable3.rows).toHaveLength(1)
  //     expect(nestedTable3.rows[0]).toEqual({ color: 'red', shape: 'triangle' })

  //     // Verify original table is unchanged by checking raw rows
  //     expect(trials.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       // Only check the range property
  //       expect(trials.rows[i].range).toBe(i)
  //     }
  //   })

  //   it('should store nested tables in the row', () => {
  //     const trials = table.table().range(2)

  //     // Create nested table
  //     const nestedTable = trials[0].table().range(3)

  //     // Verify the nested table is stored in the row using Symbol
  //     expect(trials[0].nested).toBe(nestedTable)
  //   })

  //   it('should allow chaining on nested tables', () => {
  //     const trials = table.table().range(2)

  //     // Create and chain operations on nested table
  //     const nestedTable = trials[0]
  //       .table()
  //       .range(3)
  //       .forEach((row) => ({ ...row, type: 'test' }))
  //       .append([{ range: 3, type: 'extra' }])

  //     expect(nestedTable.rows).toHaveLength(4)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable[i]).toEqual({ range: i, type: 'test' })
  //     }
  //     expect(nestedTable[3]).toEqual({ range: 3, type: 'extra' })
  //   })

  //   it('should allow multiple nested tables per row', () => {
  //     const trials = table.table().range(2)

  //     // Create multiple nested tables on the same row
  //     const nestedTable1 = trials[0].table().range(2)
  //     const nestedTable2 = trials[0].table().range(3)

  //     expect(nestedTable1.rows).toHaveLength(2)
  //     expect(nestedTable2.rows).toHaveLength(3)

  //     // The last created table should be stored in the row
  //     expect(trials[0].nested).toBe(nestedTable2)
  //   })

  //   it('should support deeply nested tables', () => {
  //     const trials = table.table().range(3)

  //     // Create a deeply nested structure
  //     const level1 = trials[0].table().range(3)
  //     const level2 = level1[0].table().range(3)
  //     const level3 = level2[0].table().range(3)

  //     // Check each level
  //     expect(trials.rows).toHaveLength(3)
  //     expect(level1.rows).toHaveLength(3)
  //     expect(level2.rows).toHaveLength(3)
  //     expect(level3.rows).toHaveLength(3)

  //     // Verify we can chain operations at any level
  //     level3[1].table().append({ color: 'red', shape: 'triangle' })
  //     expect(level3[1].nested[0]).toEqual({ color: 'red', shape: 'triangle' })

  //     // Verify we can create multiple nested tables at any level
  //     const anotherLevel3 = level2[1].table().range(2)
  //     expect(anotherLevel3.rows).toHaveLength(2)
  //   })
  // })

  // describe.skip('Complex Operations', () => {
  //   it('should handle nesting after shuffling', () => {
  //     const trials = table.table().range(10).shuffle()
  //     const nestedTable2 = trials[0].table().range(3)
  //     expect(nestedTable2.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable2[i]).toEqual({ range: i })
  //     }
  //   })

  //   it('should handle nesting after sampling', () => {
  //     const trials = table.table().range(10)
  //     trials.sample({
  //       type: 'with-replacement',
  //       size: 3,
  //     })
  //     const nestedTable2 = trials[0].table().range(3)
  //     expect(nestedTable2.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable2[i]).toEqual({ range: i })
  //     }
  //   })

  //   it('should handle shuffling at the top level after a nested table created', () => {
  //     const trials = table.table().range(10)
  //     const nestedTable2 = trials[3].table().range(3)
  //     trials.shuffle()
  //     expect(nestedTable2.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(nestedTable2[i]).toEqual({ range: i })
  //     }
  //   })

  //   it('should copy the nested table when repeating', () => {
  //     const trials = table.table().range(10)
  //     const nestedTable2 = trials[3].table().range(3)
  //     trials.repeat(2)

  //     // Verify that the original nested table is still in place
  //     expect(trials[3].nested).toBe(nestedTable2)

  //     // Verify that the repeated row has a different nested table instance
  //     expect(trials[13].nested).not.toBe(nestedTable2)

  //     // Verify that the repeated nested table has the same data
  //     expect(trials[13].nested.rows).toHaveLength(3)
  //     for (let i = 0; i < 3; i++) {
  //       expect(trials[13].nested[i]).toEqual({ range: i })
  //     }

  //     // Verify that modifying the repeated nested table doesn't affect the original
  //     trials[13].nested[0].value = 'modified'
  //     expect(trials[3].nested[0].value).toBeUndefined()
  //   })

  //   it('should allow creating nested tables with forEach', () => {
  //     const trials = table.table().range(10)
  //     expect(trials[0].length).toBe(null)

  //     trials.forEach((row, i) => {
  //       row.append({ trial: i })
  //       row.table().append([
  //         { type: 'stim', index: i },
  //         { type: 'feedback', index: i },
  //       ])
  //     })

  //     expect(trials[0].length).toBe(2)
  //     expect(Object.keys(trials[0]).length).toBe(2)

  //     trials.rows.forEach((row) => {
  //       const nestedTable2 = row[Symbol.for('table')]
  //       expect(nestedTable2).toBeDefined()
  //       expect(nestedTable2.rows).toHaveLength(2)
  //       expect(nestedTable2[0].index).toBe(row.trial)
  //       expect(nestedTable2[1].index).toBe(row.trial)
  //     })
  //   })
  // })

  // it('should enforce maximum row limits', () => {
  //   const table = new NestedTable(sm)
  //
  //   // Test initial value exceeding limit
  //   const tooManyItems = Array(config.maxStepperRows + 1).fill({ value: 1 })
  //   expect(() => table.append(tooManyItems)).toThrow(/exceeds the safety limit/)
  //
  //   // Test accumulating too many rows
  //   const almostFullTable = new NestedTable(sm)
  //   const items = Array(config.maxStepperRows - 1).fill({ value: 1 })
  //   almostFullTable.append(items)
  //
  //   // Adding two more should fail
  //   expect(() => almostFullTable.append([{ value: 1 }, { value: 2 }])).toThrow(/exceeds the safety limit/)
  //
  //   // Adding one more should succeed
  //   almostFullTable.append({ value: 1 })
  //   expect(almostFullTable.length).toBe(config.maxStepperRows)
  //
  //   // Test appending table that would exceed limit
  //   const sourceTable = new NestedTable(sm)
  //   sourceTable.append([{ value: 1 }, { value: 2 }])
  //   expect(() => almostFullTable.append(sourceTable)).toThrow(/exceeds the safety limit/)
  // })
  //})

  describe('getProtectedTableMethods', () => {
    it('should include all public methods and getters of NestedTable', () => {
      const table = new NestedTable({})
      const protectedMethods = table.getProtectedTableMethods()

      // Get all method names from the instance
      const actualMethods = []

      // Get method names
      const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(table)).filter(
        (name) =>
          name !== 'constructor' &&
          name !== '_checkReadOnly' && // Skip private methods
          name !== 'getProtectedTableMethods' && // Exclude the method itself
          !name.startsWith('_') &&
          typeof table[name] === 'function'
      )
      actualMethods.push(...methodNames)

      // Get getter names (excluding Symbol properties)
      const descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(table))
      const getterNames = Object.keys(descriptors).filter((key) => descriptors[key].get && !key.startsWith('_'))
      actualMethods.push(...getterNames)

      // Check that all actual methods are included in protected methods
      actualMethods.forEach((method) => {
        expect(protectedMethods).toContain(method, `Missing method in protectedMethods: ${method}`)
      })
    })
  })
})
