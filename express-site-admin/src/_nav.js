import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilApps,
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
]

export default _nav
