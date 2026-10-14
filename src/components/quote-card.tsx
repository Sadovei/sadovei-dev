import type { Testimonial } from "@/content/testimonials";

export function QuoteCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="quote">
      <blockquote>
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption>
        <strong>{testimonial.name}</strong>
        <span>{testimonial.role}</span>
      </figcaption>
    </figure>
  );
}
