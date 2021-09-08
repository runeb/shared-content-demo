const FieldReferencePreview = (props) => {
  const { value } = props;
  const [display, setDisplay] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const refId = value && value.reference && value.reference._ref;
  const property = value && value.property;

  React.useEffect(() => {
    async function query() {
      client
        .fetch(`* [_id == $id]{${value.property}}[0][$prop]`, {
          id: value.reference._ref,
          prop: value.property,
        })
        .then(setDisplay)
        .finally(() => setLoading(false));
    }
    if (refId && property) {
      query();
    } else {
      setDisplay("Missing selection");
      setLoading(false);
    }
  }, [refId, property]);

  if (loading) {
    return <small>Loading...</small>;
  }

  return <span>{(display || "").toString()}</span>;
};