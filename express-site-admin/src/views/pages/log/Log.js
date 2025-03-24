import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style.css';
import { getCookie } from '../../../Helper/cookieHelper';

const Log = () => {
  const [logs, setLogs] = useState('');
  const [updatedOn, setUpdatedOn] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [noLogsFound, setNoLogsFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get('type');

  useEffect(() => {
    if (type == null) {
      navigate("/403");
    }
  }, [type, navigate]);

  const fetchLogs = async () => {
    try {
      const token = getCookie('authToken=');
      const response = await fetch(`${url}/admin/log?type=${type}&date=${selectedDate}`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await response.json();
      if (data.status_code === 403) {
        navigate("/403");
      }
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      if (data.logs.trim() === '') {
        setNoLogsFound(true);
        setLogs('');
        setUpdatedOn('');
        setFileSize('');
      } else {
        setNoLogsFound(false);
        setLogs(data.logs);
        setUpdatedOn(new Date(data.updatedOn).toLocaleString());
        setFileSize(data.fileSize);
      }
    } catch (error) {
      console.error('Error fetching logs:', error.message);
      setNoLogsFound(true);
      setLogs('');
      setUpdatedOn('');
      setFileSize('');
    }
  };

  useEffect(() => {
    if (type != null) {
      fetchLogs();
    }
  }, [type, selectedDate, url]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div className="log-container">
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
      />
      <button onClick={fetchLogs}>Get</button>
      {noLogsFound ? (
        <p>No logs found.</p>
      ) : (
        <>
          <h2>{type == 'error' ? 'APPLICATION' : type?.toUpperCase()} LOGS</h2>
          <p>Updated On: {updatedOn}</p>
          <p>File Size: {fileSize} KB</p>
          <div className="log-content">
            <pre>{logs}</pre>
          </div>
        </>
      )}
    </div>
  );
};

export default Log;
