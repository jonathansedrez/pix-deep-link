import { useState } from "react";
import "./App.css";

function App() {
  const [cnpj, setCnpj] = useState("");
  const [amount, setAmount] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [city, setCity] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
    setError("");
    setPixCode("");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, "");
    setAmount(value);
    setPixCode("");
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, "");
    return numbers.length === 14;
  };

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
    const cleanCNPJ = cnpj.replace(/\D/g, "");

    if (!validateCNPJ(cnpj)) {
      setError("CNPJ inválido. Digite os 14 dígitos.");
      return;
    }

    if (!merchantName.trim()) {
      setError("Nome do recebedor é obrigatório.");
      return;
    }

    if (!city.trim()) {
      setError("Cidade é obrigatória.");
      return;
    }

    // Build PIX payload following EMV QR Code specification
    const gui = formatField("00", "br.gov.bcb.pix");
    const pixKey = formatField("01", cleanCNPJ);
    const merchantAccountInfo = formatField("26", gui + pixKey);

    let payload = "";
    payload += formatField("00", "01"); // Payload Format Indicator
    payload += formatField("01", "11"); // Point of Initiation (11 = static)
    payload += merchantAccountInfo;
    payload += formatField("52", "0000"); // Merchant Category Code
    payload += formatField("53", "986"); // Transaction Currency (BRL)

    if (amount) {
      const formattedAmount = parseFloat(amount.replace(",", ".")).toFixed(2);
      payload += formatField("54", formattedAmount);
    }

    payload += formatField("58", "BR"); // Country Code
    payload += formatField("59", merchantName.toUpperCase().slice(0, 25)); // Merchant Name
    payload += formatField("60", city.toUpperCase().slice(0, 15)); // Merchant City
    payload += formatField("62", formatField("05", "***")); // Additional Data Field

    // Add CRC placeholder and calculate
    payload += "6304";
    const crc = calculateCRC16(payload);
    payload += crc;

    setPixCode(payload);
    setCopied(false);
    setError("");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Erro ao copiar. Tente selecionar e copiar manualmente.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>PIX Copia e Cola</h1>
        <p className="subtitle">Gere o código PIX e cole no app do seu banco</p>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            id="cnpj"
            type="text"
            value={cnpj}
            onChange={handleCNPJChange}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
          />
        </div>

        <div className="form-group">
          <label htmlFor="merchantName">Nome do Recebedor</label>
          <input
            id="merchantName"
            type="text"
            value={merchantName}
            onChange={(e) => {
              setMerchantName(e.target.value);
              setPixCode("");
            }}
            placeholder="Nome da empresa"
            maxLength={25}
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">Cidade</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPixCode("");
            }}
            placeholder="São Paulo"
            maxLength={15}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Valor (opcional)</label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            inputMode="decimal"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button onClick={generatePixCode} className="btn-primary">
          Gerar Código PIX
        </button>

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
