import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cilCompass, cilShare } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CCard, CCardHeader, CCardBody, CButton, CForm } from "@coreui/react";

const AddEditRole = () => {
  const { roleId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  const [inputFields, setInputFields] = useState({
    roleId: null,
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      setInputFields((prevFields) => ({
        ...prevFields,
        [name]: file, // Store file for submission
        [`${name}Preview`]: URL.createObjectURL(file), // Preview URL
      }));
    } else {
      setInputFields((prevFields) => ({ ...prevFields, [name]: value }));
    }
  };

  const getRole = async () => {
    if (!roleId) return;

    try {
      const response = await axios.post(
        `${url}/admin/module/details`,
        { moduleType: "role", moduleId: roleId },
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setInputFields({
        roleId: data._id,
        role: data.role,
      });

      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };

  const addEditRole = async () => {
    try {
      const formData = new FormData();
      Object.entries(inputFields).forEach(([key, value]) => {
        if (!key.includes("Preview")) {
          // For file inputs, ensure null values don't cause errors
          if (key === "logoUnit" || key === "seoImage") {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, "");
            }
          } else {
            formData.append(key, value ?? "");
          }
        }
      });

      var response = await axios.post(
        `${url}/admin/add-edit-role`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setMessage("Role added successfully! 🎉");
        navigate("/roles", {
          state: {
            message: isEdit
              ? "Role updated successfully!"
              : "Role added successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      addEditRole();
    }
  };

  const validateValues = (values) => {
    const errors = {};
    if (!values.role) errors.role = "Role is required.";
    return errors;
  };

  useEffect(() => {
    if (roleId) getRole();
  }, [roleId]);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">{isEdit ? "Edit Role" : "Add Role"}</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Role Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="role"
              value={inputFields.role}
              onChange={handleChange}
            />
            {errors.role && (
              <span className="text-danger">{errors.role}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default AddEditRole;
