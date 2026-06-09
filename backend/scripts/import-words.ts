import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const WORDS_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json';

async function main() {
  console.log('Fetching word list...');

  const response = await axios.get<Record<string, number>>(WORDS_URL);
  const wordsObj = response.data;
  const words = Object.keys(wordsObj);

  console.log(`Found ${words.length} words. Importing...`);

  const BATCH_SIZE = 1000;
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);

    const result = await prisma.word.createMany({
      data: batch.map((w) => ({ word: w.toLowerCase() })),
      skipDuplicates: true,
    });

    imported += result.count;
    skipped += batch.length - result.count;

    if (i % 10000 === 0) {
      console.log(
        `Progress: ${Math.min(i + BATCH_SIZE, words.length)}/${words.length} processed`,
      );
    }
  }

  console.log(`\nDone! Imported: ${imported}, Skipped (duplicates): ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
