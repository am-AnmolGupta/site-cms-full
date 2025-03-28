import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilApps,
  cilInstitution,
  cilBadge,
  cilUserFollow,
  cilSpreadsheet,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Channel',
    to: '/channel',
    icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Profiles',
    to: '/profiles',
    icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
  },
  { component: CNavItem, name: "Admins", to: "/users", icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" /> },
  { component: CNavItem, name: "Roles", to: "/roles", icon: <CIcon icon={cilBadge} customClassName="nav-icon" /> },
  {
    component: CNavGroup,
    name: 'Logs',
    to: '/logs',
    icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
    items: [
      { component: CNavItem, name: 'Access Log', to: '/log?type=access' },
      { component: CNavItem, name: 'Query Log', to: '/log?type=query' },
      { component: CNavItem, name: 'Application Log', to: '/log?type=error' }
    ]
  }
]

export default _nav
