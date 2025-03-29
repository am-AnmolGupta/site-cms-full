import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style.css';
import { getCookie } from '../../../Helper/cookieHelper';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardTitle,
  CCardText,
  CCardFooter,
  CButton,
  CSpinner,
  CInputGroup,
  CFormInput,
  CFormLabel,
  CAlert,
  CBadge,
  CRow,
  CCol,
  CContainer
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import { cilReload, cilWarning, cilBurn, cilBug } from '@coreui/icons';

const Log = () => {
  const [logs, setLogs] = useState('');
  const [updatedOn, setUpdatedOn] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [noLogsFound, setNoLogsFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setIsLoading(true);
    setError(null);
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
        return;
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
      setError(error.message);
      setNoLogsFound(true);
      setLogs('');
      setUpdatedOn('');
      setFileSize('');
    } finally {
      setIsLoading(false);
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

  const handleRefresh = () => {
    fetchLogs();
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'error':
        return <CIcon icon={cilBug} size="lg" className="me-2" />;
      case 'warning':
        return <CIcon icon={cilWarning} size="lg" className="me-2" />;
      case 'query':
        return <CIcon icon={cilBurn} size="lg" className="me-2" />;
      default:
        return <CIcon icon={cilBurn} size="lg" className="me-2" />;
    }
  };

  const getTypeBadge = () => {
    switch (type) {
      case 'error':
        return <CBadge color="danger" shape="rounded-pill">application</CBadge>;
      case 'warning':
        return <CBadge color="warning" shape="rounded-pill">Warning</CBadge>;
      case 'info':
        return <CBadge color="info" shape="rounded-pill">Info</CBadge>;
      default:
        return <CBadge color="primary" shape="rounded-pill">{type?.toUpperCase()}</CBadge>;
    }
  };

  return (
    <CContainer fluid className="px-0">
      <CCard className="mb-4 shadow">
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol xs={12} md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                {getTypeIcon()}
                <h5 className="mb-0">
                  {type === 'error' ? 'APPLICATION' : type?.toUpperCase()} LOGS
                  <span className="ms-2">{getTypeBadge()}</span>
                </h5>
              </div>
            </CCol>

            <CCol xs={12} md={6}>
              <CRow className="align-items-center justify-content-md-end g-3">
                <CCol xs={9} sm={7} md={5}>
                  <CInputGroup size="sm">
                    <CFormLabel htmlFor="datePicker" className="me-2 d-flex align-items-center mb-0">
                      Select Date:
                    </CFormLabel>
                    <CFormInput
                      type="date"
                      id="datePicker"
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="form-control-sm"
                    />
                  </CInputGroup>
                </CCol>

                <CCol xs={2} sm={4} md={1} className="text-end">
                  <CButton
                    color="primary"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? (
                      <CSpinner size="sm" />
                    ) : (
                      <>
                        <CIcon icon={cilReload} />
                        <span className="ms-1 d-none d-sm-inline"></span>
                      </>
                    )}
                  </CButton>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody>
          {isLoading && !error && (
            <div className="text-center my-5">
              <CSpinner color="primary" />
              <p className="mt-3">Loading logs...</p>
            </div>
          )}

          {error && (
            <CAlert color="danger">
              <strong>Error:</strong> {error}
            </CAlert>
          )}

          {!isLoading && !error && noLogsFound && (
            <CAlert color="warning">
              <strong>No logs found</strong> for the selected date and type.
            </CAlert>
          )}

          {!isLoading && !error && !noLogsFound && (
            <>
              <CRow className="mb-3">
                <CCol xs={12} sm={6} className="mb-2 mb-sm-0">
                  <CCardText>
                    <strong>Updated On:</strong> {updatedOn}
                  </CCardText>
                </CCol>
                <CCol xs={12} sm={6} className="text-sm-end">
                  <CCardText>
                    <strong>File Size:</strong> <CBadge color="secondary">{fileSize} KB</CBadge>
                  </CCardText>
                </CCol>
              </CRow>
              <div className="log-content p-3 border rounded overflow-auto">
                <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{logs}</pre>
              </div>
            </>
          )}
        </CCardBody>

        {!isLoading && !error && !noLogsFound && (
          <CCardFooter className="text-muted">
            <small>Log information as of {new Date().toLocaleString()}</small>
          </CCardFooter>
        )}
      </CCard>
    </CContainer>
  );
};

export default Log;