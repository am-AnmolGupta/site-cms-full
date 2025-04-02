import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cilCompass, cilShare } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CCard, CCardHeader, CCardBody, CButton, CForm } from "@coreui/react";

const EditLead = () => {
  const { channelId, leadId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  const [inputFields, setInputFields] = useState({
    leadId: null,
    channelId: null,
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    message: "",
    designation: "",
    company: "",
    industry: "",
    website: "",
    city: "",
    country: "",
    campaignName: "",
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

  const getProfile = async () => {
    if (!leadId) return;

    try {
      const response = await axios.post(
        `${url}/admin/module/details`,
        { moduleType: "lead", moduleId: leadId },
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setInputFields({
        leadId: data._id,
        channelId: data.channelId,
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
        email: data.email,
        message: data.message,
        designation: data.designation,
        company: data.company,
        industry: data.industry,
        website: data.website,
        city: data.city,
        country: data.country,
        campaignName: data.campaignName,
      });

      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching lead:", error);
    }
  };

  const editLead = async () => {
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
        `${url}/admin/add-edit-lead`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setMessage("Lead added successfully! 🎉");
        navigate("/profiles", {
          state: {
            message: isEdit
              ? "Lead updated successfully!"
              : "Lead added successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Error adding lead:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      editLead();
    }
  };

  const validateValues = (values) => {
    const errors = {};
    // if (!values.title) errors.title = "Title is required.";
    // if (!values.slug) errors.slug = "Slug is required.";
    // else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    //   errors.slug = "Invalid slug format.";
    // }
    return errors;
  };

  useEffect(() => {
    if (leadId) getProfile();
  }, [leadId]);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">{isEdit ? "View Lead" : "Add Lead"}</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Campaign Name
            </label>
            <input
              type="text"
              className="form-control"
              name="campaignName"
              value={inputFields.campaignName}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={inputFields.firstName}

            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={inputFields.lastName}

            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Email
            </label>
            <input
              type="text"
              className="form-control"
              name="email"
              value={inputFields.email}

            />
          </div>
          <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea
              className="form-control"
              name="Message"
              value={inputFields.message}

              rows="4"
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="designation" className="form-label">
              Designation
            </label>
            <input
              type="text"
              className="form-control"
              id="designation"
              name="designation"
              value={inputFields.designation}

            />
          </div>

          <div className="mb-3">
            <label htmlFor="company" className="form-label">
              Company
            </label>
            <input
              type="text"
              className="form-control"
              id="company"
              name="company"
              value={inputFields.company}

            />
          </div>
          <div className="mb-3">
            <label htmlFor="industry" className="form-label">
              Industry
            </label>
            <input
              type="text"
              className="form-control"
              id="industry"
              name="industry"
              value={inputFields.industry}

            />
          </div>
          <div className="mb-3">
            <label htmlFor="website" className="form-label">
              Website
            </label>
            <input
              type="text"
              className="form-control"
              id="website"
              name="website"
              value={inputFields.website}

            />
          </div>

          <div className="mb-3">
            <label htmlFor="city" className="form-label">
              City
            </label>
            <input
              type="text"
              className="form-control"
              id="city"
              name="city"
              value={inputFields.city}

            />
          </div>
          <div className="mb-3">
            <label htmlFor="state" className="form-label">
              Country
            </label>
            <input
              type="text"
              className="form-control"
              id="country"
              name="country"
              value={inputFields.country}

            />
          </div>

        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default EditLead;
