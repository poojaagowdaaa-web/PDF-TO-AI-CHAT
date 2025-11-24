import type { Index, RecordMetadata } from "@pinecone-database/pinecone";

export async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string,
) {
  if (namespace === null) throw new Error("No namespace provided");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}
