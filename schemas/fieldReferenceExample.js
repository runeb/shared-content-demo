export default {
  type: "document",
  name: "testDocument",
  fields: [
    {
      type: "string",
      name: "title",
    },
    {
      name: "body",
      type: "array",
      of: [
        {
          type: "block",
          of: [
            {
              type: "fieldReference",
            },
          ],
        },
        {
          type: "fieldReference",
        },
      ],
    },
  ],
};