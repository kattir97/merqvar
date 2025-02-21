import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')
  console.time('🧹 Cleaned up the database...')
  await prisma.word.deleteMany()
  console.timeEnd('🧹 Cleaned up the database...')

  // Create some tags
  const tag1 = await prisma.tag.upsert({
    where: { name: 'дом' },
    update: {},
    create: {
      name: 'дом',
    },
  });

  const tag2 = await prisma.tag.upsert({
    where: { name: 'комната' },
    update: {},
    create: {
      name: 'комната',
    },
  });

  const words = [
    {
      headword: 'хал',
      root: 'хал',
      speechPart: 'существительное',
      ergative: 'a',
      origin: 'агульский',
      translations: {
        create: [
          {
            translation: 'дом',
          },
          {
            translation: 'комната',
          },
        ],
      },
      examples: {
        create: [
          {
            example: 'гьава хал',
            translation: 'высокий дом',
          },
          {
            example: 'зун халаъ айа',
            translation: 'Я дома',
          },
        ],
      },
      tags: {
        connect: [{ id: tag1.id }, { id: tag2.id }],
      },
    },

    {
      headword: 'уккас',
      root: 'укк',
      speechPart: 'глагол',
      ergative: null,
      origin: 'агульский',
      translations: {
        create: [
          {
            translation: 'бежать',
          },

        ],
      },
      examples: {
        create: [
          {
            example: 'халаъди уккуне',
            translation: 'побежал домой',
          },
          {
            example: 'гитан уккайа',
            translation: 'кошка бежит',
          },
        ],
      },
      tags: {
        connect: [{ id: tag1.id }, { id: tag2.id }],
      },
    },
  ]



  for (let i = 0; i < 2; i++) {
    if (i % 2 === 0) {
      await prisma.word.create({
        data: words[0]
      })

    } else {
      await prisma.word.create({
        data: words[1]
      })
    }
  }
  console.log('🌱 DB has been seeded...')

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });