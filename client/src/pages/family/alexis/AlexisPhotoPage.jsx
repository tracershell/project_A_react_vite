// 📁 client/src/pages/family/alexis/AlexisPhotoPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AlexisPhotoPage.module.css';

export default function AlexisPhotoPage() {
  const [photos, setPhotos] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (year) fetchMonths(year);
  }, [year]);

  useEffect(() => {
    if (year && month) fetchPhotos(year, month);
  }, [year, month]);

  const fetchYears = async () => {
    const { data } = await axios.get('/api/family/alexis/photo/years');
    setYearList(data.years);
  };

  const fetchMonths = async (year) => {
    const { data } = await axios.get('/api/family/alexis/photo/months', { params: { year } });
    setMonthList(data.months);
  };

  const fetchPhotos = async (year, month) => {
    const { data } = await axios.get('/api/family/alexis/photo', { params: { year, month } });
    setPhotos(data.photos);
  };

  return (
    <div className={styles.page}>
      <h2>Alexis Photo</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className={styles.filterRow} style={{ width: '10%' }}>
        <select value={year} onChange={e => setYear(e.target.value)}>
          <option value=''>년도 선택</option>
          {yearList.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)}>
          <option value=''>월 선택</option>
          {monthList.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      </div>
      <div className={styles.gallery}>
        {photos.map(photo => (
          <div className={styles.photoBox} key={photo.id}>
            <img
         src={`/uploads/personal/photo_upload/${photo.thumbnail}`}
         alt={photo.comment}
         onClick={() =>
           setSelectedImage(`/uploads/personal/photo_upload/${photo.original}`)
         }
       />
            <div className={styles.comment}>{photo.comment}</div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
              <img
       src={selectedImage}
       alt="Full"
       className={styles.fullImage}
     />
        </div>
      )}
    </div>
  );
}
