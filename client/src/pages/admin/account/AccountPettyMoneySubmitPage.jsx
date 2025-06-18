// 📁 client/src/pages/admin/account/AccountPettyMoneySubmitPage.jsx
import React, { useState } from 'react';
import styles from './AccountPettyMoneySubmitPage.module.css';

const AccountPettyMoneySubmitPage = ({ startDate, endDate, onBack }) => {
  const [form, setForm] = useState({
    text1: '', iamount01: '',
    text2: '', iamount02: '',
    text3: '', iamount03: '',
    text4: '', iamount04: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalAmount = [form.iamount01, form.iamount02, form.iamount03, form.iamount04]
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    .toFixed(2);

  const handleSubmitPDF = () => {
    const url = `/api/admin/account/accountpettymoneysubmit/submitpdf?start=${startDate}&end=${endDate}` +
      `&text1=${form.text1}&iamount01=${form.iamount01}` +
      `&text2=${form.text2}&iamount02=${form.iamount02}` +
      `&text3=${form.text3}&iamount03=${form.iamount03}` +
      `&text4=${form.text4}&iamount04=${form.iamount04}`;
    window.open(url);
  };

  return (
    <div className={styles.page}>
      <h2>Pretty Ledger Add Item</h2>
      <p>기간: {startDate} ~ {endDate}</p>

      {[1, 2, 3, 4].map(i => (
        <div className={styles.formRow} key={i}>
          <input
            name={`text${i}`}
            placeholder={`Item ${i}`}
            value={form[`text${i}`]}
            onChange={handleChange}
          />
          <input
            type="number"
            name={`iamount0${i}`}
            placeholder={`Amount ${i}`}
            step="any"
            value={form[`iamount0${i}`]}
            onChange={handleChange}
          />
        </div>
      ))}

      <div className={styles.formRow}>
        <strong>Total:</strong> ${totalAmount}
      </div>

      <div className={styles.formRow}>
        <button onClick={handleSubmitPDF}>Submit PDF 보기</button>
        <button onClick={onBack}>되돌아 가기</button>
      </div>
    </div>
  );
};

export default AccountPettyMoneySubmitPage;
