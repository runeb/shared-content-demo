import React, { useState, useEffect, useRef } from 'react'
import SearchableSelect from 'part:@sanity/components/selects/searchable'
import FormField from 'part:@sanity/components/formfields/default'
//import Preview from '@sanity/form-builder/lib/Preview'
import subscriptionManager from '@sanity/form-builder/lib/utils/subscriptionManager'
import { uniqueId } from 'lodash'
import { FOCUS_TERMINATOR } from '@sanity/util/paths'
import PatchEvent, { set, unset, setIfMissing } from '@sanity/form-builder/PatchEvent'
import styles from './ExternalReferenceInput.css'

const ExternalReferenceInput = props => {
  const [hits, setHits] = useState([])
  const [previewSnapshot, setPreviewSnapshot] = useState(null)
  const [isMissing, setIsMissing] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [subscriptions] = useState(() => {
    return subscriptionManager('search', 'previewSnapshot')
  })

  const input = useRef(null)
  const _inputId = uniqueId('ExternalReferenceInput')
  const { type, value, level, markers, readOnly, presence } = props

  useEffect(() => {
    if (subscriptions) {
      getPreviewSnapshot(value)
    }
  }, [subscriptions, value])

  useEffect(() => {
    return () => {
      if (subscriptions) {
        subscriptions.unsubscribeAll()
      }
    }
  }, [])

  useEffect(() => {
    setHits([])
    setPreviewSnapshot(null)
    setIsMissing(false)
    setIsFetching(false)
  }, [value])

  const getPreviewSnapshot = (value) => {
    if (!value || !value.id) { return }
    const { client } = props
    const query = '* [_id == $id][0]'
    const params = { id: value.id }
    client.fetch(query, params).then(doc => {
      setPreviewSnapshot(getPreviewSnapshotValues(doc))
      setIsMissing(!doc)
    })
    subscriptions.replace(
      'previewSnapshot',
      client.listen('* [_id == $id]', { id: value.id }).subscribe(update => {
        setPreviewSnapshot(getPreviewSnapshotValues(update.result))
        setIsMissing(!update.result)
      })
    )
  }

  const getPreviewSnapshotValues = (doc) => {
    if (!doc) return null
    const refType = getMemberTypeFor(doc._type)
    const { preview } = refType
    return {
      title: doc[preview.select.title]
    }
  }

  const getMemberTypeFor = (typeName) => {
    const { type } = props
    const { options } = type
    return options.to.find(ofType => ofType.type === typeName)
  }

  const handleFocus = () => {
    const { onFocus } = props
    if (onFocus) {
      onFocus([FOCUS_TERMINATOR])
    }
  }

  const handleChange = (item) => {
    const { type, onChange } = props
    const { options } = type
    onChange(
      PatchEvent.from(
        setIfMissing({
          _type: type.name,
          dataset: options.dataset,
          projectId: options.projectId,
          id: item._id
        }),
        set(item._id, ['id']),
        set(options.dataset, ['dataset']),
        set(options.projectId, ['projectId'])
      )
    )
  }

  const handleClear = () => {
    props.onChange(PatchEvent.from(unset()))
  }

  const handleSearch = query => search(query)
  const handleOpen = () => search('')

  const resolveUserDefinedFilter = () => {
    const { type, document, getValuePath } = props
    const options = type.options
    if (!options) { return {} }

    const { filter, filterParams: params } = options
    if (typeof filter === 'function') {
      const parentPath = getValuePath().slice(0, -1)
      const parent = get(document, parentPath)
      return filter({ document, parentPath, parent })
    }

    return { filter, params }
  }

  const search = (query) => {
    const { type, onSearch } = props
    const options = resolveUserDefinedFilter()

    setIsFetching(true)
    subscriptions.replace(
      'search',
      onSearch(query, type, options).subscribe({
        next: (items) => {
          setHits(items)
          setIsFetching(false)
        },
        error: (err) => {
          const isQueryError = err.details && err.details.type === 'queryParseError'
          if (!isQueryError || !resolveUserDefinedFilter().filter) {
            throw err
          }

          err.message = 'Invalid reference filter, please check `filter`!'
          throw err
        }
      })
    )
  }
  const renderHit = (item) => {
    // TODO: Need to fix this for nice previews in search list. Also stop using the first weight (w0) as the property here
    return <span>{item.w0}</span>
  }

  const focus = () => {
    if (input.current) {
      input.current.focus()
    }
  }
  const valueFromHit = value && hits.find(hit => hit._id === value.id)

  const hasRef = value && value.id
  const validation = markers.filter(marker => marker.type === 'validation')
  const errors = validation.filter(marker => marker.level === 'error')
  let inputValue = value ? previewSnapshot && previewSnapshot.title : undefined
  if (previewSnapshot && !previewSnapshot.title) {
    inputValue = 'Untitled document'
  }
  const isLoadingSnapshot = value && value.id && !previewSnapshot
  const placeholder = isLoadingSnapshot ? 'Loading…' : 'Type to search…'
  return (
    <FormField
      labelFor={_inputId}
      markers={markers}
      label={type.title}
      level={level}
      description={type.description}
      presence={presence}
    >
      <div className={isMissing ? styles.hasWarnings : ''}>
        <SearchableSelect
          inputId={_inputId}
          placeholder={readOnly ? '' : placeholder}
          title={
            isMissing && hasRef
              ? `Referencing nonexistent document (id: ${value.id || 'unknown'})`
              : previewSnapshot && previewSnapshot.description
          }
          customValidity={errors.length > 0 ? errors[0].item.message : ''}
          onOpen={handleOpen}
          onFocus={handleFocus}
          onSearch={handleSearch}
          onChange={handleChange}
          onClear={handleClear}
          //openItemElement={this.renderOpenItemElement}
          value={valueFromHit || value}
          inputValue={isMissing ? '<inaccessible or nonexistent reference>' : inputValue}
          renderItem={renderHit}
          isLoading={isFetching || isLoadingSnapshot}
          items={hits}
          ref={input}
          readOnly={readOnly || isLoadingSnapshot}
        />
      </div>
    </FormField>
  )
}

export default ExternalReferenceInput