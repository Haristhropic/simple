export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  featured: boolean;
  status: string;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  alt: string | null;
  order: number;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta: string | null;
  ctaLink: string | null;
  imageUrl: string;
  imagePublicId: string | null;
  active: boolean;
  order: number;
}

export interface AboutSection {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  active: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  publicId: string | null;
  alt: string;
  order: number;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
}
