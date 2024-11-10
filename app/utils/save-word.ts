export async function saveWord(formData: { [k: string]: FormDataEntryValue }) {
  const { headword, root, ergative, speechPart, origin } = formData;


  const translations = Object.keys(formData)
    .filter((key) => key.startsWith('translations['))
    .map(key => ({ 'translation': formData[key] } as { 'translation': string }));



  // Parse `examples` into an array of objects with `example` and `translation`
  const examples = Object.keys(formData)
    .filter((key) => key.startsWith("examples"))
    .reduce((acc, key) => {
      const match = key.match(/^examples(\d+)\.(example|translation)$/);
      if (match) {
        type FieldType = 'example' | 'translation';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, index, field] = match;
        const exampleIndex = parseInt(index, 10);

        // Initialize the example object if it doesn't exist
        if (!acc[exampleIndex]) {
          acc[exampleIndex] = { example: "", translation: "" };
        }

        // Assign the field value
        acc[exampleIndex][field as FieldType] = formData[key] as string;
      }
      return acc;
    }, [] as { example: string; translation: string }[]);




  // Return the data in the expected format for Prisma
  return {
    data: {
      headword: headword as string,
      root: root as string,
      ergative: ergative as string,
      speechPart: speechPart as string,
      origin: origin as string,
      translations: {
        create: translations
      },
      examples: {
        create: examples
      }
    }
  };
}

