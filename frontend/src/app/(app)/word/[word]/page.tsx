import { WordPage } from '@/features/word/WordPage';

type WordPageProps = {
  params: Promise<{ word: string }>;
};

export default async function Page({ params }: WordPageProps) {
  const { word } = await params;
  return <WordPage word={decodeURIComponent(word)} />;
}
