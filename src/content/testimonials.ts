// Excerpts from LinkedIn recommendations, quoted verbatim ("…" marks a cut).
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  // Case study the quote belongs to, if any
  caseStudy?: string;
  // Shown first on the homepage
  featured?: boolean;
};

export const recommendationsUrl = "https://www.linkedin.com/in/radu-sadovei/details/recommendations/";

export const testimonials: Testimonial[] = [
  {
    quote:
      "Despite a very tight delivery timeline, he managed to deliver robust, polished work while maintaining a strong focus on the user experience. His contribution was an important factor in the successful delivery of the project, which received very enthusiastic feedback from the customer.",
    name: "Guillaume Jouanjan",
    role: "Innovation Technical Team Lead, SITA",
    caseStudy: "sita-mission-watch",
    featured: true,
  },
  {
    quote:
      "Radu has a deep understanding of React and managed to quickly turn figma designs into working implementations running in the browser.",
    name: "Nikolaj Bang Holden",
    role: "Lead Engineer, The LEGO Group",
    caseStudy: "lego-hero-stories",
    featured: true,
  },
  {
    quote:
      "What truly distinguishes Radu is his exceptional knack for problem-solving and his mastery of the React framework. His ability to deconstruct intricate challenges and present innovative solutions is truly commendable.",
    name: "Veniamin Cobuz",
    role: "Broadcast Graphics & Software Engineer, PGL",
    caseStudy: "pgl-live-graphics",
    featured: true,
  },
  {
    quote:
      "Radu is an outstanding software developer characterized by rigor, speed, and great technical discipline. I was consistently impressed by his commitment to quality—he never leaves things half-done and always delivers solid solutions.",
    name: "Andra Ioana Achim",
    role: "Senior QA Engineer",
    featured: true,
  },
  {
    quote:
      "…he consistently demonstrates excellent technical skills, a strong sense of ownership, and a genuine passion for building high-quality products. … He is collaborative, supportive, and someone colleagues can rely on when facing complex technical problems.",
    name: "Joao Paulo Brito",
    role: "Innovation Project Manager & Product Owner, SITA",
    caseStudy: "sita-mission-watch",
  },
  {
    quote:
      "Radu is an amazing developer you'd want on your team. He knows a lot about different development frameworks and works really fast. More than that, he's a super nice guy and easy to work with.",
    name: "Simon Lund Larsen",
    role: "Senior Project Manager, The LEGO Group",
    caseStudy: "lego-hero-stories",
  },
  {
    quote:
      "Beyond coding, his soft skills ensure fluid and efficient team interactions. Simply put, Radu is a top-tier developer and a solid team player.",
    name: "Cezar Cobuz Jr.",
    role: "Senior React Native Engineer, worked together at ZentaHub",
  },
];
