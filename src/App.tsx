import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [pixCode, setPixCode] = useState("");
  const [copied, setCopied] = useState(false);

  const CNPJ = "46424548000160";
  const MERCHANT_NAME = "IGREJA CIDADE LUZ";
  const CITY = "FLORIANOPOLIS";

  const formatField = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };

  const calculateCRC16 = (payload: string): string => {
    const polynomial = 0x1021;
    let crc = 0xffff;

    const bytes = new TextEncoder().encode(payload);
    for (const byte of bytes) {
      crc ^= byte << 8;
      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) {
          crc = ((crc << 1) ^ polynomial) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  const generatePixCode = () => {
    const gui = formatField("00", "br.gov.bcb.pix");
    const pixKey = formatField("01", CNPJ);
    const merchantAccountInfo = formatField("26", gui + pixKey);

    let payload = "";
    payload += formatField("00", "01");
    payload += formatField("01", "11");
    payload += merchantAccountInfo;
    payload += formatField("52", "0000");
    payload += formatField("53", "986");
    payload += formatField("58", "BR");
    payload += formatField("59", MERCHANT_NAME);
    payload += formatField("60", CITY);
    payload += formatField("62", formatField("05", "***"));

    payload += "6304";
    const crc = calculateCRC16(payload);
    payload += crc;

    setPixCode(payload);
  };

  useEffect(() => {
    generatePixCode();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = pixCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>PIX Copia e Cola</h1>
        <p className="subtitle">Igreja Cidade Luz</p>

        <div className="info">
          <p><strong>CNPJ:</strong> 46.424.548/0001-60</p>
        </div>

        {pixCode && (
          <div className="result">
            <label>Código PIX:</label>
            <div className="pix-code">{pixCode}</div>
            <button onClick={copyToClipboard} className="btn-copy">
              {copied ? "Copiado!" : "Copiar Código"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
