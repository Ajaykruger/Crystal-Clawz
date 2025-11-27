export interface ProductData {
  url?: string;
  title: string;
  description: string;
  keyFeatures: string[];
  price: string;
  brandVoice: string;
  image: File | null;
}

export interface CreativeConcept {
  type: 'IMAGE' | 'VIDEO';
  prompt_for_imagen: string;
  video_script_draft?: string;
}

export interface MetaAdAssets {
  primary_texts: string[];
  headlines: string[];
  call_to_action: string;
  creative_concept: CreativeConcept;
  landing_page_headline: string;
}

export interface Persona {
  persona_id: string;
  name: string;
  emotional_trigger: string;
  pain_points: string[];
  tone_style: string;
  targeting_suggestions: string[];
  meta_ad_assets: MetaAdAssets;
}

export interface GeneratedData {
  generated_personas: Persona[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_PERSONAS = 'GENERATING_PERSONAS',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}