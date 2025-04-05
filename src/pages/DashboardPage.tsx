import { useState } from 'react';

function DashboardPage({ apiUrl, token, onChaptersGenerated }: any) {
  const [transcript, setTranscript] = useState('');
  const [format, setFormat] = useState('Markdown');
  const [chapters, setChapters] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTranscript(event.target?.result as string);
      };
      reader.readAsText(uploaded);
    }
  };

  const handleGenerate = async () => {
    if (!transcript) return alert('Please paste or upload a transcript.');
    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await fetch(`${apiUrl}/api/generate-chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript, format }),
      });

      const data = await response.json();
      if (response.ok && data.chapters) {
        setChapters(data.chapters);
        setTranscript('');
        setSuccessMessage('✅ Chapters generated successfully!');
        onChaptersGenerated?.(); // refresh history if needed
      } else {
        alert(`Error: ${data.error || 'Failed to generate chapters.'}`);
      }
    } catch {
      alert('❌ Network error during generation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>📄 Upload Transcript</h2>

      <textarea
        placeholder="Type or paste your transcript here..."
        rows={10}
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}
      />

      <input type="file" accept=".txt" onChange={handleFileChange} /><br /><br />

      <label htmlFor="format">Format:</label>{' '}
      <select
        id="format"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option>Markdown</option>
        <option>Plain Text</option>
      </select><br /><br />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? '⏳ Generating...' : 'Generate Chapters'}
      </button>

      {successMessage && (
        <p style={{ color: 'limegreen', marginTop: '1rem' }}>{successMessage}</p>
      )}

      {chapters && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Generated Chapters</h3>
          <pre style={{ background: '#111', padding: '1rem', borderRadius: '5px' }}>
            {chapters}
          </pre>
          <button onClick={() => navigator.clipboard.writeText(chapters)}>
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

  