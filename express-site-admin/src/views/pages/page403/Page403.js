import React from 'react'
import {
  CCol,
  CContainer,
  CRow,
} from '@coreui/react'

const Page403 = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <div className="clearfix">
              <h1 className="float-start display-3 me-4">403</h1>
              <h4 className="pt-3">Access Forbidden!</h4>
              <p className="text-medium-emphasis float-start">
                You do not have permission to view this page.
              </p>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page403
