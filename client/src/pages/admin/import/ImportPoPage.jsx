// ImportPoPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ImportPoPage.module.css';

const ImportPoPage = () => {
  const [vendors, setVendors] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  // 검색 조건
  const [searchVendor, setSearchVendor] = useState('');
  const [searchBP, setSearchBP] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dpSelected, setDpSelected] = useState([]);
  const [bpSelected, setBpSelected] = useState([]);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
    fetchList();
  }, []);

  const fetchVendors = async () => {
    const { data } = await axios.get('/api/admin/import/vendors');
    setVendors(data);
  };

  const fetchList = async () => {
    const { data } = await axios.get('/api/admin/import/po');
    setList(data);
  };

  const handleVendorChange = e => {
    const vid = Number(e.target.value);
    const v = vendors.find(x => x.id === vid) || {};
    setForm(f => ({
      ...f,
      vendor_id: vid,
      vendor_name: v.name,
      deposit_rate: v.deposit_rate
    }));
    setSearchVendor(vid); // 검색 조건에도 반영
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const cleanDate = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string') return dateStr.split('T')[0];
    if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
    return String(dateStr).split('T')[0];
  };

  const handleAdd = async () => {
    const cleanedForm = {
      ...form,
      po_date: cleanDate(form.po_date)
    };

    try {
      await axios.post('/api/admin/import/po/add', cleanedForm);
      fetchList();
      clearFormFields();
      alert('✅ 저장 완료');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '입력 중 오류 발생';
      alert(`⛔ ${msg}`);
    }
  };

  const handleEdit = async () => {
    if (!selectedId) {
      alert('수정할 항목을 먼저 선택하세요.');
      return;
    }
    const cleanedForm = {
      ...form,
      po_date: cleanDate(form.po_date)
    };
    try {
      await axios.put(`/api/admin/import/po/edit/${selectedId}`, cleanedForm);
      fetchList();
      clearFormFields();
      alert('✅ 수정 완료');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '수정 중 오류 발생';
      alert(`⛔ ${msg}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await axios.delete(`/api/admin/import/po/delete/${selectedId}`);
      fetchList();
      clearFormFields();
    } catch (err) {
      alert(err.response?.data?.error || '삭제 중 오류 발생');
    }
  };

  const selectRow = row => {
    setSelectedId(row.id);
    setForm({
      ...row,
      po_date: cleanDate(row.po_date)
    });
  };

  const clearFormFields = () => {
    setSelectedId(null);
    setForm(f => ({
      vendor_id: f.vendor_id,
      vendor_name: f.vendor_name,
      deposit_rate: f.deposit_rate,
      po_date: f.po_date
    }));
  };

  const toggleDp = id =>
    setDpSelected(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );

  const toggleBp = id =>
    setBpSelected(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );

  // **Vendor Name 포함 검색** 반영
  const filteredList = list.filter(r =>
    (!searchVendor || r.vendor_id === Number(searchVendor)) &&
    (!searchBP || r.bp_status === searchBP) &&
    (
      r.vendor_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.style_no?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.po_no?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // <Deposit Pay> 버튼 (vendor_id 보장)
  const handleDepositPay = () => {
    let rowsToSend = [];
    let vId = searchVendor || form.vendor_id;
    if (dpSelected.length > 0) {
      rowsToSend = list.filter(r => dpSelected.includes(r.id));
      vId = rowsToSend[0]?.vendor_id || vId;
    } else if (vId) {
      rowsToSend = list.filter(
        r => r.vendor_id === Number(vId) && r.dp_status === 'paid'
      );
    }
    if (!rowsToSend.length) {
      alert('PO를 선택하거나, Vendor를 선택 후 DP 상태가 paid인 건만 이동합니다.');
      return;
    }
    navigate('/admin/import/deposit', {
      state: {
        rows: rowsToSend,
        vendor_id: vId
      }
    });
  };

  // <Balance Pay> 버튼 (vendor_id 보장)
  const handleBalancePay = () => {
    let rowsToSend = [];
    let vId = searchVendor || form.vendor_id;
    if (bpSelected.length > 0) {
      rowsToSend = list.filter(r => bpSelected.includes(r.id));
      vId = rowsToSend[0]?.vendor_id || vId;
    } else if (vId) {
      rowsToSend = list.filter(
        r => r.vendor_id === Number(vId) && r.bp_status === 'paid'
      );
    }
    if (!rowsToSend.length) {
      alert('PO를 선택하거나, Vendor를 선택 후 BP 상태가 paid인 건만 이동합니다.');
      return;
    }
    navigate('/admin/import/balance', {
      state: {
        rows: rowsToSend,
        vendor_id: vId
      }
    });
  };

  const totalRmb = ((form.pcs || 0) * (form.cost_rmb || 0)).toFixed(2);

  return (
    <div className={styles.page}>
      <h2>PO Input</h2>
      <form className={styles.formRow} onSubmit={e => e.preventDefault()}>
        <select
          ref={el => (inputsRef.current[0] = el)}
          name="vendor_id"
          value={form.vendor_id || ''}
          onChange={handleVendorChange}
        >
          <option value="">선택: Vendor</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <div className="vendorInfo"><strong>Vendor ID:</strong> {form.vendor_id || ''}</div>
        <div className="vendorInfo"><strong>Rate (%):</strong> {form.deposit_rate || ''}</div>
        <input ref={el => (inputsRef.current[1] = el)} type="date" name="po_date" value={form.po_date || ''} onChange={handleChange} />
        <input ref={el => (inputsRef.current[2] = el)} name="style_no" placeholder="Style no." value={form.style_no || ''} onChange={handleChange} onKeyDown={e => handleKeyDown(2, e)} />
        <input ref={el => (inputsRef.current[3] = el)} name="po_no" placeholder="PO no." value={form.po_no || ''} onChange={handleChange} onKeyDown={e => handleKeyDown(3, e)} />
        <input ref={el => (inputsRef.current[4] = el)} type="number" name="pcs" placeholder="pcs" value={form.pcs || ''} onChange={handleChange} onKeyDown={e => handleKeyDown(4, e)} />
        <input ref={el => (inputsRef.current[5] = el)} type="number" step="0.01" name="cost_rmb" placeholder="cost (RMB)" value={form.cost_rmb || ''} onChange={handleChange} onKeyDown={e => handleKeyDown(5, e)} />
        <input readOnly placeholder="T.Amount" value={totalRmb} />
        <input ref={el => (inputsRef.current[6] = el)} name="note" placeholder="note" value={form.note || ''} onChange={handleChange} onKeyDown={e => handleKeyDown(6, e)} />
        <button type="button" onClick={handleAdd}>입력</button>
        <button type="button" onClick={handleEdit} disabled={!selectedId}>수정</button>
        <button type="button" onClick={handleDelete} disabled={!selectedId}>제거</button>
        <button type="button" onClick={clearFormFields}>초기화</button>
      </form>

      <form className={styles.searchBox} onSubmit={handleSearch}>
        <select value={searchVendor} onChange={e => setSearchVendor(e.target.value)}>
          <option value="">:: Vendor ::</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <select value={searchBP} onChange={e => setSearchBP(e.target.value)}>
          <option value="">:: BP Status ::</option>
          <option value="paid">paid</option>
          <option value="unpaid">unpaid</option>
        </select>
        <input
          type="text"
          placeholder="Search by Vendor, Style or PO no."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <button type="submit">검색</button>
        <button type="button" onClick={handleDepositPay}>Deposit Pay</button>
        <button type="button" onClick={handleBalancePay}>Balance Pay</button>
      </form>

      <h2>PO List</h2>
      <div className={styles.list}>
        <table className="compactTable">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Rate</th>
              <th>Date</th>
              <th>Style</th>
              <th>PO no.</th>
              <th>pcs</th>
              <th>cost</th>
              <th>T.Amount</th>
              <th>DP Amt</th>
              <th>DP Status</th>
              <th>BP Amt</th>
              <th>BP Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(r => (
              <tr
                key={r.id}
                className={r.id === selectedId ? "selected" : ""}
                onClick={() => selectRow(r)}
              >
                <td>{r.vendor_name}</td>
                <td>{r.deposit_rate}</td>
                <td>{cleanDate(r.po_date)}</td>
                <td>{r.style_no}</td>
                <td>{r.po_no}</td>
                <td>{r.pcs}</td>
                <td>{r.cost_rmb}</td>
                <td>{(r.pcs * r.cost_rmb).toFixed(2)}</td>
                <td>{r.dp_amount_rmb}</td>
                <td>
                  {r.dp_status === 'paid' ? (
                    'paid'
                  ) : (
                    <input
                      type="checkbox"
                      checked={dpSelected.includes(r.id)}
                      onChange={() => toggleDp(r.id)}
                    />
                  )}
                </td>
                <td>{r.bp_amount_rmb}</td>
                <td>
                  {r.bp_status === 'paid' ? (
                    'paid'
                  ) : (
                    <input
                      type="checkbox"
                      checked={bpSelected.includes(r.id)}
                      onChange={() => toggleBp(r.id)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportPoPage;
