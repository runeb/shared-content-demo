export default {
  type: "document",
  name: "page",
  fields: [
    {
      type: "string",
      name: "title"
    },
    {
      name: 'postRef',
      title: 'Post',
      type: 'externalReference',
      description: "This field references a Post in the sanity.io production dataset, which is in both a different project and dataset from this Studio.",
      options: {
        to: [
          {
            type: 'post',
            // We need to specify how to preview this doocument, since its not part of the current schema
            preview: {
              select: {
                title: 'title'
              }
            }
          }
        ],
        // The fields we search with when editor wants to make a reference
        searchFields: ['title'],
        // The name of the dataset it resides in
        dataset: 'production',
        // The name of the project it resides in
        projectId: "3do82whm"
      },
    },
    {
      type: "fieldReference",
      name: "fr",
      title: "Field reference",
      description: "Referencing both a document and a field on that document. Likely will want a better value preview, instead of the metadata"
    }
  ]
}