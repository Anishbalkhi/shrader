export interface Project {
  slug: string;
  title: string;
  client: string;
  year: string;
  category: string;
  tags: string[];
  description: string;
  longDescription?: string;
  image: string;
  video?: string;
  demoUrl?: string;
  color: string;
  accentColor?: string;
  deliverables?: string[];
  metrics?: { label: string; value: string }[];
}
