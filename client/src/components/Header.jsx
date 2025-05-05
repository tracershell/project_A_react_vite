import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1>🍎 APPLE2NE1 프론트엔드 : 테스트 이곳일까?</h1>
        <nav>
          <ul>
            <li><a href="/">홈</a></li>
            <li><a href="/login">로그인</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
