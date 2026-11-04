export default function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
        <h2 className="section-heading__title">{title}</h2>
      </div>
      {action}
    </div>
  );
}
