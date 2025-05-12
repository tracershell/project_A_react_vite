import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './EmployeesListPage.module.css';

const EmployeesPrintPage = () => {
  const { eid } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await axios.get(`/api/admin/employees/employeeslistpage/print/${eid}`);
        setEmployee(empRes.data);

        const photoRes = await axios.get(`/api/admin/employees/employeesphotofetch/${eid}`);
        setPhoto(photoRes.data.filename);

        const docRes = await axios.get(`/api/admin/employees/employeesdata/docs/${eid}`);
        setDocuments(docRes.data);
      } catch (err) {
        console.error('❌ 데이터 로드 실패:', err);
        alert('직원 정보 또는 사진/문서 로드 실패');
      }
    };

    fetchData();
  }, [eid]);

  if (!employee) return <div style={{ padding: '20px' }}>로딩 중...</div>;

  const sections = [
    {
      title: '기본 정보',
      fields: [
        { label: 'Status', value: employee.status },
        { label: 'SS No', value: employee.ss },
        { label: 'Birthday', value: employee.birth?.split('T')[0] },
        { label: 'Email', value: employee.email },
        { label: 'Phone', value: employee.phone },
        { label: 'Job Code', value: employee.jcode },
        { label: 'Job Title', value: employee.jtitle },
      ]
    },
    {
      title: '근무 정보',
      fields: [
        { label: 'Start Date', value: employee.sdate?.split('T')[0] },
        { label: 'End Date', value: employee.edate?.split('T')[0] },
        { label: 'Sick Leave', value: employee.sick },
        { label: 'Vacation', value: employee.vac },
        { label: 'Workload', value: employee.workl },
      ]
    },
    {
      title: '주소 정보',
      fields: [
        { label: 'Address', value: employee.address },
        { label: 'City', value: employee.city },
        { label: 'State', value: employee.state },
        { label: 'Zip', value: employee.zip },
        { label: 'Remark', value: employee.remark },
      ]
    }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topSection}>
        <h2>직원 상세정보</h2>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', marginBottom: '1rem' }}>
          {photo && (
            <img
              src={`/uploads/ep_uploads/${photo}`}
              alt="employee"
              style={{ height: '100px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          )}
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>EID: {employee.eid}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Name: {employee.name}</div>
          </div>
        </div>
        <button onClick={() => navigate(-1)}>← 뒤로</button>
      </div>

      <div className={styles.bottomSection}>
        {sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '10px 0', color: '#333' }}>{section.title}</h3>
            <table className={styles.compactTable}>
              <thead>
                <tr>
                  {section.fields.map((f, i) => (
                    <th key={i}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {section.fields.map((f, i) => (
                    <td key={i}>{f.value || '-'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className={styles.bottomSection}>
        <h2>Uploaded Documents</h2>
        <table className={styles.compactTable}>
          <thead>
            <tr>
              <th>파일 이름</th>
              <th>설명</th>
              <th>업로드 날짜</th>
              <th>다운로드</th>
            </tr>
          </thead>
          <tbody>
            {documents.length > 0 ? (
              documents.map((f) => (
                <tr key={f.id}>
                  <td>{f.originalname}</td>
                  <td>{f.comment}</td>
                  <td>{f.upload_date.split('T')[0]}</td>
                  <td>
                    <a href={`/e_uploads/${f.filename}`} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">문서가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesPrintPage;
