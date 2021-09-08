import React, { useEffect } from "react";
import { setIfMissing, unset } from "part:@sanity/form-builder/patch-event";
import Fieldset from "part:@sanity/components/fieldsets/default";
import { FormBuilderInput } from "@sanity/form-builder/lib/FormBuilderInput";
import client from "part:@sanity/base/client";
import schema from "part:@sanity/base/schema";

const FieldReferenceInput = (props) => {
  const firstFieldInput = React.createRef();
  const { type, value, level, focusPath, onChange, onFocus, onBlur } = props;
  const [fieldOptions, setFieldOptions] = React.useState([]);

  const handleFieldChange = (field, fieldPatchEvent) => {
    let patches = fieldPatchEvent
      .prefixAll(field.name)
      .prepend(setIfMissing({ _type: type.name }));
    onChange(patches);
  };

  useEffect(() => {
    const fetch = async () => {
      client
        .fetch("* [_id == $id][0]{_type}", { id: value.reference._ref })
        .then((result) => result._type)
        .then((type) => schema.get(type).fields)
        .then((fields) => fields.map((f) => ({ title: f.name, value: f.name })))
        .then(setFieldOptions);
    };
    if (value && value.reference && value.reference._ref) {
      fetch();
    }
  }, [value]);

  return (
    <Fieldset level={level} legend={type.title} description={type.description}>
      <>
        {type.fields.map((field, i) => {
          let selectField = field.name === "property";
          if (selectField) {
            if (!field.type.options) {
              field.type.options = {};
            }
            field.type.options.list = fieldOptions;
          }

          return (
            <FormBuilderInput
              level={level}
              ref={i === 0 ? firstFieldInput : null}
              key={field.name}
              type={field.type}
              value={value && value[field.name]}
              onChange={(patchEvent) => handleFieldChange(field, patchEvent)}
              path={[field.name]}
              focusPath={focusPath}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          );
        })}
      </>
    </Fieldset>
  );
};

export default FieldReferenceInput;