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
    const { data } = await axios.get('/api/admin/import/vendors', { withCredentials: true });
    setVendors(data);
  };

  const fetchList = async () => {
    const { data } = await axios.get('/api/admin/import/po', { withCredentials: true });
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
      await axios.post('/api/admin/import/po/add', cleanedForm, { withCredentials: true });
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
      await axios.put(`/api/admin/import/po/edit/${selectedId}`, cleanedForm, { withCredentials: true });
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
      await axios.delete(`/api/admin/import/po/delete/${selectedId}`, { withCredentials: true });
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

  // 검색 필터 적용
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
    // 실제 동작 없음(필터는 state 기반)
  };

  // Deposit Pay 버튼: 임시테이블 저장 후 이동 (타입 오류/NaN 방지)
  const handleDepositPay = async () => {
    let rowsToSend = [];
    let vId = searchVendor || form.vendor_id;
    let vName = form.vendor_name || (vendors.find(v => v.id === Number(vId))?.name ?? '');
    let vRate = form.deposit_rate || (vendors.find(v => v.id === Number(vId))?.deposit_rate ?? '');

    if (dpSelected.length > 0) {
      rowsToSend = list.filter(r => dpSelected.includes(r.id));
      vId = rowsToSend[0]?.vendor_id || vId;
      vName = rowsToSend[0]?.vendor_name || vName;
      vRate = rowsToSend[0]?.deposit_rate || vRate;
    } else if (vId) {
      rowsToSend = list.filter(
        r => r.vendor_id === Number(vId) && r.dp_status === 'paid'
      );
    }

    // ✅ vendor_id가 여러 개 존재하는지 검사
    const uniqueVendorIds = [...new Set(rowsToSend.map(r => r.vendor_id))];
    if (uniqueVendorIds.length > 1) {
      alert('같은 Vendor 가 아닙니다');
      return;
    }

    if (!rowsToSend.length) {
      alert('PO를 선택하거나, Vendor를 선택 후 DP 상태가 paid인 건만 이동합니다.');
      return;
    }
    try {
      // 모든 값은 서버에서 숫자 변환되지만, NaN/undefined 방지 위해 프론트에서 미리 체크
      const cleanedRows = rowsToSend.map(r => ({
        vendor_id: r.vendor_id,
        vendor_name: r.vendor_name,
        po_no: r.po_no,
        style_no: r.style_no,
        po_date: cleanDate(r.po_date),
        pcs: Number(r.pcs) || 0,
        cost_rmb: Number(r.cost_rmb) || 0,
        t_amount_rmb: Number(r.pcs) * Number(r.cost_rmb),  // 계산 필드
        note: r.note || '',
        deposit_rate: Number(r.deposit_rate || vRate) || 0,
        // 이하 기존 로직...
        dp_amount_rmb: (Number(r.pcs) * Number(r.cost_rmb) * (Number(r.deposit_rate || vRate) || 0) / 100).toFixed(2),
        // dp_amount_usd, dp_exrate, dp_date 등은 0/null로 서버에서 처리
      }));
      await axios.post('/api/admin/import/deposit/batchAdd', {
        rows: cleanedRows,
        vendor_id: vId,
        vendor_name: vName,
        deposit_rate: vRate,
      }, {
        withCredentials: true,
        timeout: 10000,
      });
      navigate('/admin/import/deposit');
    } catch (err) {
      const errorMsg = err.response?.data?.error ||
        (err.code === 'ECONNABORTED' ? '요청 시간 초과' : err.message);
      alert('임시저장 실패: ' + errorMsg);
    }
  };

  // Balance Pay 버튼 (기존 코드 유지)
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

    // ✅ vendor_id가 여러 개 존재하는지 검사
    const uniqueVendorIds = [...new Set(rowsToSend.map(r => r.vendor_id))];
    if (uniqueVendorIds.length > 1) {
      alert('같은 Vendor 가 아닙니다');
      return;
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

  const totalRmb = ((Number(form.pcs) || 0) * (Number(form.cost_rmb) || 0)).toFixed(2);

  return (
    <div className={styles.page}>
      <h2>PO Input</h2>
      <form className={`${styles.formRow} ${styles.small}`} onSubmit={e => e.preventDefault()}>
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

      <h2>PO List</h2>
      <form className={`${styles.formRow} ${styles.small}`} onSubmit={handleSearch}>
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

      <div className={styles.list}>
        <table className="styles.compactTable">
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
