export default function PageHeader({ eyebrow, title, lead, children }) {
  return (
    <header className="page-header">
      <div className="container">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        {title && <h1 className="page-header__title">{title}</h1>}
        {lead && <p className="page-header__lead">{lead}</p>}
        {children && <div className="page-header__extra">{children}</div>}
      </div>
    </header>
  );
}
