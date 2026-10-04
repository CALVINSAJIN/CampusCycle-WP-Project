import { useEffect, useState } from 'react';

// Controlled search box. onSearch(text) runs on submit.
export default function SearchBar({ initial = '', onSearch, big = false }) {
  const [text, setText] = useState(initial);
  useEffect(() => setText(initial), [initial]);
  return (
    <form className={`searchbar ${big ? 'big' : ''}`} onSubmit={(e) => { e.preventDefault(); onSearch(text.trim()); }}>
      <input placeholder="🔍 Search books, calculators, Arduino kits..." value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn">Search</button>
    </form>
  );
}
