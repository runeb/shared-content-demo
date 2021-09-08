import FieldReferenceInput from "../components/FieldReferenceInput"
import FieldReferencePreview from "../components/FieldReferencePreview"

// Which components to make selectable
import hero from "../documents/hero"
// etc...
const pageComponents = [hero];

export default {
  name: "fieldReference",
  title: "Field reference",
  type: "object",
  fields: [
    {
      name: "reference",
      type: "reference",
      to: pageComponents.map((c) => ({ type: c.name })),
    },
    {
      name: "property",
      type: "string",
    },
  ],
  preview: {
    select: {
      reference: "reference",
      property: "property",
    },
    component: FieldReferencePreview,
  },
  inputComponent: FieldReferenceInput
}