import source from "@/data/fixtures.json";
import { isAnswerKind, isConfidence, type Fixture } from "@/shared/types";

const TEXT = {
  invalidMetadata: (id: string) => `Invalid answer metadata for ${id}`,
};

function readFixture(
  fixture: typeof source.default | (typeof source.fixtures)[number],
): Fixture {
  const { kind, answer } = fixture;
  if (!isAnswerKind(kind) || !isConfidence(answer.confidence)) {
    throw new Error(TEXT.invalidMetadata(fixture.id));
  }
  return {
    ...fixture,
    kind,
    answer: { ...answer, confidence: answer.confidence },
  };
}

export const fixtures = source.fixtures.map(readFixture);
export const fallback = readFixture(source.default);

export function pickFixture(question: string): Fixture {
  const query = question.toLowerCase();
  return (
    fixtures.find((fixture) =>
      fixture.keywords?.some((keyword) => query.includes(keyword)),
    ) ?? fallback
  );
}
