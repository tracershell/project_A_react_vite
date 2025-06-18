// client/src/pages/admin/general/GeneralEnvelopePage.jsx
import React, { useState, useEffect } from 'react';
import styles from './GeneralEnvelopePage.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GeneralEnvelopePage = () => {
  const [senderList, setSenderList] = useState([]);
  const [receiverList, setReceiverList] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [selectedReceivers, setSelectedReceivers] = useState([]);
  const [receiverSearch, setReceiverSearch] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [rcodeList, setRcodeList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSender();
    fetchReceiver();
  }, []);

  const fetchSender = async () => {
    const { data } = await axios.get('/api/admin/general/generalenvelope/sender');
    setSenderList(data);
  };

  const fetchReceiver = async () => {
    const { data } = await axios.get('/api/admin/general/generalenvelope/receiver');
    setReceiverList(data);
    setRcodeList([...new Set(data.map(r => r.rcode))]);
  };

  const toggleReceiver = (id) => {
    setSelectedReceivers(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      const idsToRemove = filteredReceivers.map(r => r.id);
      setSelectedReceivers(prev => prev.filter(id => !idsToRemove.includes(id)));
    } else {
      const idsToAdd = filteredReceivers.map(r => r.id);
      setSelectedReceivers(prev => [...new Set([...prev, ...idsToAdd])]);
    }
    setSelectAll(!selectAll);
  };

  const handlePrint = async () => {
    const sender = senderList.find(s => s.id === selectedSender);
    const receivers = receiverList.filter(r => selectedReceivers.includes(r.id));

    if (receivers.length === 0) {
      alert('최소한 하나의 수신자를 선택해야 합니다.');
      return;
    }

    try {
      const res = await axios.post('/api/admin/general/generalenvelope/pdf', {
        sender,
        receivers
      }, { responseType: 'blob' });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      console.error('PDF 출력 실패:', err);
      alert('PDF 생성 중 오류 발생');
    }
  };

  const handleInputData = () => {    
    navigate('/admin/general/envelope_input');
  };

  const filteredReceivers = receiverList.filter(r =>
    receiverSearch === '' || r.rcode === receiverSearch
  );

  return (
    <div className={styles.page}>
      <h2>Envelope Print</h2>
      <div className={styles.buttonRow}>
        <button onClick={handlePrint}>PDF 보기</button>
        <button className={styles.lightBlue} onClick={handleInputData}>Input Data</button>
      </div>

      <h2>Sender Selection</h2>
      <table className={styles.table}>
        <thead>
          <tr><th>Select</th><th>Name</th><th>Street</th><th>City</th><th>State</th><th>Zip</th></tr>
        </thead>
        <tbody>
          {senderList.map(s => (
            <tr key={s.id} className={selectedSender === s.id ? styles.selected : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedSender === s.id}
                  onChange={() => setSelectedSender(selectedSender === s.id ? null : s.id)}
                />
              </td>
              <td>{s.sname}</td><td>{s.sstreet}</td><td>{s.scity}</td><td>{s.sstate}</td><td>{s.szip}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Receiver Selection</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>              
<div className={styles.inlineFilter} style={{ width: '20%' }}>
  <label style={{ marginRight: '0.5rem', width: '8rem'  } }>Code 검색: </label>
  <select value={receiverSearch} onChange={e => setReceiverSearch(e.target.value)}>
    <option value=''>-- 전체 보기 --</option>
    {rcodeList.map(code => <option key={code} value={code}>{code}</option>)}
  </select>
  </div>
</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={handleSelectAll} style={{ cursor: 'pointer' }}>
              {selectAll ? 'Unselect All' : 'Select All'}
            </th>
            <th>Code</th><th>Name</th><th>Attn</th><th>Street</th><th>City</th><th>State</th><th>Zip</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceivers.map(r => (
            <tr key={r.id} className={selectedReceivers.includes(r.id) ? styles.selected : ''}>
              <td><input type="checkbox" checked={selectedReceivers.includes(r.id)} onChange={() => toggleReceiver(r.id)} /></td>
              <td>{r.rcode}</td><td>{r.rname}</td><td>{r.ratt}</td><td>{r.rstreet}</td><td>{r.rcity}</td><td>{r.rstate}</td><td>{r.rzip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeneralEnvelopePage;
