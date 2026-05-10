export interface Translation {
  ar: string;
  en: string;
}

export interface VisionSection {
  id: number;
  vision_title: Translation;
  vision_description: Translation;
  message_title: Translation;
  message_description: Translation;
  vision_image: string | null;
  message_image: string | null;
  is_active: boolean;
}

export interface GenericSection {
  id: number;
  title: Translation;
  description: Translation;
  image: string | null;
  is_active: boolean;
}

export interface InfoSection {
  id: number;
  title: Translation;
  description: Translation;
  is_active: boolean;
}

export interface ContactSection {
  id: number;
  title: Translation;
  description: Translation;
  phone: string;
  is_active: boolean;
}

export interface WhyUsSection {
  id: number;
  title: Translation;
  description: Translation;
  values_title: Translation;
  values_description: Translation;
  image: string | null;
  is_active: boolean;
}

export interface AboutUsData {
  id: number;
  title: Translation;
  description: Translation;
  image: string;
  video_url: string;
  slug: string;
  meta_title: Translation;
  meta_description: Translation;
  is_active: boolean;
  vision_sections: VisionSection[];
  sections: GenericSection[];
  info_sections: InfoSection[];
  contact_sections: ContactSection[];
  why_us_sections: WhyUsSection[];
  created_at: string;
}

export interface AboutUsResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface UpdateAboutUsInput {
  title?: Translation;
  description?: Translation;
  image?: string | File;
  video_url?: string;
  meta_title?: Translation;
  meta_description?: Translation;

  // Vision Section
  vision_title?: Translation;
  vision_description?: Translation;
  vision_image?: string | File;

  // Message Section
  message_title?: Translation;
  message_description?: Translation;
  message_image?: string | File;

  // Why Us Section
  why_us_title?: Translation;
  why_us_description?: Translation;
  why_us_values_title?: Translation;
  why_us_values_description?: Translation;
  why_us_image?: string | File;

  // Contact Section
  contact_title?: Translation;
  contact_description?: Translation;
  contact_phone?: string;
}
