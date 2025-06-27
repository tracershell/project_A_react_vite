import React from 'react';
import styles from './VideoModal.module.css';

export default function VideoModal({ videoSrc, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <video className={styles.videoPlayer} controls autoPlay>
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div style={{ textAlign: 'center' }}>
          <button className={styles.closeButton} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
