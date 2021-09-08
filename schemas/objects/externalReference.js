import ExternalReference from "../components/ExternalReference"

export default {
  type: 'object',
  name: 'externalReference',
  fields: [
    {
      type: 'string',
      name: 'dataset'
    },
    // Note we do not use '_ref' here, since that is a special name on Sanity.
    {
      type: 'string',
      name: 'id'
    }
  ],
  inputComponent: ExternalReference
}