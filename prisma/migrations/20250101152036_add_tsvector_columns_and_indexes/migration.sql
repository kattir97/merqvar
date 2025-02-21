-- Add a tsvector column to the Word table
ALTER TABLE "Word"
ADD COLUMN textsearchable_index_col tsvector
GENERATED ALWAYS AS (
  to_tsvector('simple', coalesce(headword, '') || ' ' || coalesce(root, ''))
) STORED;

-- Add a tsvector column to the Translation table
ALTER TABLE "Translation"
ADD COLUMN textsearchable_index_col tsvector
GENERATED ALWAYS AS (
  to_tsvector('russian', coalesce(translation, ''))
) STORED;

-- Create GIN index for the Word table
CREATE INDEX idx_word_textsearch ON "Word" USING GIN (textsearchable_index_col);

-- Create GIN index for the Translation table
CREATE INDEX idx_translation_textsearch ON "Translation" USING GIN (textsearchable_index_col);
