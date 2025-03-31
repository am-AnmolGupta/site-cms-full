import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilPlus } from "@coreui/icons";
import { getCookie } from '../../Helper/cookieHelper';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton
} from "@coreui/react";
import DataTable from "../../components/DataTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewBrand = () => {
  const url = import.meta.env.VITE_USERS_API_URL;
  const [person, setPerson] = useState([]);
  const navigate = useNavigate(); // Use useNavigate hook for programmatic navigation

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const [totalDocs, setTotalDocs] = useState(0);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [location]);

  useEffect(() => {
    const getBrand = async () => {
      try {
        const token = getCookie('authToken=');
        const response = await fetch(`${url}/admin/roles`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
        });
        const json = await response.json();
        if (json.status_code === 403) {
          navigate("/403");
        }
        else {
          const formattedData = json.data.docs.map((item) => ({
            ...item,
            id: item._id,
          }));

          setPerson(formattedData);
          setTotalDocs(json.data.totalDocs);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    getBrand();
    // eslint-disable-next-line
  }, []);
  const handleEdit = (item) => {
    navigate(`/roles/${item._id}/edit`, { state: { itemData: item } }); // Pass person object
  };

  const redirectToBrandAdd = () => {
    navigate("/roles/add");
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
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 120,
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
          <h3 className="m-0">Role Dashboard</h3>
          <CButton
            color="primary"
            variant="outline"
            onClick={redirectToBrandAdd}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Add Role
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
