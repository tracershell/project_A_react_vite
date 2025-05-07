import React, { useEffect, useState } from 'react';

const AdminPage = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/log/404')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div>
      <h2>👑 Admin Page</h2>
      <h3>404 로그 통계</h3>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Path</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.path}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
