import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilPlus } from "@coreui/icons";
import { getCookie } from '../../Helper/cookieHelper';
import { ToastContainer } from "react-toastify";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton
} from "@coreui/react";
import DataTable from "../../components/DataTable";
const ViewBrand = () => {
  const url = import.meta.env.VITE_USERS_API_URL;
  const [person, setPerson] = useState([]);
  const navigate = useNavigate(); // Use useNavigate hook for programmatic navigation
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const [totalDocs, setTotalDocs] = useState(0);
  useEffect(() => {
    const getBrand = async () => {
      try {
        const token = getCookie('authToken=');
        const response = await fetch(`${url}/admin/admins`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
        });
        const json = await response.json();
        if (json.status_code === 403) {
          navigate("/403");
        } else {
          const formattedData = json.data.docs.map((item) => ({
            ...item,
            id: item._id,
          }));
          setPerson(formattedData);
          setTotalDocs(json.data.totalDocs);
        }
      } catch (error) {
        console.error("Error fetching persons:", error);
      }
    };

    getBrand();
    // eslint-disable-next-line
  }, []);
  const handleEdit = (item) => {
    navigate(`/admin/${item._id}/edit`, { state: { itemData: item } }); // Pass person object
  };

  const redirectToBrandAdd = () => {
    navigate("/admin/add");
  };

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <CButton
          color="primary"
          variant="outline"
          size="sm"
          onClick={() => handleEdit(params.row)}
        >
          Edit
        </CButton>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      minWidth: 100,
      valueGetter: (params) => {
        return params.join(', ');
      }
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueGetter: (params) => {
        try {
          const date = new Date(params);
          return date.toLocaleDateString("en-GB");
        } catch (error) {
          console.error("Date parsing error:", error);
          return "N/A";
        }
      },
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 150,
      valueGetter: (params) => {
        try {
          const date = new Date(params);
          return date.toLocaleDateString("en-GB");
        } catch (error) {
          console.error("Date parsing error:", error);
          return "N/A";
        }
      },
    },
    {
      field: "deletedAt",
      headerName: "Deleted At",
      width: 150,
      valueGetter: (params) => {
        if (params == null || params === '') {
          return '';  // Return empty string for null or empty values
        }

        try {
          const date = new Date(params);
          return !isNaN(date.getTime())
            ? date.toLocaleDateString("en-GB")
            : '';
        } catch (error) {
          console.error("Date parsing error:", error);
          return '';
        }
      },
    },
  ];
  return (
    <>
      <ToastContainer />
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h3 className="m-0">Admins Dashboard</h3>
          <CButton
            color="primary"
            variant="outline"
            onClick={redirectToBrandAdd}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Add Admin
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div style={{ height: 'calc(100vh - 250px)', width: '100%' }}>
            <DataTable
              channel={person}
              columns={columns}
              totalDocs={totalDocs}
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
            />
          </div>
        </CCardBody>
      </CCard>
    </>
  );
};

export default ViewBrand;
