import { prisma } from "./db.server";

export async function saveWord(
  formData: { [k: string]: FormDataEntryValue },
  wordId?: string
) {
  const { headword, root, ergative, speechPart, origin } = formData;

  const translations = Object.keys(formData)
    .filter((key) => key.startsWith("translations["))
    .map((key) => ({ translation: formData[key] } as { translation: string }));

  // Parse `examples` into an array of objects with `example` and `translation`
  const examples = Object.keys(formData)
    .filter((key) => key.startsWith("examples"))
    .reduce((acc, key) => {
      const match = key.match(/^examples(\d+)\.(example|translation)$/);
      if (match) {
        type FieldType = "example" | "translation";
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

  // Filter out empty examples (both fields are empty)
  const filteredExamples = examples.filter((ex) => {
    const exampleTrimmed = ex.example.trim();
    const translationTrimmed = ex.translation.trim();
    return exampleTrimmed !== "" || translationTrimmed !== "";
  });

  const wordData = {
    headword: headword as string,
    root: root as string,
    ergative: ergative as string,
    speechPart: speechPart as string,
    origin: origin as string,
    translations: {
      create: translations,
    },
    examples: {
      create: filteredExamples,
    },
  };

  if (wordId) {
    // Update existing word
    await prisma.word.update({
      where: { id: wordId },
      data: {
        ...wordData,
        translations: {
          deleteMany: {}, // Delete existing translations
          create: translations,
        },
        examples: {
          deleteMany: {}, // Delete existing examples
          create: filteredExamples,
        },
      },
    });
  } else {
    // Create new word
    await prisma.word.create({
      data: wordData,
    });
  }

  return { data: wordData };

  // // Return the data in the expected format for Prisma
  // return {
  //   data: {
  //     headword: headword as string,
  //     root: root as string,
  //     ergative: ergative as string,
  //     speechPart: speechPart as string,
  //     origin: origin as string,
  //     translations: {
  //       deleteMany: {}, // Delete existing translations
  //       create: translations,
  //     },
  //     examples: {
  //       deleteMany: {}, // Delete existing examples
  //       create: examples,
  //     },
  //   }
  // };
}
