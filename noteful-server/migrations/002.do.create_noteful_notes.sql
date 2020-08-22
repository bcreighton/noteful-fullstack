CREATE TABLE noteful_notes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  folder_id INTEGER REFERENCES noteful_folders(id) ON DELETE CASCADE
);