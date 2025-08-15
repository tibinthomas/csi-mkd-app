import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoMetaTags {
  readonly title: string;
  readonly description: string;
  readonly keywords?: string;
  readonly author?: string;
  readonly image?: string;
  readonly url?: string;
  readonly type?: string;
  readonly siteName?: string;
  readonly locale?: string;
}

interface StructuredData {
  readonly '@context': string;
  readonly '@type': string;
  readonly name: string;
  readonly description: string;
  readonly url?: string;
  readonly image?: string;
  readonly author?: {
    readonly '@type': string;
    readonly name: string;
  };
  readonly organization?: {
    readonly '@type': string;
    readonly name: string;
    readonly url: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private readonly defaultConfig = {
    siteName: 'CSI Counselling Centre, Kottayam',
    author: 'CSI Madhya Kerala Diocese',
    locale: 'en_US',
    type: 'website',
  };

  updateMetaTags(config: SeoMetaTags): void {
    const fullConfig = { ...this.defaultConfig, ...config };

    // Update page title
    this.title.setTitle(fullConfig.title);

    // Basic meta tags
    this.updateOrCreateTag('name', 'description', fullConfig.description);
    this.updateOrCreateTag('name', 'author', fullConfig.author || this.defaultConfig.author);
    
    if (fullConfig.keywords) {
      this.updateOrCreateTag('name', 'keywords', fullConfig.keywords);
    }

    // Open Graph tags
    this.updateOrCreateTag('property', 'og:title', fullConfig.title);
    this.updateOrCreateTag('property', 'og:description', fullConfig.description);
    this.updateOrCreateTag('property', 'og:type', fullConfig.type || this.defaultConfig.type);
    this.updateOrCreateTag('property', 'og:site_name', fullConfig.siteName || this.defaultConfig.siteName);
    this.updateOrCreateTag('property', 'og:locale', fullConfig.locale || this.defaultConfig.locale);

    if (fullConfig.image) {
      this.updateOrCreateTag('property', 'og:image', fullConfig.image);
      this.updateOrCreateTag('property', 'og:image:alt', fullConfig.title);
    }

    if (fullConfig.url) {
      this.updateOrCreateTag('property', 'og:url', fullConfig.url);
    }

    // Twitter Card tags
    this.updateOrCreateTag('name', 'twitter:card', 'summary_large_image');
    this.updateOrCreateTag('name', 'twitter:title', fullConfig.title);
    this.updateOrCreateTag('name', 'twitter:description', fullConfig.description);
    
    if (fullConfig.image) {
      this.updateOrCreateTag('name', 'twitter:image', fullConfig.image);
    }

    // Additional SEO tags
    this.updateOrCreateTag('name', 'robots', 'index, follow');
    this.updateOrCreateTag('name', 'viewport', 'width=device-width, initial-scale=1');
  }

  addStructuredData(data: StructuredData): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    
    // Remove any existing structured data
    this.removeStructuredData();
    
    document.head.appendChild(script);
  }

  removeStructuredData(): void {
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());
  }

  setCanonicalUrl(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    canonical.href = url;
  }

  addAlternateLanguage(lang: string, url: string): void {
    const existing = document.querySelector(`link[hreflang="${lang}"]`);
    if (existing) {
      existing.remove();
    }

    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = url;
    document.head.appendChild(link);
  }

  updatePageMetadata(config: {
    title: string;
    description: string;
    keywords?: string;
    url?: string;
    image?: string;
  }): void {
    this.updateMetaTags(config);
    
    if (config.url) {
      this.setCanonicalUrl(config.url);
    }

    // Add structured data for organization
    this.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.title,
      description: config.description,
      url: config.url,
      image: config.image,
      organization: {
        '@type': 'Organization',
        name: this.defaultConfig.siteName,
        url: 'https://csi-counselling.com',
      },
    });
  }

  private updateOrCreateTag(
    attributeName: 'name' | 'property',
    attributeValue: string,
    content: string
  ): void {
    const selector = `meta[${attributeName}="${attributeValue}"]`;
    
    if (this.meta.getTag(selector)) {
      this.meta.updateTag({ [attributeName]: attributeValue, content });
    } else {
      this.meta.addTag({ [attributeName]: attributeValue, content });
    }
  }
}
