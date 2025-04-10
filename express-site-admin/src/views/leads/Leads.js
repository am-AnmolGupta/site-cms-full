import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { cilPlus } from "@coreui/icons";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton
} from "@coreui/react";
import DataTable from "../../components/DataTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewLeads = () => {
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();
  const { channelId } = useParams();

  // Pagination state
  const [leads, setLeads] = useState([]);
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
    const getLeads = async () => {
      try {
        const token = "";
        const response = await fetch(
          `${url}/admin/leads?channelId=${channelId}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await response.json();
        if (json.status_code === 403) {
          navigate("/403");
        } else {
          const formattedData = json.data.docs.map((item) => ({
            ...item,
            id: item._id,
          }));

          setLeads(formattedData);
          setTotalDocs(json.data.totalDocs);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    getLeads();
  }, [paginationModel]);

  const handleEdit = (item) => {
    navigate(`/channel/${channelId}/leads/${item._id}/edit`, { state: { itemData: item } });
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
          View
        </CButton>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 80,
      renderCell: (params) => {
        const firstName = params.row?.firstName || "";
        const lastName = params.row?.lastName || "";
        return `${firstName} ${lastName}`.trim();
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "mobile",
      headerName: "Mobile",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "campaignName",
      headerName: "Campaign Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "message",
      headerName: "Message",
      flex: 1,
      minWidth: 250,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 100,
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
  ];

  return (
    <>
      <ToastContainer />
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h3 className="m-0">Leads Dashboard</h3>
        </CCardHeader>
        <CCardBody>
          <div style={{ height: 'calc(100vh - 250px)', width: '100%' }}>
            <DataTable
              channel={leads}
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

export default ViewLeads;