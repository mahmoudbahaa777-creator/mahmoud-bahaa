/*
 * Chapter opener: one huge, faint, outlined word behind a section's heading that
 * slides sideways as you scroll through the section (CSS scroll-driven; static
 * where unsupported or with reduced motion). The section needs `isolate` so the
 * word sits above its background but behind its content. Styles: index.css ("Chapter words").
 */
export default function ChapterWord({ children, dir = 'left' }) {
  return (
    <div aria-hidden className="chapter-word-band">
      <div className="wrap">
        <span className={`chapter-word chapter-${dir}`}>{children}</span>
      </div>
    </div>
  )
}
