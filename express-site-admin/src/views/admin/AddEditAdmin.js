import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { CCard, CCardHeader, CCardBody, CButton, CForm } from "@coreui/react";
import { getCookie } from "../../Helper/cookieHelper";
import Select from "react-select";

const AddEditAdmin = () => {
  const { adminId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [inputFields, setInputFields] = useState({
    adminId: null,
    name: "",
    email: "",
    image: null,
    imagePreview: "",
    roles: [],
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const handleRoleChange = (selectedOption, actionMeta) => {
    if (actionMeta && actionMeta.name === "roles") {
      setInputFields({ ...inputFields, roles: selectedOption });
    }
  };
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

  const getAdmin = async () => {
    if (!adminId) return;

    try {
      const response = await axios.post(
        `${url}/admin/module/details`,
        { moduleType: "admin", moduleId: adminId },
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setInputFields({
        adminId: data._id,
        name: data.name,
        image: null,
        imagePreview: data.image
          ? `${import.meta.env.VITE_IMAGE_URL}${data.image}`
          : null,
        email: data.email,
        roles: data.roles.map((role) => ({ value: role, label: role })),
        status: data.deletedAt ? "inactive" : "active",
      });

      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching admin:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = getCookie('authToken=');
      const response = await fetch(`${url}/admin/roles?pagination=false`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });
      const json = await response.json();
      setRoles(json.data.map((role) => ({ value: role._id, label: role.role })));
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };

  const addAdmin = async () => {
    try {
      const formData = new FormData();
      Object.entries(inputFields).forEach(([key, value]) => {
        if (!key.includes("Preview")) {
          // For file inputs, ensure null values don't cause errors
          if (key === "image") {
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
        `${url}/admin/add-edit-admin`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setMessage("Admin added successfully! 🎉");
        navigate("/admins", {
          state: {
            message: isEdit
              ? "Admin updated successfully!"
              : "Admin added successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      addAdmin();
    }
  };

  const validateValues = (values) => {
    const errors = {};
    if (!values.name) errors.name = "Name is required.";
    if (!values.email) errors.email = "Email is required.";
    if (values.roles.length === 0) errors.roles = "Role is required.";
    return errors;
  };

  useEffect(() => {
    if (adminId) getAdmin();
  }, [adminId]);
  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">{isEdit ? "Edit Admin" : "Add Admin"}</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={inputFields.name}
              onChange={handleChange}
            />
            {errors.name && (
              <span className="text-danger">{errors.name}</span>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={inputFields.email}
              onChange={handleChange}
            />
            {errors.email && <span className="text-danger">{errors.email}</span>}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Image
            </label>
            {inputFields.imagePreview && (
              <img
                src={inputFields.imagePreview}
                alt="Image Preview"
                className="d-block mb-2"
                height="50"
              />
            )}
            <input
              type="file"
              className="form-control"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
            {errors.image && (
              <span className="text-danger">{errors.image}</span>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="roles" className="form-label">
              Roles <span className="text-danger">*</span>
            </label>
            <Select
              isMulti
              id="roles"
              name="roles"
              options={roles}
              className="basic-multi-select"
              classNamePrefix="select"
              value={inputFields.roles}
              onChange={handleRoleChange}
            />
            {errors.roles && (
              <span className="error text-danger">{errors.roles}</span>
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

export default AddEditAdmin;
