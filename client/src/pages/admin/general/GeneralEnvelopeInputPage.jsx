// ✅ React Page: GeneralEnvelopeInputPage.jsx
// 클라이언트: client/src/pages/admin/payroll/GeneralEnvelopeInputPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './GeneralEnvelopeInputPage.module.css';
import axios from 'axios';

const GeneralEnvelopeInputPage = () => {
  const [senderForm, setSenderForm] = useState({ sname: 'ARGUS US INC', sstreet: '2055 E. 51st Street', scity: 'VERNON', sstate: 'CA', szip: '90058' });
  const [receiverForm, setReceiverForm] = useState({ rcode: '', rname: '', ratt: '', rstreet: '', rcity: '', rstate: '', rzip: '' });
  const [senderList, setSenderList] = useState([]);
  const [receiverList, setReceiverList] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    fetchSender();
    fetchReceiver();
  }, []);

  const fetchSender = async () => {
    const { data } = await axios.get('/api/admin/general/generalenvelopeinput/sender');
    setSenderList(data);
  };

  const fetchReceiver = async () => {
    const { data } = await axios.get('/api/admin/general/generalenvelopeinput/receiver');
    setReceiverList(data);
  };

  const handleSenderChange = e => setSenderForm({ ...senderForm, [e.target.name]: e.target.value });
  const handleReceiverChange = e => setReceiverForm({ ...receiverForm, [e.target.name]: e.target.value });

  const handleAddSender = async () => {
    await axios.post('/api/admin/general/generalenvelopeinput/sender', senderForm);
    fetchSender();
    setSenderForm({ sname: 'ARGUS US INC', sstreet: '2055 E. 51st Street', scity: 'VERNON', sstate: 'CA', szip: '90058' });
  };

  const handleEditSender = async () => {
    if (!selectedSenderId) return;
    await axios.put(`/api/admin/general/generalenvelopeinput/sender/${selectedSenderId}`, senderForm);
    fetchSender();
    setSelectedSenderId(null);
  };

  const handleDeleteSender = async () => {
    if (!selectedSenderId) return;
    await axios.delete(`/api/admin/general/generalenvelopeinput/sender/${selectedSenderId}`);
    fetchSender();
    setSelectedSenderId(null);
  };

  const handleSelectSender = (s) => {
    setSelectedSenderId(s.id);
    setSenderForm(s);
  };

  const handleAddReceiver = async () => {
    await axios.post('/api/admin/general/generalenvelopeinput/receiver', receiverForm);
    fetchReceiver();
    setReceiverForm({ rcode: '', rname: '', ratt: '', rstreet: '', rcity: '', rstate: '', rzip: '' });
  };

  const handleEditReceiver = async () => {
    if (!selectedReceiverId) return;
    await axios.put(`/api/admin/general/generalenvelopeinput/receiver/${selectedReceiverId}`, receiverForm);
    fetchReceiver();
    setSelectedReceiverId(null);
  };

  const handleDeleteReceiver = async () => {
    if (!selectedReceiverId) return;
    await axios.delete(`/api/admin/general/generalenvelopeinput/receiver/${selectedReceiverId}`);
    fetchReceiver();
    setSelectedReceiverId(null);
  };

  const handleSelectReceiver = (r) => {
    setSelectedReceiverId(r.id);
    setReceiverForm(r);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  return (
    <div className={styles.page}>
      <h2>Envelope Sender Input</h2>
      <form className={`${styles.formRow} ${styles.small}`}>
        {['sname', 'sstreet', 'scity', 'sstate', 'szip'].map((field, idx) => (
          <input
            key={field}
            name={field}
            placeholder={field === 'sname' ? 'Sender Name' : field.charAt(0).toUpperCase() + field.slice(1)}
            value={senderForm[field]}
            onChange={handleSenderChange}
            ref={el => inputRefs.current[idx] = el}
            onKeyDown={e => handleKeyDown(idx, e)}
          />
        ))}
        <button type="button" onClick={handleAddSender}>입력</button>
        <button type="button" onClick={handleEditSender} disabled={!selectedSenderId}>수정</button>
        <button type="button" onClick={handleDeleteSender} disabled={!selectedSenderId}>삭제</button>
      </form>

      <h2>Sender Table</h2>
      <table className={styles.table}><thead><tr><th>Name</th><th>Street</th><th>City</th><th>State</th><th>Zip</th></tr></thead>
        <tbody>
          {senderList.map(s => (
            <tr key={s.id} onClick={() => handleSelectSender(s)}>
              <td>{s.sname}</td><td>{s.sstreet}</td><td>{s.scity}</td><td>{s.sstate}</td><td>{s.szip}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Envelope Receiver Input</h2>
      <form className={`${styles.formRow} ${styles.small}`}>
        {['rcode', 'rname', 'ratt', 'rstreet', 'rcity', 'rstate', 'rzip'].map((field, idx) => (
          <input
            key={field}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={receiverForm[field]}
            onChange={handleReceiverChange}
            ref={el => inputRefs.current[idx + 5] = el} // sender는 0~4, receiver는 5~
            onKeyDown={e => handleKeyDown(idx + 5, e)}
          />
        ))}
        <button type="button" onClick={handleAddReceiver}>입력</button>
        <button type="button" onClick={handleEditReceiver} disabled={!selectedReceiverId}>수정</button>
        <button type="button" onClick={handleDeleteReceiver} disabled={!selectedReceiverId}>삭제</button>
      </form>

      <h2>Receiver Table</h2>
      <table className={styles.table}><thead><tr><th>Code</th><th>Name</th><th>Attn</th><th>Street</th><th>City</th><th>State</th><th>Zip</th></tr></thead>
        <tbody>
          {receiverList.map(r => (
            <tr key={r.id} onClick={() => handleSelectReceiver(r)}>
              <td>{r.rcode}</td><td>{r.rname}</td><td>{r.ratt}</td><td>{r.rstreet}</td><td>{r.rcity}</td><td>{r.rstate}</td><td>{r.rzip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeneralEnvelopeInputPage;
