// Run in the browser on a page with .diagram SVGs. Reports text that overflows its box, sits too close to an edge,
// collides with another box or text, or has a line drawn across it. Coordinates are in SVG user units.
(() => {
  const PAD = 8;
  const issues = [];
  const inflate = (b, d) => ({ x: b.x - d, y: b.y - d, width: b.width + 2 * d, height: b.height + 2 * d });
  const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  const contains = (outer, inner) =>
    inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
  const segHitsBox = (x1, y1, x2, y2, b) => {
    // Sample along the segment; plenty precise for diagram-sized shapes
    for (let i = 0; i <= 60; i++) {
      const x = x1 + ((x2 - x1) * i) / 60;
      const y = y1 + ((y2 - y1) * i) / 60;
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) return true;
    }
    return false;
  };
  document.querySelectorAll(".diagram svg").forEach((svg, d) => {
    const vb = svg.viewBox.baseVal;
    const rects = [...svg.querySelectorAll("rect")].map((r) => r.getBBox());
    const texts = [...svg.querySelectorAll("text")].map((t) => ({ text: t.textContent.trim(), box: t.getBBox() }));
    const segments = [];
    svg.querySelectorAll("line").forEach((l) => segments.push([+l.getAttribute("x1"), +l.getAttribute("y1"), +l.getAttribute("x2"), +l.getAttribute("y2")]));
    svg.querySelectorAll("path[d]").forEach((p) => {
      if (p.closest("marker")) return;
      const m = p.getAttribute("d").match(/^M\s*([\d.]+)[ ,]([\d.]+)\s*([VH])\s*([\d.]+)$/);
      if (m) segments.push(m[3] === "V" ? [+m[1], +m[2], +m[1], +m[4]] : [+m[1], +m[2], +m[4], +m[2]]);
    });
    texts.forEach(({ text, box }, i) => {
      const where = `diagram ${d + 1}: "${text}"`;
      if (box.x < vb.x + 4 || box.y < vb.y + 4 || box.x + box.width > vb.x + vb.width - 4 || box.y + box.height > vb.y + vb.height - 4)
        issues.push(`${where} is within 4 units of the diagram edge`);
      // The smallest box the text touches is the one it belongs to
      const host = rects.filter((r) => overlaps(r, box)).sort((a, b) => a.width * a.height - b.width * b.height)[0];
      if (host) {
        if (!contains(host, box)) issues.push(`${where} spills out of its box`);
        else if (contains(host, box) && !contains(inflate(host, -PAD), box)) issues.push(`${where} is closer than ${PAD} units to its box edge`);
      }
      texts.forEach((other, j) => {
        if (j > i && overlaps(inflate(box, 1), other.box)) issues.push(`${where} overlaps "${other.text}"`);
      });
      segments.forEach((s) => {
        if (segHitsBox(...s, inflate(box, 2))) issues.push(`${where} has a line through it`);
      });
    });
  });
  return issues;
})();
