import { prisma } from "./db.server";

export async function saveWord(
  formData: { [k: string]: FormDataEntryValue },
  wordId?: string
) {
  const { headword, root, ergative, speechPart, origin } = formData;

  const translations = Object.keys(formData)
    .filter((key) => key.startsWith("translations["))
    .map((key) => ({ translation: formData[key] } as { translation: string }));

  const tags = Object.keys(formData)
    .filter((key) => key.startsWith("tags["))
    .map((key) => formData[key] as string)
    .filter((tag) => tag.trim() !== ""); // Remove empty tags

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

  // Handle tags: Create or connect them
  const tagOperations = await Promise.all(
    tags.map(async (tagName) => {
      // Check if the tag exists
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (existingTag) {
        return { id: existingTag.id }; // Connect existing tag
      } else {
        // Create new tag and return its ID
        const newTag = await prisma.tag.create({
          data: { name: tagName },
        });
        return { id: newTag.id };
      }
    })
  );

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
    tags: {
      connect: tagOperations,
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
        tags: {
          set: tagOperations, // Replace existing tags with the new set
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
