import React, { useState, useEffect } from "react";
import {
  CButton,
  CForm,
  CFormInput,
  CRow,
  CCol,
  CFormFeedback,
  CCard,
  CCardHeader,
  CCardBody,
} from "@coreui/react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AddEditSocialLinks = () => {
  const { channelId, profileId, socialLinkId } = useParams();
  const navigate = useNavigate();
  const url = import.meta.env.VITE_USERS_API_URL;
  const [isEdit, setIsEdit] = useState(false);

  const [socialLinks, setSocialLinks] = useState([
    { platform: "", description: "", url: "", logo: null, logoUrl: "", errors: {} },
  ]);

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", description: "", url: "", logo: null, errors: {} }]);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (socialLinkId) {
      getSocialLinks();
    }
  }, [socialLinkId]);

  const getSocialLinks = async () => {
    try {
      const params = channelId ? { moduleType: "channelSocialLink", moduleId: channelId, socialLinkId } : { moduleType: "profileSocialLink", moduleId: profileId, socialLinkId };
      const response = await axios.post(
        `${url}/admin/module/details`,
        params,
        { headers: { Authorization: `Bearer token` } }
      );

      const data = response.data.data;
      setSocialLinks([
        {
          platform: data.platform || "",
          description: data.description || "",
          url: data.url || "",
          logo: null,
          logoUrl: data.logo || "", // Store logo URL if available
          errors: {},
        },
      ]);
      setIsEdit(true);
    } catch (error) {
      console.error("Error fetching social link:", error);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index][field] = value;
    updatedLinks[index].errors[field] = "";
    setSocialLinks(updatedLinks);
  };

  const handleFileChange = (index, file) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index].logo = file;
    updatedLinks[index].logoUrl = URL.createObjectURL(file); // Show preview of new upload
    setSocialLinks(updatedLinks);
  };

  const validateLinks = () => {
    let isValid = true;
    const updatedLinks = socialLinks.map((link) => {
      const errors = {};
      if (!link.platform.trim()) errors.platform = "Platform is required.";
      if (!link.description.trim()) errors.description = "Description is required.";
      if (!link.url.trim()) {
        errors.url = "URL is required.";
      } else if (!/^https?:\/\/[\w.-]+(\.[\w\.-]+)+\/?/.test(link.url)) {
        errors.url = "Enter a valid URL.";
      }
      if (Object.keys(errors).length > 0) isValid = false;
      return { ...link, errors };
    });
    setSocialLinks(updatedLinks);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLinks()) return;

    const formData = new FormData();
    if (isEdit) {
      const link = socialLinks[0];

      formData.append("platform", link.platform);
      formData.append("url", link.url);
      formData.append("description", link.description);
      if (link.logo) formData.append("logo", link.logo);
    } else {
      socialLinks.forEach((link, index) => {
        formData.append(`socialLinks[${index}][platform]`, link.platform);
        formData.append(`socialLinks[${index}][url]`, link.url);
        formData.append(`socialLinks[${index}][description]`, link.description);
        if (link.logo) formData.append(`socialLinks[${index}][logo]`, link.logo);
      });
    }
    if (channelId) {
      formData.append("channelId", channelId);
    } else {
      formData.append("profileId", profileId);
    }

    try {
      if (isEdit) {
        formData.append("socialLinkId", socialLinkId);
        const apiUrl = channelId ? `${url}/admin/edit-channel-social-link` : `${url}/admin/edit-profile-social-link`;
        await axios.post(apiUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const apiUrl = channelId ? `${url}/admin/add-channel-social-links` : `${url}/admin/add-profile-social-links`;
        await axios.post(apiUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      const redirectUrl = profileId ? `/profiles/${profileId}/social-links` : `/channel/${channelId}/social-links`;
      navigate(redirectUrl, { state: { message: "Social links updated successfully!" } });
    } catch (error) {
      console.error("Error saving social links:", error);
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h4 className="m-0">{isEdit ? "Edit" : "Add"} Social Link</h4>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          {socialLinks.map((link, index) => (
            <CRow key={index} className="mb-3">
              <CCol xs={12} className="mb-2">
                <CFormInput
                  type="text"
                  placeholder="Platform (e.g., Facebook)"
                  value={link.platform}
                  onChange={(e) => handleChange(index, "platform", e.target.value)}
                  invalid={!!link.errors.platform}
                />
                <CFormFeedback invalid>{link.errors.platform}</CFormFeedback>
              </CCol>
              <CCol xs={12} className="mb-2">
                <CFormInput
                  type="text"
                  placeholder="Description"
                  value={link.description}
                  onChange={(e) => handleChange(index, "description", e.target.value)}
                  invalid={!!link.errors.description}
                />
                <CFormFeedback invalid>{link.errors.description}</CFormFeedback>
              </CCol>
              <CCol xs={12} className="mb-2">
                <CFormInput
                  type="url"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => handleChange(index, "url", e.target.value)}
                  invalid={!!link.errors.url}
                />
                <CFormFeedback invalid>{link.errors.url}</CFormFeedback>
              </CCol>

              {/* Logo Preview Section */}
              <CCol xs={12} className="mb-2">
                {link.logoUrl && (
                  <div className="mb-2">
                    <img
                      src={link.logoUrl}
                      alt="Logo Preview"
                      style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "cover", borderRadius: "5px" }}
                    />
                  </div>
                )}
                <CFormInput type="file" accept="image/*" onChange={(e) => handleFileChange(index, e.target.files[0])} />
              </CCol>

              {!isEdit && (
                <CCol xs={12} className="d-flex justify-content-between">
                  <CButton type="button" color="danger" variant="outline" size="sm" onClick={() => removeSocialLink(index)} disabled={socialLinks.length === 1}>Remove</CButton>
                  {index === socialLinks.length - 1 && (
                    <CButton type="button" color="secondary" variant="outline" size="sm" onClick={addSocialLink}>+ Add more</CButton>
                  )}
                </CCol>
              )}
            </CRow>
          ))}
          <CCol xs={1} className="d-grid mt-3">
            <CButton type="submit" color="primary">
              {isEdit ? "Update" : "Submit"}
            </CButton>
          </CCol>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default AddEditSocialLinks;
