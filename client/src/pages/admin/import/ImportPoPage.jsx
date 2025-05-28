//client/src/pages/admin/import/ImportPoPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ImportPoPage.module.css';

const ImportPoPage = () => {
  // 기본 상태
  const [vendors, setVendors] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  // 체크박스 상태
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [dpSelected, setDpSelected] = useState([]);
  const [bpSelected, setBpSelected] = useState([]);

  // 검색 조건
  const [searchVendor, setSearchVendor] = useState('');
  const [searchBP, setSearchBP] = useState('');
  const [searchText, setSearchText] = useState('');

  // T.Amount 실시간 계산용 상태
  const [totalRmb, setTotalRmb] = useState('');


  const inputsRef = useRef([]);
  const navigate = useNavigate();

  // 데이터 로드
  useEffect(() => {
    fetchVendors();
    fetchList();
  }, []);

  // ── pcs 또는 cost_rmb 변경 시 totalRmb 업데이트 ──
  useEffect(() => {
    const pcs = Number(form.pcs) || 0;
    const cost = Number(form.cost_rmb) || 0;
    setTotalRmb(
      (pcs * cost).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }, [form.pcs, form.cost_rmb]);


  const fetchVendors = async () => {
    const { data } = await axios.get('/api/admin/import/vendors', { withCredentials: true });
    setVendors(data);
  };
  const fetchList = async () => {
    const { data } = await axios.get('/api/admin/import/po', { withCredentials: true });
    setList(data);
  };

  // 유틸: 날짜 포맷
  const cleanDate = dateStr => {
    if (!dateStr) {
      // 🟡 오늘 날짜를 기본값으로 반환
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    if (typeof dateStr === 'string') return dateStr.split('T')[0];
    if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
    return String(dateStr).split('T')[0];
  };


  // 입력 폼 핸들러
  const handleVendorChange = e => {
    const vid = Number(e.target.value);
    const v = vendors.find(x => x.id === vid) || {};
    setForm(f => ({
      ...f,
      vendor_id: vid,
      vendor_name: v.name,
      deposit_rate: v.deposit_rate
    }));
    setSearchVendor(vid);
  };
  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleKeyDown = (idx, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus();
    }
  };

  // ── **여기** tAmount 계산을 추가하세요! ────────────────────────────────
  const tAmount = form.pcs && form.cost_rmb
    ? (Number(form.pcs) * Number(form.cost_rmb))
      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  // CRUD 핸들러
  const handleAdd = async () => {
    const payload = { ...form, po_date: cleanDate(form.po_date) };
    try {
      await axios.post('/api/admin/import/po/add', payload, { withCredentials: true });
      fetchList();
      clearFormFields();
      alert('✅ 저장 완료');
    } catch (err) {
      alert(`⛔ ${err.response?.data?.error || err.message}`);
    }
  };
  const handleEdit = async () => {
    if (!selectedId) return alert('수정할 항목을 선택하세요.');
    const payload = { ...form, po_date: cleanDate(form.po_date) };
    try {
      await axios.put(`/api/admin/import/po/edit/${selectedId}`, payload, { withCredentials: true });
      fetchList();
      clearFormFields();
      alert('✅ 수정 완료');
    } catch (err) {
      alert(`⛔ ${err.response?.data?.error || err.message}`);
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
    setForm({ ...row, po_date: cleanDate(row.po_date) });
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

  // DP/BP 체크박스 토글
  const toggleDp = id =>
    setDpSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleBp = id =>
    setBpSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // 검색 필터링
  const filteredList = list.filter(r =>
    (!searchVendor || r.vendor_id === Number(searchVendor)) &&
    (!searchBP || r.bp_status === searchBP) &&
    (
      r.vendor_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.style_no?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.po_no?.toLowerCase().includes(searchText.toLowerCase())
    )
  );
  const handleSearch = e => { e.preventDefault(); };

  // 전체 선택 토글 (filteredList 기준)
  const toggleSelectAll = () => {
    if (selectedRows.size === filteredList.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredList.map(r => r.id)));
    }
  };
  const handleRowSelect = id => {
    setSelectedRows(s => {
      const nxt = new Set(s);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });
  };

  const handleViewPdf = async () => {
    try {
      const payload = {
        records: filteredList.length ? filteredList : list,  // ✅ 필터링된 리스트가 있으면 사용
        vendor_id: form.vendor_id || '',                     // ✅ form 상태에 있는 vendor_id
        dp_date: form.po_date || '',                         // ✅ form 상태에 있는 날짜 (필요시 이름 변경 가능)
        vendor_name: form.vendor_name || ''
      };

      const response = await axios.post(
        '/api/admin/import/po/pdf',                          // ✅ PO 전용 PDF 생성 엔드포인트
        payload,
        { responseType: 'blob' }                             // ✅ PDF 파일로 응답 받기
      );

      const pdfUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(pdfUrl);                                   // ✅ 새 창에서 PDF 열기
    } catch (err) {
      alert('PDF 생성 오류: ' + (err.response?.data?.error || err.message));
    }
  };

  // Deposit Pay 핸들러
  // const handleDepositPay = async () => {
  //   let rowsToSend = [];
  //   let vId = searchVendor || form.vendor_id;
  //   let vName = form.vendor_name ||
  //     (vendors.find(v => v.id === Number(vId))?.name || '');
  //   let vRate = form.deposit_rate ||
  //     (vendors.find(v => v.id === Number(vId))?.deposit_rate || '');

  //   if (dpSelected.length > 0) {
  //     rowsToSend = list.filter(r => dpSelected.includes(r.id));
  //     vId = rowsToSend[0]?.vendor_id || vId;
  //     vName = rowsToSend[0]?.vendor_name || vName;
  //     vRate = rowsToSend[0]?.deposit_rate || vRate;
  //   } else if (vId) {
  //     rowsToSend = list.filter(
  //       r => r.vendor_id === Number(vId) && r.dp_status === 'paid'
  //     );
  //   }

  //   const uniq = [...new Set(rowsToSend.map(r => r.vendor_id))];
  //   if (uniq.length > 1) {
  //     return alert('같은 Vendor만 선택 가능합니다.');
  //   }
  //   if (!rowsToSend.length) {
  //     return alert('Deposit 선택을 해야 합니다.');
  //   }

  const handleDepositPay = async () => {
    if (dpSelected.length === 0) {
      return alert('Deposit 선택을 하셔야 합니다.');
    }

    const combinedSelectedIds = [...new Set([...dpSelected, ...bpSelected])];
    const combinedRows = list.filter(r => combinedSelectedIds.includes(r.id));

    const uniqVendorIds = [...new Set(combinedRows.map(r => r.vendor_id))];
    if (uniqVendorIds.length > 1) {
      return alert('같은 Vendor만 선택 가능합니다.');
    }

    const rowsToSend = list.filter(r => dpSelected.includes(r.id));
    const vId = rowsToSend[0]?.vendor_id || '';
    const vName = rowsToSend[0]?.vendor_name || '';
    const vRate = rowsToSend[0]?.deposit_rate || '';

    // ✅ 여기에 try/catch 블록 포함시킴
    try {
      const cleanedRows = rowsToSend.map(r => {
        const pcs = Number(r.pcs) || 0;
        const cost = Number(r.cost_rmb) || 0;
        const rate = Number(r.deposit_rate || vRate) / 100;

        const t_amount_rmb = pcs * cost;
        const dpRmb =
          dpSelected.includes(r.id) && bpSelected.includes(r.id)
            ? t_amount_rmb
            : parseFloat((t_amount_rmb * rate).toFixed(2));

        return {
          vendor_id: r.vendor_id,
          vendor_name: r.vendor_name,
          po_no: r.po_no,
          style_no: r.style_no,
          po_date: cleanDate(r.po_date),
          pcs,
          cost_rmb: cost,
          t_amount_rmb: pcs * cost,
          note: r.note || '',
          deposit_rate: Number(r.deposit_rate || vRate) || 0,
          dp_amount_rmb: dpRmb,
          dp_exrate: 0,
          dp_amount_usd: 0,
          dp_date: null
        };
      });

      await axios.post(
        '/api/admin/import/deposit/batchAdd',
        { rows: cleanedRows, vendor_id: vId, vendor_name: vName, deposit_rate: vRate },
        { withCredentials: true }
      );

      navigate('/admin/import/deposit', {
        state: {
          rows: cleanedRows,
          vendor_id: vId,
          vendor_name: vName,
          deposit_rate: vRate
        }
      });

    } catch (err) {
      alert('임시저장 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  // Balance Pay 핸들러
  // const handleBalancePay = () => {
  //   let rowsToSend = [];
  //   let vId = searchVendor || form.vendor_id;

  //   if (bpSelected.length > 0) {
  //     rowsToSend = list.filter(r => bpSelected.includes(r.id));
  //     vId = rowsToSend[0]?.vendor_id || vId;
  //   } else if (vId) {
  //     rowsToSend = list.filter(
  //       r => r.vendor_id === Number(vId) && r.bp_status === 'paid'
  //     );
  //   }

  //   const uniq = [...new Set(rowsToSend.map(r => r.vendor_id))];
  //   if (uniq.length > 1) {
  //     return alert('같은 Vendor만 선택 가능합니다.');
  //   }
  //   if (!rowsToSend.length) {
  //     return alert('BP paid인 항목을 선택하세요.');
  //   }

  //   navigate('/admin/import/balance', { state: { rows: rowsToSend, vendor_id: vId } });
  // };

  const handleBalancePay = async () => {
    if (bpSelected.length === 0) {
      return alert('Balance 선택을 하셔야 합니다.');
    }

    // ✅ dp + bp 선택 항목 병합
    const combinedSelectedIds = [...new Set([...dpSelected, ...bpSelected])];
    const combinedRows = list.filter(r => combinedSelectedIds.includes(r.id));

    const uniqVendorIds = [...new Set(combinedRows.map(r => r.vendor_id))];
    if (uniqVendorIds.length > 1) {
      return alert('같은 Vendor만 선택 가능합니다.');
    }

    // ✅ 실제 Balance 처리 대상: bpSelected 기준
    const rowsToSend = list.filter(r => bpSelected.includes(r.id));
    const vId = rowsToSend[0]?.vendor_id || '';
    const vName = rowsToSend[0]?.vendor_name || '';
    const vRate = rowsToSend[0]?.deposit_rate || 0;

    try {
      const cleanedRows = rowsToSend.map(r => {
        const pcs = Number(r.pcs) || 0;
        const cost = Number(r.cost_rmb) || 0;
        const rate = Number(r.deposit_rate || vRate) / 100;
        const t_amount_rmb = pcs * cost;

        const dpRmb = rowsToSend[0]?.dp_amount_rmb || 0;  // table 에서 가지고  옴 
        
        const bpRmb = 
          bpSelected.includes(r.id) && dpSelected.includes(r.id)
            ? t_amount_rmb
            : parseFloat((t_amount_rmb - dpRmb).toFixed(2));
        

        return {
          vendor_id: r.vendor_id,
          vendor_name: r.vendor_name,
          po_no: r.po_no,
          style_no: r.style_no,
          po_date: cleanDate(r.po_date),
          pcs,
          cost_rmb: cost,
          t_amount_rmb,
          note: r.note || '',
          deposit_rate: Number(r.deposit_rate || vRate) || 0,
          dp_amount_rmb: dpRmb,
          bp_amount_rmb: bpRmb,
          bp_exrate: 0,
          bp_amount_usd: 0,
          bp_date: null
        };
      });

      await axios.post(
        '/api/admin/import/balance/batchAdd',
        { rows: cleanedRows, vendor_id: vId, vendor_name: vName, deposit_rate: vRate },
        { withCredentials: true }
      );

      navigate('/admin/import/balance', {
        state: {
          rows: cleanedRows,
          vendor_id: vId,
          vendor_name: vName,
          deposit_rate: vRate
        }
      });
    } catch (err) {
      alert('Balance 저장 실패: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className={styles.page}>
      <h2>PO Input</h2>
      <form className={`${styles.formRow} ${styles.small}`} onSubmit={e => e.preventDefault()}>
        <select
          ref={el => inputsRef.current[0] = el}
          name="vendor_id"
          value={form.vendor_id || ''}
          onChange={handleVendorChange}
        >
          <option value="">선택: Vendor</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <div><strong>Rate (%)</strong>: {form.deposit_rate || ''}</div>
        <input
          ref={el => inputsRef.current[1] = el}
          type="date"
          name="po_date"
          value={form.po_date || ''}
          onChange={handleChange}
        />
        <input
          ref={el => inputsRef.current[2] = el}
          name="style_no"
          placeholder="Style no."
          value={form.style_no || ''}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(2, e)}
        />
        <input
          ref={el => inputsRef.current[3] = el}
          name="po_no"
          placeholder="PO no."
          value={form.po_no || ''}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(3, e)}
        />
        <input
          ref={el => inputsRef.current[4] = el}
          type="number"
          name="pcs"
          placeholder="pcs"
          value={form.pcs || ''}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(4, e)}
        />
        <input
          ref={el => inputsRef.current[5] = el}
          type="number"
          step="0.01"
          name="cost_rmb"
          placeholder="cost (RMB)"
          value={form.cost_rmb || ''}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(5, e)}
        />
        <input readOnly placeholder="T.Amount" value={totalRmb} />
        <input
          ref={el => inputsRef.current[6] = el}
          name="note"
          placeholder="note"
          value={form.note || ''}
          onChange={handleChange}
          onKeyDown={e => handleKeyDown(6, e)}
        />
        <button type="button" onClick={handleAdd}>입력</button>
        <button type="button" onClick={handleEdit} disabled={!selectedId}>수정</button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={
            !selectedId ||
            (list.find(r => r.id === selectedId)?.dp_status === 'paid' ||
              list.find(r => r.id === selectedId)?.bp_status === 'paid')
          }
        >
          제거
        </button>

        <button type="button" onClick={clearFormFields}>초기화</button>
      </form>

      <h2>PO List</h2>
      <form className={`${styles.formRow} ${styles.small}`} onSubmit={handleSearch}>
        <select value={searchVendor} onChange={e => setSearchVendor(e.target.value)}>
          <option value="">:: Vendor ::</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <select value={searchBP} onChange={e => setSearchBP(e.target.value)}>
          <option value="">:: BP Status ::</option>
          <option value="paid">paid</option>
          <option value="">unpaid</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <button type="submit">검색</button>
        <button type="button" onClick={handleViewPdf}>PDF 보기</button>
        <button type="button" onClick={handleDepositPay}>Deposit Pay</button>
        <button type="button" onClick={handleBalancePay}>Balance Pay</button>
      </form>

      <div className={styles.list}>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={filteredList.length > 0 && selectedRows.size === filteredList.length}
                />
              </th>
              <th>Vendor Name</th>
              <th>Vendor Rate</th>
              <th>PO Date</th>
              <th>Style</th>
              <th>PO No.</th>
              <th>PCS</th>
              <th>Cost (RMB)</th>
              <th>T.Amount (RMB)</th>
              <th>DP Amount (RMB)</th>
              <th>DP Status</th>
              <th>BP Amount (RMB)</th>
              <th>BP Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(r => (
              <tr key={r.id} onClick={() => selectRow(r)}>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleRowSelect(r.id)}
                    checked={selectedRows.has(r.id)}
                  />
                </td>
                <td>{r.vendor_name}</td>
                <td>{r.deposit_rate}%</td>
                <td>{cleanDate(r.po_date)}</td>
                <td>{r.style_no}</td>
                <td>{r.po_no}</td>
                <td>{r.pcs != null ? Number(r.pcs).toLocaleString() : ''}</td>
                <td>{r.cost_rmb.toLocaleString()}</td>
                <td>{Number(r.t_amount_rmb || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>{Number(r.dp_amount_rmb || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                  {r.dp_status === 'paid' ? (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>paid</span>
                  ) : (
                    <input
                      type="checkbox"
                      onChange={() => toggleDp(r.id)}
                      checked={dpSelected.includes(r.id)}
                      hidden={r.bp_amount_rmb === r.t_amount_rmb}
                    />
                  )}
                </td>
                <td>{Number(r.bp_amount_rmb || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                  {r.bp_status === 'paid' ? (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>paid</span>
                  ) : (
                    <input
                      type="checkbox"
                      onChange={() => toggleBp(r.id)}
                      checked={bpSelected.includes(r.id)}
                      hidden={r.dp_amount_rmb === r.t_amount_rmb || r.t_amount_rmb === 0}
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