import { useEffect, useRef, useState } from 'react';
import { searchSchools } from '../api/schools';

// Type-ahead school-name search backed by GET /api/v1/schools/search (NEIS
// 학교기본정보 proxy — see backend/app/routers/schools.py). Replaces asking
// the user to type a raw NEIS school code by hand.
export function SchoolSearchField({ selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchSchools({ keyword: query.trim() });
        setResults(data);
        setOpen(true);
      } catch (_) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  if (selected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.school_name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            {selected.region} · {selected.school_level}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            onSelect(null);
            setQuery('');
          }}
        >
          변경
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={query}
        placeholder="학교 이름으로 검색 (예: 개포고등학교)"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        style={{
          display: 'block',
          width: '100%',
          border: '1.5px solid var(--cream-border-strong)',
          borderRadius: 10,
          padding: '10px 12px',
          fontSize: 14,
        }}
      />
      {searching && (
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>검색 중…</p>
      )}
      {open && results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            marginTop: 4,
            background: 'var(--white)',
            border: '1.5px solid var(--cream-border-strong)',
            borderRadius: 10,
            boxShadow: 'var(--shadow-soft)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {results.map((school) => (
            <li key={school.school_code}>
              <button
                type="button"
                onClick={() => {
                  onSelect(school);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '10px 12px',
                  borderBottom: '1px dashed var(--cream-border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{school.school_name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                  {school.region} · {school.school_level}
                  {school.address ? ` · ${school.address}` : ''}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !searching && query.trim().length >= 2 && results.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>검색 결과가 없어요.</p>
      )}
    </div>
  );
}