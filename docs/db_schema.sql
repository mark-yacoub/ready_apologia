-- Ready Apologia Database Schema
-- Generated automatically

/* === Table: manuscripts_meta === */
CREATE TABLE manuscripts_meta (
    ms_id TEXT PRIMARY KEY,
    name TEXT,
    earliest_date INTEGER,
    latest_date INTEGER,
    date_range_english TEXT,
    found_location TEXT,
    current_location TEXT,
    interesting_info TEXT,
    variants TEXT
);

/* === Table: manuscript_per_verse === */
CREATE TABLE manuscript_per_verse (
    verse_id TEXT,
    ms_id TEXT,
    image_name TEXT,
    PRIMARY KEY (verse_id, ms_id, image_name)
);

/* === Table: apologetics_meta === */
CREATE TABLE apologetics_meta (
    id TEXT PRIMARY KEY,
    name TEXT,
    url TEXT,
    copyright TEXT
);

/* === Table: contradictions === */
CREATE TABLE contradictions (
    verse1 TEXT,
    verse2 TEXT,
    title TEXT,
    answer TEXT,
    src TEXT
);

/* === Table: apologetics === */
CREATE TABLE apologetics (
    verse TEXT,
    title TEXT,
    answer TEXT,
    src TEXT
);

