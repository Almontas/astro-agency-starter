import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    industry: z.enum(['SaaS', 'PLG', 'AI', 'Fintech', 'E-commerce', 'Entertainment', 'DTC', 'Media']),
    service: z.enum([
      'Paid Media',
      'AI Performance Creative',
      'Conversion Optimization',
      'Lifecycle & Retention',
      'Growth Strategy',
      'AEO / GEO Optimization',
    ]),
    challenge: z.string(),
    heroMetric: z.string(),
    heroMetricLabel: z.string(),
    secondaryMetric: z.string().optional(),
    secondaryMetricLabel: z.string().optional(),
    glanceStats: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
    testimonialQuote: z.string().optional(),
    testimonialName: z.string().optional(),
    testimonialTitle: z.string().optional(),
    publishDate: z.coerce.date(),
    featuredImage: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    categories: z.array(z.enum(['Growth Strategy', 'Paid Media', 'AI', 'AI Creative', 'Creative', 'CRO', 'Lifecycle', 'SEO'])).min(1),
    excerpt: z.string(),
    // Optional SEO <title> override (≤60 chars, keyword-first). When unset, the
    // visible `title` (H1) + ' — My Site' is used. Set this only when the
    // H1 runs long, so the SERP title stays short while the H1 stays punchy.
    metaTitle: z.string().optional(),
    // Optional SEO meta description override. When unset, the post's excerpt is
    // trimmed to ~155 chars at a word boundary for the meta tag / JSON-LD.
    metaDescription: z.string().optional(),
    cardHook: z.string().optional(),
    postType: z.enum(['Workflow', 'Case Study', 'Opinion', 'Framework', 'Guide', 'Playbook']).optional(),
    publishDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    featuredImage: z.string().optional(),
    draft: z.boolean().optional().default(false),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    title: z.string(),
    company: z.string(),
    headshot: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { 'case-studies': caseStudies, blog, testimonials };
