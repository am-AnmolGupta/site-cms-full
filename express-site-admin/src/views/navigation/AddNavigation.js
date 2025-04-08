import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CButton,
  CFormSelect,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import axios from 'axios';
import { cilPlus, cilTrash, cilPencil } from '@coreui/icons';

function AddNavigation() {
  const { channelId, navigationId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [navItems, setNavItems] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [level, setLevel] = useState("1");

  const addNewItem = (parentId = null) => {
    const newItem = {
      id: `temp-${Date.now()}`,
      channel_id: channelId,
      parent_id: parentId,
      title: '',
      url: '',
      internal: true,
      status: 'active',
    };
    setNavItems([...navItems, newItem]);
  };

  const updateItem = (id, field, value) => {
    setNavItems(navItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteItem = (id) => {
    const idsToDelete = [id];

    const findChildren = (parentId) => {
      navItems.forEach(item => {
        if (item.parent_id === parentId) {
          idsToDelete.push(item.id);
          findChildren(item.id);
        }
      });
    };

    findChildren(id);
    setNavItems(navItems.filter(item => !idsToDelete.includes(item.id)));
  };

  const renderNavItem = (item, depth = 0) => (
    <CCard key={item.id} className="mb-3" style={{ marginLeft: `${depth * 20}px` }}>
      <CCardBody>
        <CRow className="g-3 align-items-center">
          <CCol xs={12} md={5}>
            <CFormLabel>Title</CFormLabel>
            <CFormInput value={item.title} onChange={(e) => updateItem(item.id, 'title', e.target.value)} placeholder="Navigation Title" />
          </CCol>
          <CCol xs={12} md={5}>
            <CFormLabel>URL</CFormLabel>
            <CFormInput value={item.url} onChange={(e) => updateItem(item.id, 'url', e.target.value)} placeholder="/path/to/page" />
          </CCol>
          <CCol xs={12} md={2}>
            <div className="mt-4">
              <CFormCheck label="Internal" checked={item.internal} onChange={(e) => updateItem(item.id, 'internal', e.target.checked)} />
            </div>
          </CCol>
          <CCol xs={12} md={5}>
            <CFormLabel>Status</CFormLabel>
            <CFormSelect value={item.status} onChange={(e) => updateItem(item.id, 'status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </CFormSelect>
          </CCol>
        </CRow>

        <CRow className="mt-3">
          <CCol>
            <CButton color="primary" variant="outline" size="sm" onClick={() => addNewItem(item.id)} className="me-2">
              <CIcon icon={cilPlus} size="sm" /> Add Sub-item
            </CButton>
            <CButton color="danger" variant="outline" size="sm" onClick={() => deleteItem(item.id)}>
              <CIcon icon={cilTrash} size="sm" /> Delete
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>

      {navItems.filter(child => child.parent_id === item.id).map(child => renderNavItem(child, depth + 1))}
    </CCard>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (navItems.some(item => !item.title || !item.url)) {
      setFormSubmitted(true);
      return;
    }

    const formattedData = {
      level: parseInt(level),
      navigation: JSON.stringify(navItems),
    };

    try {
      await axios.post(`${url}/admin/add-navigation`, formattedData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/channel/${channelId}/navigation`, { state: "Navigation updated successfully!" });
    } catch (error) {
      console.error("Error saving navigation:", error);
    }
  };

  useEffect(() => {
    if (!navigationId) return;

    axios.post(`${url}/admin/module/details`, {
      moduleType: "navigation",
      moduleId: navigationId,
      channelId,
    }).then(response => {
      const data = response.data.data;
      const formattedNavItems = data.map(item => ({
        id: item._id,
        channel_id: item.channelId,
        parent_id: item.parentId || null,
        title: item.title,
        url: item.url,
        internal: item.internal,
        status: item.status,
      }));
      setNavItems(formattedNavItems);
      setLevel(data[0].level.toString());
      setIsEdit(true);
    }).catch(error => console.error("Error fetching navigation:", error));
  }, [navigationId]);

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Navigation Builder</strong>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol xs={12} md={4}>
              <CFormLabel>Level</CFormLabel>
              <CFormSelect value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="1">L1 Nav</option>
                <option value="2">L2 Nav</option>
                <option value="3">L3 Nav</option>
              </CFormSelect>
            </CCol>
          </CRow>

          {formSubmitted && navItems.some(item => !item.title || !item.url) && (
            <CAlert color="danger">Please fill in all required fields.</CAlert>
          )}

          {navItems.filter(item => item.parent_id === null).map(item => renderNavItem(item))}

          <CRow className="mt-4">
            <CCol>
              <CButton color="success" variant="outline" onClick={() => addNewItem(null)} className="me-2">
                <CIcon icon={cilPlus} /> Add Top-Level Item
              </CButton>
              <CButton color="primary" type="submit">
                <CIcon icon={cilPencil} /> Save Navigation
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  );
}

export default AddNavigation;
