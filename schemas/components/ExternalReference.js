import React, { useRef } from 'react'
import { map } from 'rxjs/operators'
import { createWeightedSearch } from 'part:@sanity/base/search/weighted'
import client from 'part:@sanity/base/client'
import ExternalReferenceInput from './ExternalReferenceInput'

const ExternalReference = props => {
  const { type } = props
  const { options } = type
  const { dataset, projectId } = options

  // Configure a client pointed at the other dataset
  const externalClient = client.clone().config({ dataset, projectId })

  // Figure out how to search for the documents in
  // the other dataset. Use the options.searchFields array
  const searchFields = (options.searchFields || [])
  const searchTerms = searchFields.map(field => (
    {
      weight: 1 / searchFields.length,
      path: [field]
    }
  ))

  // This is how we search for documents in the other dataset
  const search = (textTerm) => {
    const doSearch = createWeightedSearch(options.to.map(to => ({
      name: to.type,
      __experimental_search: searchTerms
    })), externalClient)
    return doSearch(textTerm, { includeDrafts: false }).pipe(
      map((results) => results.map(res => res.hit))
    )
  }

  return (
    <ExternalReferenceInput
      {...props}
      onSearch={search}
      client={externalClient}
    />
  )
}

export default ExternalReference