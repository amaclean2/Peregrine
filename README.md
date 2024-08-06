# Peregrine take-home prompt

## Getting started

To install deps (requires node version at least 12):

```
yarn install # (or npm install)
```

## Example usage

```
# Run with no filters, should return all data aggregated
yarn aggregate
# {'age': [[36, 136], [35, 96], ...], 'city': [['vallejo', 152], ...]}

# Aggregate entities that are either case or vehicle model that have property year with the value 2008
yarn aggregate --models case vehicle --properties year:2008

> [!IMPORTANT]
> For some reason this project only works with -m and -p, not --model and --properties

# Aggregate entities that have a `first_name` property that is ben OR elise and a `last_name` of lopez
yarn aggregate --properties first_name:ben,elise last_name:lopez

# Aggregate entities with a `year` property that has a value of 2008
yarn aggregate --properties year:2008
```
