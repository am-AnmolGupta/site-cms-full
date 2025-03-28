import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Channel = React.lazy(() => import('./views/channel/ViewChannel'))
const AddEditChannel = React.lazy(() => import('./views/channel/AddEditChannel'))
const SocialLinks = React.lazy(() => import('./views/social-links/ViewSocialLinks'))
const AddEditSocialLinks = React.lazy(() => import('./views/social-links/AddEditSocialLinks'))
const Profiles = React.lazy(() => import('./views/profiles/ViewProfiles'))
const AddEditProfile = React.lazy(() => import('./views/profiles/AddEditProfile'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/channel', name: 'Channel', element: Channel },
  { path: '/channel/add', name: 'Add Channel', element: AddEditChannel },
  { path: '/channel/:channelId/edit', name: 'Edit Channel', element: AddEditChannel },
  { path: '/channel/:channelId/social-links', name: 'Social Links', element: SocialLinks },
  { path: '/channel/:channelId/social-links/add', name: 'Add Social Links', element: AddEditSocialLinks },
  { path: '/channel/:channelId/social-links/:socialLinkId/edit', name: 'Edit Social Links', element: AddEditSocialLinks },
  { path: '/profiles', name: 'Profiles', element: Profiles },
  { path: '/profiles/add', name: 'Add Profile', element: AddEditProfile },
  { path: '/profiles/:profileId/edit', name: 'Edit Profile', element: AddEditProfile },
  { path: '/profiles/:profileId/social-links', name: 'Edit Profile', element: SocialLinks },
  { path: '/profiles/:profileId/social-links/add', name: 'Edit Profile', element: AddEditSocialLinks },
  { path: '/profiles/:profileId/social-links/:socialLinkId/edit', name: 'Edit Profile', element: AddEditSocialLinks },

]

export default routes
