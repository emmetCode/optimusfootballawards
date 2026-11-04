export default function AdminPageHeader({ title, lead }) {
  return (
    <header className="admin-page-header">
      <h1 className="admin-page-header__title">{title}</h1>
      {lead && <p className="admin-page-header__lead">{lead}</p>}
    </header>
  );
}
