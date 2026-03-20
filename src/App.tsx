import { useState } from "react";
import "./App.css";

function App() {
  const [cnpj, setCnpj] = useState("");
  const [amount, setAmount] = useState("");
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
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, "");
    setAmount(value);
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, "");
    return numbers.length === 14;
  };

  const openNubankPix = () => {
    const cleanCNPJ = cnpj.replace(/\D/g, "");

    if (!validateCNPJ(cnpj)) {
      setError("CNPJ inválido. Digite os 14 dígitos.");
      return;
    }

    const deepLink = `nubank://pix/transfer?recipient=${cleanCNPJ}${amount ? `&amount=${amount.replace(",", ".")}` : ""}`;

    const fallbackUrl = "https://nubank.com.br/app";

    window.location.href = deepLink;

    setTimeout(() => {
      window.location.href = fallbackUrl;
    }, 2500);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>PIX Transfer</h1>
        <p className="subtitle">Enter the CNPJ to transfer via Nubank</p>

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
          <label htmlFor="amount">Amount (optional)</label>
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

        <button onClick={openNubankPix} className="btn-primary">
          Open Nubank PIX
        </button>
      </div>
    </div>
  );
}

export default App;
