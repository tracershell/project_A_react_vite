// 📁 client/src/pages/family/alexis/AlexisMoviePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AlexisMoviePage.module.css';

export default function AlexisMoviePage() {
  const [list, setList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (year) fetchMonths(year);
  }, [year]);

  useEffect(() => {
    if (year && month) fetchMovies(year, month);
  }, [year, month]);

  const fetchYears = async () => {
    const { data } = await axios.get('/api/family/alexis/movie/years');
    setYearList(data.years);
  };

  const fetchMonths = async (year) => {
    const { data } = await axios.get('/api/family/alexis/movie/months', { params: { year } });
    setMonthList(data.months);
  };

  const fetchMovies = async (year, month) => {
    const { data } = await axios.get('/api/family/alexis/movie', { params: { year, month } });
    setList(data.movies);
  };

  return (
    <div className={styles.page}>
      <h2>Alexis Movie</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div className={styles.filterRow}  style={{ width: '10%' }}>
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
        {list.map(movie => (
          <div key={movie.id} className={styles.movieBox}>
            <img
              src={`/uploads/personal/movie-thumbnail_upload/${movie.thumbnail}`}
              alt={movie.comment}
              onClick={() =>
                setSelectedVideo(`/uploads/personal/movie_upload/${movie.original}`)
              }
            />
            <div className={styles.comment}>{movie.comment}</div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className={styles.modal} onClick={() => setSelectedVideo(null)}>
          <video src={selectedVideo} controls autoPlay className={styles.videoPlayer} />
        </div>
      )}
    </div>
  );
}
