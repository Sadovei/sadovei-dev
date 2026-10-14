import { codeToHtml } from "shiki";

// Highlighted at build time, so no syntax-highlighting JavaScript ships to the browser
export async function Code({ children, lang = "tsx", title }: { children: string; lang?: string; title?: string }) {
  const html = await codeToHtml(children.trim(), {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: "light",
  });
  return (
    <figure className="code">
      {title && <figcaption>{title}</figcaption>}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
