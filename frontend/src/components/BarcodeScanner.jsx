import { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function BarcodeScanner({ onDetect, onClose }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError(t('components.cameraDenied'));
    }
  };

  const stopCamera = () => stream?.getTracks().forEach(t => t.stop());

  const handleManual = (e) => {
    e.preventDefault();
    if (manualCode.trim()) { onDetect(manualCode.trim()); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">

        <div className="flex justify-between items-center">
          <h3 className="flex items-center gap-2 font-bold text-brand-base">
            <Camera size={16} className="text-green-400" /> {t('components.scannerTitle')}
          </h3>
          <button id="scanner-close-btn" onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-base hover:bg-brand-elevated transition-all">
            <X size={18} />
          </button>
        </div>

        {!error ? (
          <div className="relative rounded-xl overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] object-cover block" />
            <div className="absolute inset-5 border-2 border-green-400 rounded-lg"
              style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
            <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-brand-muted">{t('components.pointCamera')}</p>
          </div>
        ) : (
          <div className="p-4 bg-red-400/10 border border-red-400/25 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        <div className="text-center text-xs text-brand-muted">{t('components.orEnterManually')}</div>

        <form onSubmit={handleManual} className="flex gap-2">
          <input id="manual-barcode-input" type="text"
            placeholder={t('components.enterBarcode')}
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 placeholder-brand-muted transition-all" />
          <button type="submit" id="manual-barcode-submit"
            className="px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            {t('components.searchBtn')}
          </button>
        </form>

        {error && (
          <button id="retry-camera-btn"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-elevated border border-brand-border text-sm text-brand-muted hover:text-brand-base hover:border-green-400 transition-all"
            onClick={() => { setError(null); startCamera(); }}>
            <RefreshCw size={13} /> {t('components.retryCamera')}
          </button>
        )}
      </div>
    </div>
  );
}
