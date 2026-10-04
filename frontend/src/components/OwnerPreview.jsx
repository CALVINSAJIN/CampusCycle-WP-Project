// "Listed by" box on the listing details page
export default function OwnerPreview({ name, department }) {
  return (
    <div className="owner-preview">
      <span className="muted">Listed by</span>
      <p><b>👤 {name}</b></p>
      <p className="muted">{department ? `${department} • RSET` : 'RSET'}</p>
    </div>
  );
}
