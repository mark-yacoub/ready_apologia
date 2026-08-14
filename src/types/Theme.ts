export interface OrthodoxSource {
  flow_stage: string;
  reference: string;
  english: string;
  arabic?: string;
}

export interface Theme {
  theme: string;
  title: string;
  the_claim: string;
  orthodox_sources: OrthodoxSource[];
  standard_apologetic_defense: string;
  the_devastating_counter: string;
}

export interface ThemeDataset {
  dataset: Theme[];
}
