import { defineConfig } from "tinacms";

export default defineConfig({
  branch: process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main",

  // Get these from app.tina.io after connecting your repo
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "images/uploads",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "caseStudies",
        label: "Case Studies",
        path: "src/content/case-studies",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true,
            isTitle: true,
          },
          {
            type: "string",
            name: "client",
            label: "Client",
            required: true,
          },
          {
            type: "string",
            name: "industry",
            label: "Industry",
            required: true,
            options: ["SaaS", "PLG", "AI", "Fintech", "E-commerce", "Entertainment", "DTC", "Media"],
          },
          {
            type: "string",
            name: "service",
            label: "Service",
            required: true,
            options: [
              "Paid Media",
              "AI Performance Creative",
              "Conversion Optimization",
              "Lifecycle & Retention",
              "Growth Strategy",
              "AEO / GEO Optimization",
            ],
          },
          {
            type: "string",
            name: "challenge",
            label: "Challenge",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "heroMetric",
            label: "Hero Metric",
            required: true,
            description: 'e.g. "+30%" or "$18M"',
          },
          {
            type: "string",
            name: "heroMetricLabel",
            label: "Hero Metric Label",
            required: true,
            description: 'e.g. "year-over-year revenue growth"',
          },
          {
            type: "string",
            name: "secondaryMetric",
            label: "Secondary Metric",
          },
          {
            type: "string",
            name: "secondaryMetricLabel",
            label: "Secondary Metric Label",
          },
          {
            type: "object",
            name: "glanceStats",
            label: "At-a-Glance Stats",
            list: true,
            fields: [
              {
                type: "string",
                name: "value",
                label: "Value",
                required: true,
              },
              {
                type: "string",
                name: "label",
                label: "Label",
                required: true,
              },
            ],
          },
          {
            type: "string",
            name: "testimonialQuote",
            label: "Testimonial Quote",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "testimonialName",
            label: "Testimonial Name",
          },
          {
            type: "string",
            name: "testimonialTitle",
            label: "Testimonial Title",
          },
          {
            type: "datetime",
            name: "publishDate",
            label: "Publish Date",
            required: true,
          },
          {
            type: "image",
            name: "featuredImage",
            label: "Featured Image",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "blog",
        label: "Blog Posts",
        path: "src/content/blog",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true,
            isTitle: true,
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            required: true,
          },
          {
            type: "string",
            name: "categories",
            label: "Categories",
            required: true,
            list: true,
            options: ["Growth Strategy", "Paid Media", "AI", "AI Creative", "Creative", "CRO", "Lifecycle", "SEO"],
          },
          {
            type: "string",
            name: "postType",
            label: "Post Type",
            options: ["Workflow", "Case Study", "Opinion", "Framework", "Guide", "Playbook"],
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "metaTitle",
            label: "Meta Title (SEO override)",
            description: "Optional keyword-first <title> override, ≤60 chars. Leave blank to use the post title.",
          },
          {
            type: "string",
            name: "metaDescription",
            label: "Meta Description (SEO override)",
            description: "Optional meta description. Leave blank to derive from the excerpt.",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "cardHook",
            label: "Card Hook",
            description: "Short hook shown on the blog index card.",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "publishDate",
            label: "Publish Date",
            required: true,
          },
          {
            type: "datetime",
            name: "lastModified",
            label: "Last Modified",
            description: "Set only on a meaningful edit after publish; renders the 'Last updated' badge.",
          },
          {
            type: "image",
            name: "featuredImage",
            label: "Featured Image",
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
            description: "When on, the post is excluded from the live build.",
          },
          {
            type: "object",
            name: "faqs",
            label: "FAQs",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.question || "FAQ" }),
            },
            fields: [
              {
                type: "string",
                name: "question",
                label: "Question",
                required: true,
              },
              {
                type: "string",
                name: "answer",
                label: "Answer",
                required: true,
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "testimonials",
        label: "Testimonials",
        path: "src/content/testimonials",
        format: "md",
        fields: [
          {
            type: "string",
            name: "quote",
            label: "Quote",
            required: true,
            isTitle: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "name",
            label: "Name",
            required: true,
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true,
          },
          {
            type: "string",
            name: "company",
            label: "Company",
            required: true,
          },
          {
            type: "image",
            name: "headshot",
            label: "Headshot",
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured on Homepage",
          },
        ],
      },
    ],
  },
});
