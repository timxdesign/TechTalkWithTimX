// Shared bits for editorial stories written from the public record.

// Closing note + credits. Every story drawn from published reporting carries this.
export function credits(subject, sources) {
  return `<hr>
<h2>About this story</h2>
<p><em>This story is drawn from public interviews and published reporting${subject ? `; Tech Talk with TimX has not interviewed ${subject} for it` : ""}. Quotes are attributed to where they first appeared. If you're featured here and something's wrong or missing, we'd love to hear from you at <a href="mailto:hello@techtalkwithtimx.com">hello@techtalkwithtimx.com</a>.</em></p>
<h3>Sources and credits</h3>
<ul>
${sources.map(([label, url]) => `<li><a href="${url}" rel="noopener">${label}</a></li>`).join("\n")}
</ul>`;
}

export const takeaways = (items) =>
  `<h2>What builders can take from this</h2>
<ul>
${items.map((t) => `<li>${t}</li>`).join("\n")}
</ul>`;
