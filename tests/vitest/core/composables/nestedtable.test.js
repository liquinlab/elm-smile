import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NestedTable } from '@/core/composables/NestedTable'
import seedrandom from 'seedrandom'
import config from '@/core/config'

// Mock must be defined inline without external variables
vi.mock('@/core/config', () => ({
  default: {
    max_stepper_rows: 5000,
  },
}))

describe('NestedTable', () => {
  let nestedTable
  let table

  beforeEach(() => {
    nestedTable = new NestedTable()
    const api = {
      new: function () {
        return nestedTable.createTable(api)
      },
    }
    table = nestedTable.createTable(api)
    table.new = api.new
  })

  describe('Basic Table Operations', () => {
    it('should create an empty table', () => {
      expect(table.rows).toEqual([])
      expect(table.length).toBe(0)
    })

    it('should provide the new() method', () => {
      expect(table.new).toBeInstanceOf(Function)
    })

    it('should append single items', () => {
      table.append({ value: 1 })
      expect(table.rows).toHaveLength(1)
      expect(table.rows[0]).toEqual({ value: 1 })
    })

    it('should append multiple items as array', () => {
      const items = [{ value: 1 }, { value: 2 }, { value: 3 }]
      table.append(items)
      expect(table.rows).toHaveLength(3)
      expect(table.rows).toEqual(items)
      expect(table.length).toBe(3)
    })

    it('should allow appending another table', () => {
      const table1 = nestedTable.createTable({}).append([{ color: 'red', shape: 'triangle' }])
      const table2 = nestedTable.createTable({}).append([{ color: 'blue', shape: 'square' }])

      table1.append(table2)

      expect(table1.rows).toHaveLength(2)
      expect(table1.length).toBe(2)

      //preferred way to access
      expect(table1[0]).toEqual({ color: 'red', shape: 'triangle' })
      expect(table1[1]).toEqual({ color: 'blue', shape: 'square' })

      // optional way to access
      expect(table1.rows[0]).toEqual({ color: 'red', shape: 'triangle' })
      expect(table1.rows[1]).toEqual({ color: 'blue', shape: 'square' })
    })

    it('should create a new table with chainable methods', () => {
      const t1 = table.new()

      expect(t1).toBeDefined()
      expect(t1.rows).toBeDefined()
      expect(Array.isArray(t1.rows)).toBe(true)
      expect(t1.append).toBeInstanceOf(Function)
      expect(t1.shuffle).toBeInstanceOf(Function)
      expect(t1.sample).toBeInstanceOf(Function)
      expect(t1.repeat).toBeInstanceOf(Function)
      expect(t1.push).toBeInstanceOf(Function)
      expect(t1.forEach).toBeInstanceOf(Function)
      expect(t1.zip).toBeInstanceOf(Function)
      expect(t1.range).toBeInstanceOf(Function)
      expect(t1.outer).toBeInstanceOf(Function)
      expect(t1.length).toBeDefined()
      expect(t1.indexOf).toBeInstanceOf(Function)
      expect(t1.slice).toBeInstanceOf(Function)
      expect(t1[Symbol.iterator]).toBeInstanceOf(Function)
      expect(t1[Symbol.isConcatSpreadable]).toBeDefined()
    })

    it('should provide array-like access to rows', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const t1 = table.new().append(trials)

      // Test length
      expect(t1.length).toBe(2)

      // Test array indexing
      expect(t1[0]).toEqual(trials[0])
      expect(t1[1]).toEqual(trials[1])

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

    it('should create an empty table when new() is called without data operations', () => {
      const t1 = table.new()

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

  describe('Nested Table Operations', () => {
    it('should support creating nested tables', () => {
      table.append({ id: 1 })
      const childTable = table[0].new()
      childTable.append({ nested: true })
      expect(table[0][0]).toEqual({ nested: true })
    })

    it('should maintain nested table references when using forEach', () => {
      table.append({ id: 1 })
      table.forEach((row) => {
        const childTable = row.new()
        childTable.append({ nested: true })
      })
      expect(table[0][0]).toEqual({ nested: true })
    })

    it('should store nested tables in the row', () => {
      table.range(2)
      const childTable = table[0].new().range(3)
      expect(table[0].nested).toBeDefined()
      expect(table[0].nested).toBe(childTable)
    })

    it('should overwrite existing nested table when creating a new one', () => {
      table.range(2)
      const firstChildTable = table[0].new().range(2)
      const secondChildTable = table[0].new().range(3)

      // The second table should replace the first
      expect(firstChildTable.rows).toHaveLength(2)
      expect(secondChildTable.rows).toHaveLength(3)
      expect(table[0].nested).toBe(secondChildTable)
      expect(table[0].nested).not.toBe(firstChildTable)
    })

    it('should support deeply nested tables', () => {
      table.range(3)
      const level1Table = table[0].new().range(3)
      const level2Table = level1Table[0].new().range(3)
      const level3Table = level2Table[0].new().range(3)

      expect(table.rows).toHaveLength(3)
      expect(level1Table.rows).toHaveLength(3)
      expect(level2Table.rows).toHaveLength(3)
      expect(level3Table.rows).toHaveLength(3)

      level3Table[1].new().append({ color: 'red', shape: 'triangle' })
      expect(level3Table[1][0]).toEqual({ color: 'red', shape: 'triangle' })
    })
  })

  describe('append()', () => {
    it('should allow appending trials to a table', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const t1 = table.new().append(trials)

      expect(t1.rows).toHaveLength(2)
      expect(t1.length).toBe(2)
      expect(t1[0]).toEqual(trials[0])
      expect(t1[1]).toEqual(trials[1])
    })

    it('should allow appending a single object', () => {
      const t1 = table.new()
      t1.append({ color: 'red', shape: 'triangle' })
      expect(t1.rows).toHaveLength(1)
      expect(t1.length).toBe(1)
      expect(t1[0]).toEqual({ color: 'red', shape: 'triangle' })
    })

    it('should allow building complex tables through multiple append operations', () => {
      // Create a table with multiple append operations
      const t1 = table
        .new()
        .append([{ color: 'red', shape: 'triangle' }])
        .append([{ color: 'blue', shape: 'square' }])
        .append([{ color: 'green', shape: 'circle' }])
        .append([{ color: 'yellow', shape: 'star' }])

      // Test the final state
      expect(t1.rows).toHaveLength(4)
      expect(t1.rows).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
        { color: 'yellow', shape: 'star' },
      ])

      // Test array-like access still works
      expect(t1.length).toBe(4)
      expect(t1[0]).toEqual({ color: 'red', shape: 'triangle' })
      expect(t1[3]).toEqual({ color: 'yellow', shape: 'star' })
      expect([...t1]).toHaveLength(4)
      expect(t1.slice(1, 3)).toEqual([
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])
    })

    it('should allow appending another table', () => {
      const table1 = table.new().append([{ color: 'red', shape: 'triangle' }])
      const table2 = table.new().append([{ color: 'blue', shape: 'square' }])

      table1.append(table2)

      expect(table1.rows).toHaveLength(2)
      expect(table1.length).toBe(2)
      expect(table1[0]).toEqual({ color: 'red', shape: 'triangle' })
      expect(table1[1]).toEqual({ color: 'blue', shape: 'square' })
    })

    it('should allow appending mixed single objects and arrays', () => {
      const table1 = table.new()

      table1.append({ color: 'red', shape: 'triangle' })
      expect(table1.rows).toHaveLength(1)
      expect(table1[0]).toEqual({ color: 'red', shape: 'triangle' })

      // Should still work with arrays after appending single object
      table1.append([{ color: 'blue', shape: 'square' }])
      expect(table1.rows).toHaveLength(2)
      expect(table1[1]).toEqual({ color: 'blue', shape: 'square' })

      // Should work with another single object
      table1.append({ color: 'green', shape: 'circle' })
      expect(table1.rows).toHaveLength(3)
      expect(table1[2]).toEqual({ color: 'green', shape: 'circle' })
    })

    it('should throw error when appending table would exceed safety limit', () => {
      const smallTable = table.new().append([{ color: 'blue', shape: 'square' }])

      expect(() => {
        const largeTable = table
          .new()
          .append(Array(config.max_stepper_rows + 1).fill({ color: 'red', shape: 'circle' }))
        smallTable.append(largeTable)
      }).toThrow(/append\(\) would generate \d+ rows, which exceeds the safety limit of \d+/)
    })
  })

  describe('interleave()', () => {
    it('should interleave two tables of equal length', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      const table2 = table.new().append([
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
      ])

      table1.interleave(table2)

      expect(table1.rows).toHaveLength(4)
      expect(table1.rows[0]).toEqual({ id: 1, value: 'a' })
      expect(table1.rows[1]).toEqual({ id: 3, value: 'c' })
      expect(table1.rows[2]).toEqual({ id: 2, value: 'b' })
      expect(table1.rows[3]).toEqual({ id: 4, value: 'd' })
    })

    it('should interleave tables of different lengths', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ])
      const table2 = table.new().append([
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ])

      table1.interleave(table2)

      expect(table1.rows).toHaveLength(5)
      expect(table1.rows[0]).toEqual({ id: 1, value: 'a' })
      expect(table1.rows[1]).toEqual({ id: 4, value: 'd' })
      expect(table1.rows[2]).toEqual({ id: 2, value: 'b' })
      expect(table1.rows[3]).toEqual({ id: 5, value: 'e' })
      expect(table1.rows[4]).toEqual({ id: 3, value: 'c' })
    })

    it('should interleave with an array input', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      const array = [
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
      ]

      table1.interleave(array)

      expect(table1.rows).toHaveLength(4)
      expect(table1.rows[0]).toEqual({ id: 1, value: 'a' })
      expect(table1.rows[1]).toEqual({ id: 3, value: 'c' })
      expect(table1.rows[2]).toEqual({ id: 2, value: 'b' })
      expect(table1.rows[3]).toEqual({ id: 4, value: 'd' })
    })

    it('should interleave with a single object', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      table1.interleave({ id: 3, value: 'c' })

      expect(table1.rows).toHaveLength(3)
      expect(table1.rows[0]).toEqual({ id: 1, value: 'a' })
      expect(table1.rows[1]).toEqual({ id: 3, value: 'c' })
      expect(table1.rows[2]).toEqual({ id: 2, value: 'b' })
    })

    it('should throw error for invalid input', () => {
      const table1 = table.new().append([{ id: 1, value: 'a' }])

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
      const table1 = table.new().append(Array(config.max_stepper_rows - 1).fill({ value: 'a' }))
      const table2 = table.new().append([{ value: 'b' }, { value: 'c' }])

      expect(() => {
        table1.interleave(table2)
      }).toThrow(/interleave\(\) would generate \d+ rows, which exceeds the safety limit/)
    })

    it('should be chainable with other methods', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
      const table2 = table.new().append([
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
      ])

      const result = table1
        .interleave(table2)
        .forEach((row) => ({ ...row, modified: true }))
        .append({ id: 5, value: 'e', modified: true })

      expect(result.rows).toHaveLength(5)
      expect(result.rows[0]).toEqual({ id: 1, value: 'a', modified: true })
      expect(result.rows[1]).toEqual({ id: 3, value: 'c', modified: true })
      expect(result.rows[2]).toEqual({ id: 2, value: 'b', modified: true })
      expect(result.rows[3]).toEqual({ id: 4, value: 'd', modified: true })
      expect(result.rows[4]).toEqual({ id: 5, value: 'e', modified: true })
    })
  })

  describe('map()', () => {
    it('should transform trials using regular function with this binding', () => {
      const table1 = table.new().append([
        { shape: 'circle', color: 'red' },
        { shape: 'square', color: 'green' },
      ])

      table1.map(function (index) {
        return {
          ...this,
          id: index,
          color: this.shape === 'circle' ? 'blue' : this.color,
        }
      })

      expect(table1.rows).toEqual([
        { shape: 'circle', color: 'blue', id: 0 },
        { shape: 'square', color: 'green', id: 1 },
      ])
    })

    it('should transform trials using arrow function with row parameter', () => {
      const table1 = table.new().append([
        { shape: 'circle', color: 'red' },
        { shape: 'square', color: 'green' },
      ])

      table1.map((row, index) => ({
        ...row,
        id: index,
        color: row.shape === 'circle' ? 'blue' : row.color,
      }))

      expect(table1.rows).toEqual([
        { shape: 'circle', color: 'blue', id: 0 },
        { shape: 'square', color: 'green', id: 1 },
      ])
    })

    it('should support nested tables with regular function', () => {
      const trials = table.new().range(2)
      trials.map(function (index) {
        this.new().append([
          { type: 'stim', trial: index },
          { type: 'feedback', trial: index },
        ])
        return { ...this, block: Math.floor(index / 2) }
      })

      // Check parent table structure (excluding Symbol properties)
      const row0 = trials[0]
      const row1 = trials[1]
      expect({
        range: row0.range,
        block: row0.block,
      }).toEqual({ range: 0, block: 0 })
      expect({
        range: row1.range,
        block: row1.block,
      }).toEqual({ range: 1, block: 0 })

      // Check nested tables
      const nested1 = trials[0].nested
      const nested2 = trials[1].nested

      expect(nested1.rows).toEqual([
        { type: 'stim', trial: 0 },
        { type: 'feedback', trial: 0 },
      ])
      expect(nested2.rows).toEqual([
        { type: 'stim', trial: 1 },
        { type: 'feedback', trial: 1 },
      ])
    })

    it('should support nested tables with arrow function', () => {
      const trials = table.new().range(2)
      trials.map((row, index) => {
        row.new().append([
          { type: 'stim', trial: index },
          { type: 'feedback', trial: index },
        ])
        return { ...row, block: Math.floor(index / 2) }
      })

      // Check parent table structure (excluding Symbol properties)
      const row0 = trials.rows[0]
      const row1 = trials.rows[1]
      expect({
        range: row0.range,
        block: row0.block,
      }).toEqual({ range: 0, block: 0 })
      expect({
        range: row1.range,
        block: row1.block,
      }).toEqual({ range: 1, block: 0 })

      // Check nested tables
      const nested1 = trials[0].nested
      const nested2 = trials[1].nested

      expect(nested1.rows).toEqual([
        { type: 'stim', trial: 0 },
        { type: 'feedback', trial: 0 },
      ])
      expect(nested2.rows).toEqual([
        { type: 'stim', trial: 1 },
        { type: 'feedback', trial: 1 },
      ])
    })

    it('should preserve existing nested tables when mapping', () => {
      const trials = table.new().range(2)

      // Create nested tables first
      trials[0].new().append({ type: 'original' })
      trials[1].new().append({ type: 'original' })

      // Map over trials, making sure to preserve the Symbol property
      trials.map((row, index) => {
        const nested = row.nested // Save reference to nested table
        return {
          ...row,
          nested, // Restore nested table reference
          mapped: true,
        }
      })

      // Check that nested tables are preserved
      const row0 = trials[0]
      const row1 = trials[1]

      // Check nested table contents separately from row data
      expect(row0.nested.rows).toEqual([{ type: 'original' }])
      expect(row1.nested.rows).toEqual([{ type: 'original' }])

      // Check row data without the Symbol properties
      expect({
        range: row0.range,
        mapped: row0.mapped,
      }).toEqual({ range: 0, mapped: true })
      expect({
        range: row1.range,
        mapped: row1.mapped,
      }).toEqual({ range: 1, mapped: true })
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
      expect(table.rows[0]).toEqual({ color: 'green', shape: 'triangle' })
      expect(table.rows[1]).toEqual({ color: 'green', shape: 'square' })
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

      expect(table.rows).toHaveLength(2)
      expect(table.rows[0]).toEqual({ color: 'green', shape: 'triangle' })
      expect(table.rows[1]).toEqual({ color: 'blue', shape: 'square' })
    })

    it('should allow forEach to be chained with other methods', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table
        .new()
        .outer(trials)
        .forEach((row) => ({ ...row, size: 'medium' }))
        .append([{ shape: 'triangle', color: 'blue', size: 'large' }])

      expect(table1.rows).toHaveLength(5)
      expect(table1[0]).toEqual({ shape: 'circle', color: 'red', size: 'medium' })
      expect(table1[1]).toEqual({ shape: 'circle', color: 'green', size: 'medium' })
      expect(table1[2]).toEqual({ shape: 'square', color: 'red', size: 'medium' })
      expect(table1[3]).toEqual({ shape: 'square', color: 'green', size: 'medium' })
      expect(table1[4]).toEqual({ shape: 'triangle', color: 'blue', size: 'large' })
    })
  })

  describe('range()', () => {
    it('should create a range of rows', () => {
      const table1 = table.new().range(10)
      expect(table1.rows).toHaveLength(10)

      for (let i = 0; i < 10; i++) {
        expect(table1[i]).toEqual({ range: i })
      }
    })

    it('should throw error if range is called with non-positive number', () => {
      expect(() => {
        table.new().range(0)
      }).toThrow('range() must be called with a positive integer')

      expect(() => {
        table.new().range(-1)
      }).toThrow('range() must be called with a positive integer')
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
      expect(table.rows[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table.rows[1]).toEqual({ shape: 'square', color: 'green' })
      expect(table.rows[2]).toEqual({ shape: 'triangle', color: 'blue' })
    })

    it('should throw error by default when columns have different lengths', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        table.new().zip(trials)
      }).toThrow(
        'All columns must have the same length when using zip(). Specify a method (loop, pad, last) to handle different lengths.'
      )
    })

    it('should pad with specified value when using pad method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.new().zip(trials, { method: 'pad', padValue: 'unknown' })

      expect(table1.rows).toHaveLength(3)
      expect(table1.rows[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table1.rows[1]).toEqual({ shape: 'square', color: 'green' })
      expect(table1.rows[2]).toEqual({ shape: 'unknown', color: 'blue' })
    })

    it('should handle null padValue', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const tableNull = table.new().zip(trials, { method: 'pad', padValue: null })
      expect(tableNull.rows).toHaveLength(3)
      expect(tableNull.rows[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(tableNull.rows[1]).toEqual({ shape: 'square', color: 'green' })
      expect(tableNull.rows[2]).toEqual({ shape: null, color: 'blue' })
    })

    it('should throw error when padValue is undefined', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        table.new().zip(trials, { method: 'pad' })
      }).toThrow('padValue is required when using the pad method')
    })

    it('should loop shorter columns', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.new().zip(trials, { method: 'loop' })

      expect(table1.rows).toHaveLength(3)
      expect(table1.rows[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table1.rows[1]).toEqual({ shape: 'square', color: 'green' })
      expect(table1.rows[2]).toEqual({ shape: 'circle', color: 'blue' })

      // Test with more loops
      const trials2 = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue', 'yellow', 'purple'],
      }

      const table2 = table.new().zip(trials2, { method: 'loop' })

      expect(table2.rows).toHaveLength(5)
      expect(table2.rows[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table2.rows[1]).toEqual({ shape: 'square', color: 'green' })
      expect(table2.rows[2]).toEqual({ shape: 'circle', color: 'blue' })
      expect(table2.rows[3]).toEqual({ shape: 'square', color: 'yellow' })
      expect(table2.rows[4]).toEqual({ shape: 'circle', color: 'purple' })

      // Test with multiple columns of different lengths
      const trials3 = {
        shape: ['circle'],
        color: ['red', 'green', 'blue'],
        size: ['small', 'medium'],
      }

      const table3 = table.new().zip(trials3, { method: 'loop' })

      expect(table3.rows).toHaveLength(3)
      expect(table3.rows[0]).toEqual({ shape: 'circle', color: 'red', size: 'small' })
      expect(table3.rows[1]).toEqual({ shape: 'circle', color: 'green', size: 'medium' })
      expect(table3.rows[2]).toEqual({ shape: 'circle', color: 'blue', size: 'small' })
    })

    it('should repeat last value when using last method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.new().zip(trials, { method: 'last' })

      expect(table1.rows).toHaveLength(3)
      expect(table1.rows[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table1.rows[1]).toEqual({ shape: 'square', color: 'green' })
      expect(table1.rows[2]).toEqual({ shape: 'square', color: 'blue' })
    })

    it('should throw error for invalid method', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green', 'blue'],
      }

      expect(() => {
        table.new().zip(trials, { method: 'invalid' })
      }).toThrow('Invalid method: invalid. Must be one of: loop, pad, last')
    })

    it('should throw error when zip would exceed safety limit', () => {
      // Create arrays that would exceed the limit when zipped
      const trials = {
        shape: Array(config.max_stepper_rows + 1).fill('circle'),
        color: ['red', 'green'],
      }

      expect(() => {
        table.new().zip(trials)
      }).toThrow(/zip\(\) would generate \d+ rows, which exceeds the safety limit of \d+/)
    })

    it('should be chainable with other methods', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table
        .new()
        .zip(trials)
        .append([{ shape: 'triangle', color: 'blue' }])

      expect(table1.rows).toHaveLength(3)
      expect(table1[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table1[1]).toEqual({ shape: 'square', color: 'green' })
      expect(table1[2]).toEqual({ shape: 'triangle', color: 'blue' })
    })

    it('should handle non-array values as single-element arrays', () => {
      const trials = {
        shape: 'circle',
        color: ['red', 'green', 'blue'],
      }

      const table1 = table.new().zip(trials, { method: 'loop' })

      expect(table1.rows).toHaveLength(3)
      expect(table1[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table1[1]).toEqual({ shape: 'circle', color: 'green' })
      expect(table1[2]).toEqual({ shape: 'circle', color: 'blue' })
    })

    it('should handle multiple non-array values', () => {
      const trials = {
        shape: 'circle',
        color: 'red',
        size: ['small', 'medium'],
      }

      const table1 = table.new().zip(trials, { method: 'loop' })

      expect(table1.rows).toHaveLength(2)
      expect(table1[0]).toEqual({ shape: 'circle', color: 'red', size: 'small' })
      expect(table1[1]).toEqual({ shape: 'circle', color: 'red', size: 'medium' })
    })

    it('should throw error for invalid input', () => {
      expect(() => {
        table.new().zip(null)
      }).toThrow('zip() requires an object with arrays as values')

      expect(() => {
        table.new().zip({})
      }).toThrow('zip() requires at least one column')
    })
  })

  describe('outer()', () => {
    it('should create factorial combinations of columns', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table.new().outer(trials)

      expect(table1.rows).toHaveLength(4)
      expect(table1.rows).toEqual([
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

      const table1 = table.new().outer(trials)

      expect(table1.rows).toHaveLength(8)
      expect(table1.rows).toEqual([
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

      const table1 = table.new().outer(trials)

      expect(table1.rows).toHaveLength(2)
      expect(table1.rows).toEqual([
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

      const table1 = table.new().outer(trials)

      expect(table1.rows).toHaveLength(2)
      expect(table1.length).toBe(2)
      expect(table1.rows).toEqual([
        { shape: 'circle', color: 'red', size: 'small' },
        { shape: 'circle', color: 'red', size: 'medium' },
      ])
    })

    it('should throw error for invalid input', () => {
      expect(() => {
        table.new().outer(null)
      }).toThrow('outer() requires an object with arrays as values')

      expect(() => {
        table.new().outer({})
      }).toThrow('outer() requires at least one column')
    })

    it('should throw error when combinations would exceed safety limit', () => {
      // This will generate 100 * 100 = 10000 combinations
      const trials = {
        x: Array(100).fill('x'),
        y: Array(100).fill('y'),
      }

      expect(() => {
        table.new().outer(trials)
      }).toThrow(/outer\(\) would generate 10000 combinations, which exceeds the safety limit of \d+/)
    })

    it('should allow combinations under the safety limit', () => {
      // This will generate 70 * 70 = 4900 combinations (under the 5000 limit)
      const trials = {
        x: Array(70).fill('x'),
        y: Array(70).fill('y'),
      }

      const table1 = table.new().outer(trials)
      expect(table1.rows).toHaveLength(4900)
    })

    it('should be chainable with other methods', () => {
      const trials = {
        shape: ['circle', 'square'],
        color: ['red', 'green'],
      }

      const table1 = table
        .new()
        .outer(trials)
        .append([{ shape: 'triangle', color: 'blue' }])

      expect(table1.rows).toHaveLength(5)
      expect(table1[0]).toEqual({ shape: 'circle', color: 'red' })
      expect(table1[1]).toEqual({ shape: 'circle', color: 'green' })
      expect(table1[2]).toEqual({ shape: 'square', color: 'red' })
      expect(table1[3]).toEqual({ shape: 'square', color: 'green' })
      expect(table1[4]).toEqual({ shape: 'triangle', color: 'blue' })
    })
  })

  describe('repeat()', () => {
    it('should repeat trials n times', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table1 = table.new().append(trials).repeat(3)

      expect(table1.rows).toHaveLength(6)
      expect(table1.rows).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ])
    })

    it('should handle empty table', () => {
      const table1 = table.new().repeat(10)
      expect(table1.length).toBe(0)
      expect(table1.rows).toEqual([])
    })

    it('should handle n <= 0', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table1 = table.new().append(trials).repeat(0)
      expect(table1.rows).toHaveLength(2)
      expect(table1.rows).toEqual(trials)

      const table2 = table.new().append(trials).repeat(-1)
      expect(table2.rows).toHaveLength(2)
      expect(table2.rows).toEqual(trials)
    })

    it('should be chainable with other methods', () => {
      const trials = [
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
      ]

      const table1 = table
        .new()
        .append(trials)
        .repeat(2)
        .append([{ color: 'green', shape: 'circle' }])

      expect(table1.rows).toHaveLength(5)
      expect(table1.rows).toEqual([
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'red', shape: 'triangle' },
        { color: 'blue', shape: 'square' },
        { color: 'green', shape: 'circle' },
      ])
    })
  })

  describe('partition()', () => {
    it('should partition table into n chunks', () => {
      const table1 = table.new().range(6)
      table1.partition(2)

      expect(table1.rows).toHaveLength(2)
      expect(table1[0].partition).toBe(0)
      expect(table1[1].partition).toBe(1)

      // Check first partition
      const partition1 = table1.rows[0][Symbol.for('table')]
      expect(partition1.rows).toHaveLength(3)
      expect(partition1[0]).toEqual({ range: 0 })
      expect(partition1[1]).toEqual({ range: 1 })
      expect(partition1[2]).toEqual({ range: 2 })

      // Check second partition
      const partition2 = table1.rows[1][Symbol.for('table')]
      expect(partition2.rows).toHaveLength(3)
      expect(partition2[0]).toEqual({ range: 3 })
      expect(partition2[1]).toEqual({ range: 4 })
      expect(partition2[2]).toEqual({ range: 5 })
    })

    it('should handle uneven partitions', () => {
      const table1 = table.new().range(5)
      table1.partition(2)

      expect(table1.rows).toHaveLength(2)

      // First partition should have 3 items (rounded up)
      const partition1 = table1.rows[0][Symbol.for('table')]
      expect(partition1.rows).toHaveLength(3)
      expect(partition1[0]).toEqual({ range: 0 })
      expect(partition1[1]).toEqual({ range: 1 })
      expect(partition1[2]).toEqual({ range: 2 })

      // Second partition should have 2 items
      const partition2 = table1.rows[1][Symbol.for('table')]
      expect(partition2.rows).toHaveLength(2)
      expect(partition2[0]).toEqual({ range: 3 })
      expect(partition2[1]).toEqual({ range: 4 })
    })

    it('should handle empty table', () => {
      const table1 = table.new()
      table1.partition(2)
      expect(table1.rows).toHaveLength(0)
    })

    it('should throw error if n <= 0', () => {
      const table1 = table.new().range(6)
      expect(() => {
        table1.partition(0)
      }).toThrow('partition() must be called with a positive integer')
      expect(() => {
        table1.partition(-1)
      }).toThrow('partition() must be called with a positive integer')
    })

    it('should be chainable with other methods', () => {
      const table1 = table
        .new()
        .range(6)
        .partition(2)
        .forEach((row) => {
          row[Symbol.for('table')].forEach((item) => {
            item.type = 'test'
          })
        })

      // Check that forEach worked on nested tables
      const partition1 = table1[0].nested
      const partition2 = table1[1].nested

      partition1.rows.forEach((row) => {
        expect(row.type).toBe('test')
      })
      partition2.rows.forEach((row) => {
        expect(row.type).toBe('test')
      })
    })
  })

  describe('shuffle()', () => {
    it('should shuffle rows with a specific seed', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ])

      // Shuffle with a specific seed
      table1.shuffle('test-seed-123')

      // The order should be deterministic with this seed
      expect(table1.rows.map((r) => r.id)).toEqual([3, 1, 5, 2, 4])
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
      const table1 = table.new().append(data)
      const table2 = table.new().append(data)

      // Shuffle both with same seed
      table1.shuffle('test-seed-123')
      table2.shuffle('test-seed-123')

      // They should have the same order
      expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
    })

    it('should use global seeded RNG when no seed is provided', () => {
      const table1 = table.new().append([
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
      expect(table1.rows.map((r) => r.id)).toEqual([5, 2, 4, 1, 3])
    })

    it('should preserve all elements after shuffling', () => {
      const originalData = [
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
        { id: 4, value: 'd' },
        { id: 5, value: 'e' },
      ]

      const table1 = table.new().append(originalData)
      const originalIds = [...table1.rows.map((r) => r.id)].sort()

      // Shuffle with a specific seed
      table1.shuffle('test-seed-123')
      const shuffledIds = [...table1.rows.map((r) => r.id)].sort()

      // All elements should still be present, just in different order
      expect(shuffledIds).toEqual(originalIds)
    })

    it('should handle empty table', () => {
      const table1 = table.new()
      table1.shuffle('test-seed-123')
      expect(table1.rows).toEqual([])
    })

    it('should handle single element table', () => {
      const table1 = table.new().append([{ id: 1, value: 'a' }])
      table1.shuffle('test-seed-123')
      expect(table1.rows).toEqual([{ id: 1, value: 'a' }])
    })

    it('should be chainable with other methods', () => {
      const table1 = table
        .new()
        .append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ])
        .shuffle('test-seed-123')
        .append([{ id: 4, value: 'd' }])

      expect(table1.rows).toHaveLength(4)
      expect(table1.rows[3]).toEqual({ id: 4, value: 'd' })
    })
  })

  describe('sample()', () => {
    it('should handle empty table', () => {
      const table1 = table.new()
      table1.sample({ type: 'without-replacement', size: 5 })
      expect(table1.rows).toEqual([])
    })

    it('should throw error for invalid sampling type', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      expect(() => {
        table1.sample({ type: 'invalid-type' })
      }).toThrow('Invalid sampling type: invalid-type')
    })

    it('should throw error when exceeding safety limit', () => {
      const table1 = table.new().append([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])

      expect(() => {
        table1.sample({
          type: 'with-replacement',
          size: config.max_stepper_rows + 1,
        })
      }).toThrow(/sample\(\) would generate \d+ rows, which exceeds the safety limit/)
    })

    describe('with-replacement sampling', () => {
      it('should require size parameter', () => {
        const table1 = table.new().append([
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

        const table1 = table.new().append(data)
        table1.sample({ type: 'with-replacement', size: 5 })

        expect(table1.rows).toHaveLength(5)
        // Check that all sampled items are from the original data
        table1.rows.forEach((row) => {
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
        const table1 = table.new().append(data)
        const table2 = table.new().append(data)

        // Sample both with same seed
        table1.sample({ type: 'with-replacement', size: 5, seed: 'test-seed-123' })
        table2.sample({ type: 'with-replacement', size: 5, seed: 'test-seed-123' })

        // They should have the same order
        expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
      })

      it('should handle weighted sampling', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
        ]

        const table1 = table.new().append(data)
        table1.sample({
          type: 'with-replacement',
          size: 1000,
          weights: [0.5, 0.3, 0.2],
          seed: 'test-seed-123',
        })

        // Count occurrences
        const counts = table1.rows.reduce((acc, row) => {
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

        const table1 = table.new().append(data)

        // Test with too few weights
        expect(() => {
          table1.sample({
            type: 'with-replacement',
            size: 5,
            weights: [0.5, 0.3], // Only 2 weights for 3 items
            seed: 'test-seed-123',
          })
        }).toThrow('Weights array length must match the number of trials')

        // Test with too many weights
        expect(() => {
          table1.sample({
            type: 'with-replacement',
            size: 5,
            weights: [0.5, 0.3, 0.2, 0.1], // 4 weights for 3 items
            seed: 'test-seed-123',
          })
        }).toThrow('Weights array length must match the number of trials')
      })
    })

    describe('without-replacement sampling', () => {
      it('should require size parameter', () => {
        const table1 = table.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'without-replacement' })
        }).toThrow('size parameter is required for without-replacement sampling')
      })

      it('should not allow size larger than available trials', () => {
        const table1 = table.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'without-replacement', size: 3 })
        }).toThrow('Sample size cannot be larger than the number of available trials')
      })

      it('should sample without replacement', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        const table1 = table.new().append(data)
        table1.sample({ type: 'without-replacement', size: 2 })

        expect(table1.rows).toHaveLength(2)
        // Check that no item appears twice
        const ids = table1.rows.map((r) => r.id)
        expect(new Set(ids).size).toBe(2)
        // Check that all sampled items are from the original data
        table1.rows.forEach((row) => {
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
        const table1 = table.new().append(data)
        const table2 = table.new().append(data)

        // Sample both with same seed
        table1.sample({ type: 'without-replacement', size: 2, seed: 'test-seed-123' })
        table2.sample({ type: 'without-replacement', size: 2, seed: 'test-seed-123' })

        // They should have the same order
        expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
      })
    })

    describe('fixed-repetitions sampling', () => {
      it('should require size parameter', () => {
        const table1 = table.new().append([
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

        const table1 = table.new().append(data)
        table1.sample({ type: 'fixed-repetitions', size: 3 })

        expect(table1.rows).toHaveLength(6) // 2 trials * 3 repetitions
        // Count occurrences of each trial
        const counts = table1.rows.reduce((acc, row) => {
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

        const table1 = table.new().append(data)
        table1.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })

        // The order should be different from the original
        expect(table1.rows.map((r) => r.id)).not.toEqual([1, 1, 1, 2, 2, 2])
      })

      it('should produce consistent results with same seed', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ]

        // Create two tables with same data
        const table1 = table.new().append(data)
        const table2 = table.new().append(data)

        // Sample both with same seed
        table1.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })
        table2.sample({ type: 'fixed-repetitions', size: 3, seed: 'test-seed-123' })

        // They should have the same order
        expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
      })
    })

    describe('alternate-groups sampling', () => {
      it('should require groups parameter', () => {
        const table1 = table.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'alternate-groups' })
        }).toThrow('groups parameter is required for alternate-groups sampling')
      })

      it('should require at least two groups', () => {
        const table1 = table.new().append([
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

        const table1 = table.new().append(data)
        table1.sample({
          type: 'alternate-groups',
          groups: [
            [0, 2],
            [1, 3],
          ], // Group 1: [a, c], Group 2: [b, d]
        })

        // Should alternate between groups: [a, b, c, d]
        expect(table1.rows.map((r) => r.id)).toEqual([1, 2, 3, 4])
      })

      it('should handle groups of different sizes', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
          { id: 5, value: 'e' },
        ]

        const table1 = table.new().append(data)
        table1.sample({
          type: 'alternate-groups',
          groups: [
            [0, 1],
            [2, 3, 4],
          ], // Group 1: [a, b], Group 2: [c, d, e]
        })

        // Should alternate between groups until shortest group is exhausted
        // and then continue with remaining elements from longer group
        expect(table1.rows.map((r) => r.id)).toEqual([1, 3, 2, 4, 5])
      })

      it('should randomize group order when requested', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        const table1 = table.new().append(data)
        table1.sample({
          type: 'alternate-groups',
          groups: [
            [0, 2],
            [1, 3],
          ],
          randomize_group_order: true,
          seed: 'test-seed-123',
        })

        // The order should be different from the default
        // With this seed, the groups should be in reverse order
        expect(table1.rows.map((r) => r.id)).toEqual([2, 4, 1, 3])
      })

      it('should produce consistent results with same seed', () => {
        const data = [
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
          { id: 3, value: 'c' },
          { id: 4, value: 'd' },
        ]

        // Create two tables with same data
        const table1 = table.new().append(data)
        const table2 = table.new().append(data)

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
        expect(table1.rows.map((r) => r.id)).toEqual(table2.rows.map((r) => r.id))
      })

      it('should validate group indices', () => {
        const table1 = table.new().append([
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
        const table1 = table.new().append([
          { id: 1, value: 'a' },
          { id: 2, value: 'b' },
        ])

        expect(() => {
          table1.sample({ type: 'custom' })
        }).toThrow('fn parameter is required for custom sampling')
      })

      it('should require fn to be a function', () => {
        const table1 = table.new().append([
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

        const table1 = table.new().append(data)
        table1.sample({
          type: 'custom',
          fn: (indices) => indices.reverse(), // Reverse the order
        })

        expect(table1.rows.map((r) => r.id)).toEqual([3, 2, 1])
      })

      it('should validate custom function output', () => {
        const table1 = table.new().append([
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
        const table1 = table.new().append([
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

  describe('head()', () => {
    it('should return first n elements', () => {
      const table1 = table.new().range(5)
      table1.head(3)
      expect(table1.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(table1[i]).toEqual({ range: i })
      }
    })

    it('should return all elements if n is greater than length', () => {
      const table1 = table.new().range(3)
      table1.head(5) // n > length
      expect(table1.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(table1[i]).toEqual({ range: i })
      }
    })

    it('should throw error if n <= 0', () => {
      const table1 = table.new().range(3)
      expect(() => {
        table1.head(0)
      }).toThrow('head() must be called with a positive integer')
      expect(() => {
        table1.head(-1)
      }).toThrow('head() must be called with a positive integer')
    })

    it('should be chainable with other methods', () => {
      const table1 = table
        .new()
        .range(5)
        .head(3)
        .forEach((row) => ({ ...row, type: 'test' }))

      expect(table1.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(table1[i]).toEqual({ range: i, type: 'test' })
      }
    })
  })

  describe('tail()', () => {
    it('should return last n elements', () => {
      const table1 = table.new().range(5)
      table1.tail(3)
      expect(table1.rows).toHaveLength(3)
      // The last 3 elements should be [2, 3, 4] in that order
      expect(table1[0]).toEqual({ range: 2 })
      expect(table1[1]).toEqual({ range: 3 })
      expect(table1[2]).toEqual({ range: 4 })
    })

    it('should return all elements if n is greater than length', () => {
      const table1 = table.new().range(3)
      table1.tail(5) // n > length
      expect(table1.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(table1[i]).toEqual({ range: i })
      }
    })

    it('should throw error if n <= 0', () => {
      const table1 = table.new().range(3)
      expect(() => {
        table1.tail(0)
      }).toThrow('tail() must be called with a positive integer')
      expect(() => {
        table1.tail(-1)
      }).toThrow('tail() must be called with a positive integer')
    })

    it('should be chainable with other methods', () => {
      const table1 = table
        .new()
        .range(5)
        .tail(3)
        .forEach((row) => ({ ...row, type: 'test' }))

      expect(table1.rows).toHaveLength(3)
      // The last 3 elements should be [2,3,4] in that order, with added type
      expect(table1[0]).toEqual({ range: 2, type: 'test' })
      expect(table1[1]).toEqual({ range: 3, type: 'test' })
      expect(table1[2]).toEqual({ range: 4, type: 'test' })
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
      const table1 = table.new().append([
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
      const trials = table.new().range(2)
      trials[0].new().append([
        { type: 'stim', value: 1 },
        { type: 'feedback', value: 2 },
      ])
      trials[1].new().append([{ type: 'stim', value: 3 }])

      trials.print()

      expect(consoleSpy).toHaveBeenCalledTimes(8)
      expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Table with 2 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '[0]:', { range: 0 })
      expect(consoleSpy).toHaveBeenNthCalledWith(3, '  Table with 2 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(4, '  [0]:', { type: 'stim', value: 1 })
      expect(consoleSpy).toHaveBeenNthCalledWith(5, '  [1]:', { type: 'feedback', value: 2 })
      expect(consoleSpy).toHaveBeenNthCalledWith(6, '[1]:', { range: 1 })
      expect(consoleSpy).toHaveBeenNthCalledWith(7, '  Table with 1 rows:')
      expect(consoleSpy).toHaveBeenNthCalledWith(8, '  [0]:', { type: 'stim', value: 3 })
    })

    it('should handle empty tables', () => {
      const emptyTable = table.new()
      emptyTable.print()

      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith('Table with 0 rows:')
    })

    it('should return this for chaining', () => {
      const table1 = table.new().append([{ value: 1 }])
      const result = table1.print()

      expect(result).toBe(table1)
      expect(consoleSpy).toHaveBeenCalled()
    })

    it('should filter out methods and symbols from output', () => {
      const table1 = table.new().append([
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

  describe('recursive table functionality', () => {
    it('should allow creating nested tables on rows', () => {
      const trials = table.new().range(3)

      // Create nested tables
      const nestedTable1 = trials[0].new().range(3)
      const nestedTable2 = trials[1].new().range(5)
      const nestedTable3 = trials[1].new().append({ color: 'red', shape: 'triangle' })

      // Check first row's nested table
      expect(nestedTable1.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable1.rows[i]).toEqual({ range: i })
      }

      // Check second row's first nested table
      expect(nestedTable2.rows).toHaveLength(5)
      for (let i = 0; i < 5; i++) {
        expect(nestedTable2.rows[i]).toEqual({ range: i })
      }

      // Check second row's second nested table
      expect(nestedTable3.rows).toHaveLength(1)
      expect(nestedTable3.rows[0]).toEqual({ color: 'red', shape: 'triangle' })

      // Verify original table is unchanged by checking raw rows
      expect(trials.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        // Only check the range property
        expect(trials.rows[i].range).toBe(i)
      }
    })

    it('should store nested tables in the row', () => {
      const trials = table.new().range(2)

      // Create nested table
      const nestedTable = trials[0].new().range(3)

      // Verify the nested table is stored in the row using Symbol
      expect(trials[0].nested).toBe(nestedTable)
    })

    it('should allow chaining on nested tables', () => {
      const trials = table.new().range(2)

      // Create and chain operations on nested table
      const nestedTable = trials[0]
        .new()
        .range(3)
        .forEach((row) => ({ ...row, type: 'test' }))
        .append([{ range: 3, type: 'extra' }])

      expect(nestedTable.rows).toHaveLength(4)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable[i]).toEqual({ range: i, type: 'test' })
      }
      expect(nestedTable[3]).toEqual({ range: 3, type: 'extra' })
    })

    it('should allow multiple nested tables per row', () => {
      const trials = table.new().range(2)

      // Create multiple nested tables on the same row
      const nestedTable1 = trials[0].new().range(2)
      const nestedTable2 = trials[0].new().range(3)

      expect(nestedTable1.rows).toHaveLength(2)
      expect(nestedTable2.rows).toHaveLength(3)

      // The last created table should be stored in the row
      expect(trials[0].nested).toBe(nestedTable2)
    })

    it('should support deeply nested tables', () => {
      const trials = table.new().range(3)

      // Create a deeply nested structure
      const level1 = trials[0].new().range(3)
      const level2 = level1[0].new().range(3)
      const level3 = level2[0].new().range(3)

      // Check each level
      expect(trials.rows).toHaveLength(3)
      expect(level1.rows).toHaveLength(3)
      expect(level2.rows).toHaveLength(3)
      expect(level3.rows).toHaveLength(3)

      // Verify we can chain operations at any level
      level3[1].new().append({ color: 'red', shape: 'triangle' })
      expect(level3[1].nested[0]).toEqual({ color: 'red', shape: 'triangle' })

      // Verify we can create multiple nested tables at any level
      const anotherLevel3 = level2[1].new().range(2)
      expect(anotherLevel3.rows).toHaveLength(2)
    })
  })

  describe('Complex Operations', () => {
    it('should handle nesting after shuffling', () => {
      const trials = table.new().range(10).shuffle()
      const nestedTable2 = trials[0].new().range(3)
      expect(nestedTable2.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable2[i]).toEqual({ range: i })
      }
    })

    it('should handle nesting after sampling', () => {
      const trials = table.new().range(10)
      trials.sample({
        type: 'with-replacement',
        size: 3,
      })
      const nestedTable2 = trials[0].new().range(3)
      expect(nestedTable2.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable2[i]).toEqual({ range: i })
      }
    })

    it('should handle shuffling at the top level after a nested table created', () => {
      const trials = table.new().range(10)
      const nestedTable2 = trials[3].new().range(3)
      trials.shuffle()
      expect(nestedTable2.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(nestedTable2[i]).toEqual({ range: i })
      }
    })

    it('should copy the nested table when repeating', () => {
      const trials = table.new().range(10)
      const nestedTable2 = trials[3].new().range(3)
      trials.repeat(2)

      // Verify that the original nested table is still in place
      expect(trials[3].nested).toBe(nestedTable2)

      // Verify that the repeated row has a different nested table instance
      expect(trials[13].nested).not.toBe(nestedTable2)

      // Verify that the repeated nested table has the same data
      expect(trials[13].nested.rows).toHaveLength(3)
      for (let i = 0; i < 3; i++) {
        expect(trials[13].nested[i]).toEqual({ range: i })
      }

      // Verify that modifying the repeated nested table doesn't affect the original
      trials[13].nested[0].value = 'modified'
      expect(trials[3].nested[0].value).toBeUndefined()
    })

    it('should allow creating nested tables with forEach', () => {
      const trials = table.new().range(10)
      expect(trials[0].length).toBe(1)

      trials.forEach((row, i) => {
        row.append({ trial: i })
        row.new().append([
          { type: 'stim', index: i },
          { type: 'feedback', index: i },
        ])
      })

      expect(trials[0].length).toBe(1)
      expect(Object.keys(trials[0]).length).toBe(2)

      trials.rows.forEach((row) => {
        const nestedTable2 = row[Symbol.for('table')]
        expect(nestedTable2).toBeDefined()
        expect(nestedTable2.rows).toHaveLength(2)
        expect(nestedTable2[0].index).toBe(row.trial)
        expect(nestedTable2[1].index).toBe(row.trial)
      })
    })
  })
})
