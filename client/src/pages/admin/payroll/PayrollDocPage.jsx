import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PayrollDocPage.module.css';
import TimeSheetAdd from './components/TimeSheetAdd';
import ChildSupportAdd from './components/ChildSupportAdd';
import PayrollDeductionAdd from './components/PayrollDeductionAdd';
import CashCalculationNote from './components/CashCalculationNote';

const PayrollDocPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState({
    childsupport: null,
    deduction: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/admin/payroll/payrolldoc', {
        withCredentials: true,
      });
      setUploadedFiles({
        childsupport: data.uploadedChildFile || null,
        deduction: data.uploadedDeductFile || null,
      });
    } catch (err) {
      console.error('Error fetching uploaded files:', err);
      setError('Failed to load uploaded files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (category, file) => {
    if (!file) {
      alert('Please select a file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`/api/admin/payroll/payrolldoc/upload/${category}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      await fetchUploadedFiles();
    } catch (err) {
      console.error(`Error uploading ${category} file:`, err);
      alert(`Failed to upload ${category} file`);
    }
  };

  const handleFileDelete = async (category, id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await axios.post(`/api/admin/payroll/payrolldoc/delete/${id}`, {}, {
        withCredentials: true,
      });
      await fetchUploadedFiles();
    } catch (err) {
      console.error(`Error deleting ${category} file:`, err);
      alert(`Failed to delete ${category} file`);
    }
  };

  return (
    <div className={styles.page}>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <TimeSheetAdd />
      <ChildSupportAdd
        uploadedFile={uploadedFiles.childsupport}
        onUpload={(file) => handleFileUpload('childsupport', file)}
        onDelete={() => handleFileDelete('childsupport', uploadedFiles.childsupport?.id)}
      />
      <PayrollDeductionAdd
        uploadedFile={uploadedFiles.deduction}
        onUpload={(file) => handleFileUpload('deduction', file)}
        onDelete={() => handleFileDelete('deduction', uploadedFiles.deduction?.id)}
      />
      <CashCalculationNote />
    </div>
  );
};

export default PayrollDocPage;