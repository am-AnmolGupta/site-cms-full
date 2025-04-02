import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { cilCompass, cilShare, cilAddressBook, cilMenu, cilNotes } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CCard, CCardHeader, CCardBody, CButton, CForm, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from "@coreui/react";

const AddEditChannel = () => {
  const { channelId } = useParams();
  const url = import.meta.env.VITE_USERS_API_URL;
  const navigate = useNavigate();

  const [inputFields, setInputFields] = useState({
    channelId: null,
    title: "",
    slug: "",
    logoUnit: null,
    logoUnitPreview: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    seoImage: null,
    seoImagePreview: "",
    seoKeywords: "",
    cmsChannelId: "",
    ga: "",
    comScore: "",
    status: "active",
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

  const getChannel = async () => {
    if (!channelId) return;

    try {
      const response = await axios.post(
        `${url}/admin/module/details`,
        { moduleType: "channel", moduleId: channelId },
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setInputFields({
        channelId: data._id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        cmsChannelId: data.cmsChannelId,
        ga: data.ga,
        comScore: data.comScore,
        logoUnit: null,
        logoUnitPreview: data.logoUnit
          ? `${import.meta.env.VITE_IMAGE_URL}${data.logoUnit}`
          : null,
        seoImage: null,
        seoImagePreview: data.seoImage
          ? `${import.meta.env.VITE_IMAGE_URL}${data.seoImage}`
          : null,
        status: data.deletedAt ? "inactive" : "active",
      });

      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching channel:", error);
    }
  };

  const addEditChannel = async () => {
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
        `${url}/admin/add-edit-channel`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setMessage("Channel added successfully! 🎉");
        navigate("/channel", {
          state: {
            message: isEdit
              ? "Channel updated successfully!"
              : "Channel added successfully!",
          },
        });
      }
    } catch (error) {
      console.error("Error adding channel:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateValues(inputFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      addEditChannel();
    }
  };

  const validateValues = (values) => {
    const errors = {};
    if (!values.title) errors.title = "Title is required.";
    if (!values.slug) errors.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
      errors.slug = "Invalid slug format.";
    }
    if (!values.logoUnit && !values.logoUnitPreview) {
      errors.logoUnit = "Logo is required.";
    }
    return errors;
  };

  useEffect(() => {
    if (channelId) getChannel();
  }, [channelId]);

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="m-0">{isEdit ? "Edit Channel" : "Add Channel"}</h4>
        {isEdit && (
          <div className="ms-auto d-flex gap-2">
            {/* First two buttons */}
            <CButton color="success" variant="outline" component="a" href={`/channel/${channelId}/navigation`}>
              <CIcon icon={cilCompass} className="me-2" />
              Navigation
            </CButton>
            <CButton color="info" variant="outline" component="a" href={`/channel/${channelId}/social-links`}>
              <CIcon icon={cilShare} className="me-2" />
              Social Links
            </CButton>

            {/* Dropdown for remaining buttons */}
            <CDropdown>
              <CDropdownToggle color="secondary" variant="outline">
                <CIcon icon={cilMenu} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem href={`/channel/${channelId}/leads`}>
                  <CIcon icon={cilAddressBook} className="me-2" />
                  Leads
                </CDropdownItem>
                <CDropdownItem href={`/channel/${channelId}/static-pages`}>
                  <CIcon icon={cilNotes} className="me-2" />
                  Static Pages
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
        )}
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={inputFields.title}
              onChange={handleChange}
            />
            {errors.title && (
              <span className="text-danger">{errors.title}</span>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">
              Slug <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="slug"
              value={inputFields.slug}
              onChange={handleChange}
            />
            {errors.slug && <span className="text-danger">{errors.slug}</span>}
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={inputFields.description}
              onChange={handleChange}
              rows="4"
            ></textarea>
            <small>Suggested Word Limit: 160 Characters</small>
          </div>

          <div className="mb-3">
            <label className="form-label">CMS Channel Id</label>
            <input
              type="text"
              className="form-control"
              name="cmsChannelId"
              value={inputFields.cmsChannelId}
              onChange={handleChange}
            />
            {errors.cmsChannelId && (
              <span className="text-danger">{errors.cmsChannelId}</span>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">
              Logo <span className="text-danger">*</span>
            </label>
            {inputFields.logoUnitPreview && (
              <img
                src={inputFields.logoUnitPreview}
                alt="Logo Preview"
                className="d-block mb-2"
                height="50"
              />
            )}
            <input
              type="file"
              className="form-control"
              name="logoUnit"
              onChange={handleChange}
              accept="image/*"
            />
            {errors.logoUnit && (
              <span className="text-danger">{errors.logoUnit}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="seoTitle" className="form-label">
              Seo Title
            </label>
            <input
              type="text"
              className="form-control"
              id="seoTitle"
              name="seoTitle"
              value={inputFields.seoTitle}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="seoDescription" className="form-label">
              Seo Description
            </label>
            <textarea
              className="form-control"
              id="seoDescription"
              name="seoDescription"
              value={inputFields.seoDescription}
              onChange={handleChange}
              rows={4}
            ></textarea>
            <p>
              <small>Suggested Word Limit: 160 Characters</small>
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label">SEO Image</label>
            {inputFields.seoImagePreview && (
              <img
                src={inputFields.seoImagePreview}
                alt="SEO Image Preview"
                className="d-block mb-2"
                height="50"
              />
            )}
            <input
              type="file"
              className="form-control"
              name="seoImage"
              onChange={handleChange}
              accept="image/*"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="seoKeywords" className="form-label">
              Seo Keywords
            </label>
            <input
              type="text"
              className="form-control"
              id="seoKeywords"
              name="seoKeywords"
              value={inputFields.seoKeywords}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="ga" className="form-label">
              GA Tracking Id
            </label>
            <input
              type="text"
              className="form-control"
              id="ga"
              name="ga"
              value={inputFields.ga}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="comScore" className="form-label">
              ComScore
            </label>
            <input
              type="text"
              className="form-control"
              id="comScore"
              name="comScore"
              value={inputFields.comScore}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={inputFields.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default AddEditChannel;
