
export interface Slide {
  title: string;
  content: string[];
}

export interface Presentation {
  title: string;
  slides: Slide[];
}
