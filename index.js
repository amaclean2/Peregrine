#!/usr/bin/env node

const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')
const fs = require('fs')

const options = yargs(hideBin(process.argv))
  .usage('Usage: yarn filter -m <model> -p <property>')
  .option('input', {
    alias: 'i',
    describe: 'The data file to be processed',
    type: 'string',
    default: 'entities.json'
  })
  .option('models', {
    alias: 'm',
    describe: 'Model(s) to include',
    type: 'array'
  })
  .option('properties', {
    alias: 'p',
    type: 'array',
    describe: `
    Properties to filter on.
    Assumes no key has ':' or ' ' and no property has ','. Format key:value1,value2
    `
  }).argv

const data = JSON.parse(fs.readFileSync(options.input, 'utf8'))

/**
 * Takes a list of entity objects, filters data matching the `models` and `properties` specifications,
 * and then aggregates the data returning a sorted list of aggregations.
 *
 * Whenever the data is pulled
 *
 * @param data - The list entity data
 * @param modelFilters - A list of models to filter the aggregation on
 * @param propertyFilters - A list of property keys and values to filter the aggregation on. Format: key:value1,value2
 *
 * @returns A dictionary of property slugs to a sorted list of aggregations
 */

// for some reason this only works with -m and -p, not --model and --properties
const run = (data, modelFilters, propertyFilters) => {
  // filters come through as comma separated when parsed from options in the format
  // provided in the examples.
  // This splits them on the comma, hopefully no filter should include a comma
  const modelFiltersParsed = modelFilters?.[0].split(',') ?? []

  let currentFilter
  // this turns propertyFilters into an object, keys being the property slug and values
  // being the property value
  const propertyFiltersParsed =
    propertyFilters?.reduce((accumulator, filter) => {
      const [filterSlug, filterProperties] = filter.split(':')
      accumulator[filterSlug] = filterProperties.split(',')

      return accumulator
    }, {}) ?? {}

  // first we filter the data to find only the entries that match our properties and models
  if (modelFiltersParsed.length !== 0) {
    return data
      .filter((entity) => {
        // only continue if the data point matches the model
        let modelTrue = modelFiltersParsed.includes(entity.model)

        let propertyTrue = false

        // filter based on whether the properties match
        if (Object.keys(propertyFiltersParsed).length !== 0) {
          propertyTrue = entity.properties.some((property) =>
            propertyFiltersParsed[property.slug]?.includes(property.value)
          )
        }

        return modelTrue || propertyTrue
      })
      .reduce((accumulator, point) => {
        // reduce the results to objects reporting how many times each value shows up in the database
        // TODO: at some point in the future, it might be a good idea to cache these to be able to reuse them
        // rather than having to rebuilt this object every time.
        // Upon thinking about it further, though, to reuse this object it would take some heavy manipulation
        // because this data doesn't meet the same specifications to be able to search on it well.
        // Requires further thought...

        point.properties.forEach((property) => {
          if (accumulator[property.slug]) {
            // if, for instance, first_name is already a key
            const values = accumulator[property.slug]
            // check if the value exists or not
            const idx = values.findIndex((value) => value[0] === property.value)

            if (idx === -1) {
              accumulator[property.slug].push([property.value, 1])
            } else {
              accumulator[property.slug][idx][1] += 1
            }
          } else {
            // initiate a new slug
            accumulator[property.slug] = [[property.value, 1]]
          }
        })
        return accumulator
      }, {})
  } else {
    return data
  }
}

console.log(run(data, options.models, options.properties))
