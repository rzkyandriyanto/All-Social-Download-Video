"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [result, setResult] = useState<{ title: string; description: string; platform: string; thumbnail?: string; medias?: any[] } | null>(null);
  const [activeMediaUrl, setActiveMediaUrl] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);



  const handleDownload = async (eOrUrl?: any) => {
    let targetUrl = url;
    if (typeof eOrUrl === 'string') {
      targetUrl = eOrUrl;
    }

    if (!targetUrl.trim()) {
      alert("Silakan masukkan link video terlebih dahulu!");
      return;
    }

    setLoading(true);
    setResult(null); // Reset result before new request

    try {
      // Call the API route we created to scrape metadata
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      
      if (data.error) {
        alert(data.error || "Gagal mengambil data metadata.");
        setResult(null);
        return;
      }

      setResult(data);
      if (data.medias && data.medias.length > 0) {
        setActiveMediaUrl(data.medias[0].url);
      }
    } catch (error) {
      console.error(error);
      setResult({
        title: "Gagal memproses link",
        description: "Terjadi kesalahan pada server atau jaringan.",
        platform: activePlatform || "Otomatis"
      });
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { id: "youtube", name: "YouTube", icon: "ph-youtube-logo" },
    { id: "tiktok", name: "TikTok", icon: "ph-tiktok-logo" },
    { id: "facebook", name: "Facebook", icon: "ph-facebook-logo" },
    { id: "instagram", name: "Instagram", icon: "ph-instagram-logo" },
  ];

  const triggerDownload = () => {
    if (!activeMediaUrl) {
      alert("Pilihan download tidak tersedia.");
      return;
    }
    
    // Open the direct URL to trigger browser download
    window.open(activeMediaUrl, '_blank');
  };

  return (
    <>
      <div className="glow-background"></div>

      <header className="navbar">
        <div className="logo">DASH</div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="pill-badge">
            <i className="ph ph-link"></i>
            <span>Downloader multi-platform</span>
          </div>
          <h1 className="hero-title">Download video<br />dari link favoritmu</h1>
          <p className="hero-subtitle">Tempel link YouTube, TikTok, Facebook, atau Instagram.<br />Tools ini menyiapkan alur cepat untuk mendeteksi platform dan memulai proses download.</p>

          <div className="downloader-box">
            <div className="input-group">
              <i className="ph ph-copy input-icon"></i>
              <input
                type="text"
                placeholder="Paste link video di sini..."
                autoComplete="off"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData('Text');
                  if (pastedText.trim().startsWith('http')) {
                    handleDownload(pastedText);
                  }
                }}
              />
              <button
                className="btn btn-primary download-btn"
                onClick={handleDownload}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? "Memproses..." : "Download"} <i className={`ph ${loading ? 'ph-spinner-gap' : 'ph-download-simple'} ${loading ? 'spin-anim' : ''}`}></i>
              </button>
            </div>
            <div className="auto-paste-hint">
              <i className="ph ph-magic-wand"></i> Link akan otomatis diproses sesaat setelah di-paste
            </div>
            <div className="platform-buttons">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  className={`btn-platform ${activePlatform === p.name ? 'active' : ''}`}
                  onClick={() => setActivePlatform(activePlatform === p.name ? null : p.name)}
                >
                  <i className={`ph-fill ${p.icon}`}></i> {p.name}
                </button>
              ))}
            </div>
          </div>
          
          {result && (
            <div className="result-card">
              <div className="result-header">
                <i className="ph-fill ph-check-circle result-success-icon"></i>
                <h3>Link Berhasil Diproses</h3>
              </div>
              <div className="result-content">
                <div className="result-thumbnail">
                  {result.thumbnail ? (
                    <img src={result.thumbnail} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} />
                  ) : (
                    <i className="ph ph-video-camera"></i>
                  )}
                </div>
                <div className="result-info">
                  <h4 className="result-title">{result.title}</h4>
                  <p className="result-platform">Platform: <span className="badge">{result.platform}</span></p>
                  <p className="result-desc">{result.description}</p>
                  <div className="result-actions">
                    <div className="custom-dropdown">
                      <div 
                        className={`dropdown-selected ${isDropdownOpen ? 'open' : ''}`} 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span>{result.medias?.find(m => m.url === activeMediaUrl)?.quality || "Pilih Kualitas"}</span>
                        <i className={`ph ph-caret-down dropdown-icon ${isDropdownOpen ? 'open' : ''}`}></i>
                      </div>
                      
                      {isDropdownOpen && (
                        <>
                          <div className="dropdown-overlay" onClick={() => setIsDropdownOpen(false)}></div>
                          <div className="dropdown-menu">
                            {result.medias?.map((m, idx) => (
                              <div 
                                key={idx} 
                                className={`dropdown-item ${activeMediaUrl === m.url ? 'active' : ''}`}
                                onClick={() => {
                                  setActiveMediaUrl(m.url);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <span>{m.quality}</span>
                                {activeMediaUrl === m.url && <i className="ph ph-check" style={{ color: 'var(--accent-color)' }}></i>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <button 
                      className="btn btn-primary download-action-btn"
                      onClick={triggerDownload}
                    >
                      <i className="ph ph-download-simple"></i> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="features">
          <h2 className="section-title">Cara pakai</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ph ph-export"></i>
              </div>
              <h3 className="feature-title">1. Paste link</h3>
              <p className="feature-desc">Salin URL video dari platform lalu tempel ke box utama.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ph ph-crosshair"></i>
              </div>
              <h3 className="feature-title">2. Deteksi platform</h3>
              <p className="feature-desc">Interface menyiapkan alur untuk YouTube, TikTok, Facebook, dan Instagram.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ph ph-cloud-arrow-down"></i>
              </div>
              <h3 className="feature-title">3. Download</h3>
              <p className="feature-desc">Klik tombol download setelah backend/API downloader sudah terhubung.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">DASH</div>
          <p className="footer-desc">Web tools untuk menyiapkan link video dari YouTube, TikTok,<br />Facebook, dan Instagram dalam satu tempat.</p>
          <p className="footer-copy">© 2026 DASH. Dibuat oleh rzkyandriyanto</p>
        </div>
      </footer>
    </>
  );
}
