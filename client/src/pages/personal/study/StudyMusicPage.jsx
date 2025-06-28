// 📁 client/src/pages/personal/study/StudyMusicPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './StudyMusicPage.module.css';

export default function StudyMusicPage() {
  const [musicList, setMusicList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [audioSrc, setAudioSrc] = useState(null);
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (year) fetchMonths(year);
  }, [year]);

  useEffect(() => {
    if (year && month) fetchMusic(year, month);
  }, [year, month]);

  const fetchYears = async () => {
    const { data } = await axios.get('/api/personal/study/music/years');
    setYearList(data.years);
  };

  const fetchMonths = async (year) => {
    const { data } = await axios.get('/api/personal/study/music/months', { params: { year } });
    setMonthList(data.months);
  };

  const fetchMusic = async (year, month) => {
    const { data } = await axios.get('/api/personal/study/music', {
      params: { year, month }
    });
    setMusicList(data);
  };

  const playMusic = async (filename, textfile) => {
    setAudioSrc(`/uploads/personal/music_upload/${filename}`);
    if (textfile) {
      try {
        const { data } = await axios.get(`/api/personal/study/music/text/${textfile}`);
        setTextContent(data);
      } catch {
        setTextContent('');
      }
    } else {
      setTextContent('');
    }
  };

  return (
    <div className={styles.page}>
      <h2>Study Music</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div className={styles.filterRow} style={{ width: '10%' }}>
          <select value={year} onChange={e => setYear(e.target.value)}>
            <option value="">년도 선택</option>
            {yearList.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">월 선택</option>
            {monthList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.gallery}>
        {musicList.map(m => (
          <div key={m.id} className={styles.itemBox}>
            <div
              className={styles.filename}
              onClick={() => playMusic(m.original, m.textfile)}
            >
              {m.original}
            </div>
            <div className={styles.comment}>{m.comment}</div>
          </div>
        ))}
      </div>

      {audioSrc && (
        <div className={styles.modal} onClick={() => {
          setAudioSrc(null);
          setTextContent('');
        }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <audio src={audioSrc} controls autoPlay style={{ width: '100%' }} />
            {textContent && <pre className={styles.textBox}>{textContent}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}

