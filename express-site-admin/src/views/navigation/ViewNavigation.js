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

const ViewNavigation = () => {
  const { channelId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  // Pagination state
  const [channel, setChannel] = useState([]);
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
    const getChannel = async () => {
      try {
        const token = "";
        const response = await fetch(
          `${url}/admin/navigation?channelId=${channelId}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`,
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
          const formattedData = json.data.map((item) => ({
            ...item,
            id: item._id,
          }));

          setChannel(formattedData);
          setTotalDocs(json.data.totalDocs);
        }
      } catch (error) {
        console.error("Error fetching navigation:", error);
      }
    };

    getChannel();
  }, [paginationModel]);

  const handleEdit = (item) => {
    navigate(`/channel/${channelId}/navigation/${item._id}/edit`, { state: { itemData: item } });
  };

  const redirectToBrandAdd = () => {
    navigate(`/channel/${channelId}/navigation/add`);
  };

  const handleView = (item) => {
    navigate(`/channel/${channelId}/navigation/${item._id}/view`, { state: { itemData: item } });
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
      field: "view",
      headerName: "View Navigation Chart",
      width: 120,
      renderCell: (params) => (
        <CButton
          color="primary"
          variant="outline"
          size="sm"
          onClick={() => handleView(params.row)}
        >
          View
        </CButton>
      ),
    },
    {
      field: "_id",
      headerName: "Name",
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => {
        return `L${params} Navigation`;
      }
    }
  ];

  return (
    <>
      <ToastContainer />
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h3 className="m-0">Navigation Dashboard</h3>
          <CButton
            color="primary"
            variant="outline"
            onClick={redirectToBrandAdd}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Add Navigation
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div style={{ height: 'calc(100vh - 250px)', width: '100%' }}>
            <DataTable
              channel={channel}
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

export default ViewNavigation;