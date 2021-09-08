import createSchema from 'part:@sanity/base/schema-creator'
import schemaTypes from 'all:part:@sanity/base/schema-type'

import hero from "./documents/hero"
import page from "./documents/page"
import fieldReference from "./objects/fieldReference"
import externalReference from "./objects/externalReference"

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    externalReference,
    fieldReference,
    page,
    hero
  ]),
})
