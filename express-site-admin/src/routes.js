import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Channel = React.lazy(() => import('./views/channel/ViewChannel'))
const AddEditChannel = React.lazy(() => import('./views/channel/AddEditChannel'))

const SocialLinks = React.lazy(() => import('./views/social-links/ViewSocialLinks'))
const AddEditSocialLinks = React.lazy(() => import('./views/social-links/AddEditSocialLinks'))

const Profiles = React.lazy(() => import('./views/profiles/ViewProfiles'))
const AddEditProfile = React.lazy(() => import('./views/profiles/AddEditProfile'))

const Users = React.lazy(() => import('./views/user/ViewUsers'))
const EditUser = React.lazy(() => import('./views/user/EditUser'))

const ViewAdmin = React.lazy(() => import("./views/admin/ViewAdmin.js"));
const AddEditAdmin = React.lazy(() => import("./views/admin/AddEditAdmin.js"));

const ViewRole = React.lazy(() => import("./views/roles/ViewRole"));
const AddEditRole = React.lazy(() => import("./views/roles/AddEditRole.js"));

const Log = React.lazy(() => import("./views/pages/log/Log.js"));

const Leads = React.lazy(() => import("./views/leads/Leads.js"));
const EditLead = React.lazy(() => import("./views/leads/EditLead.js"));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  // Channel routes
  { path: '/channel', name: 'Channel', element: Channel },
  { path: '/channel/add', name: 'Add Channel', element: AddEditChannel },
  { path: '/channel/:channelId/edit', name: 'Edit Channel', element: AddEditChannel },
  { path: '/channel/:channelId/social-links', name: 'Social Links', element: SocialLinks },
  { path: '/channel/:channelId/social-links/add', name: 'Add Social Link', element: AddEditSocialLinks },
  { path: '/channel/:channelId/social-links/:socialLinkId/edit', name: 'Edit Social Link', element: AddEditSocialLinks },


  // Leads routes
  { path: "/channel/:channelId/leads", name: "Leads", element: Leads },
  { path: "/channel/:channelId/leads/:leadId/edit", name: "View Lead", element: EditLead },

  // Profile routes
  { path: '/profiles', name: 'Profiles', element: Profiles },
  { path: '/profiles/add', name: 'Add Profile', element: AddEditProfile },
  { path: '/profiles/:profileId/edit', name: 'Edit Profile', element: AddEditProfile },
  { path: '/profiles/:profileId/social-links', name: 'Socail Links', element: SocialLinks },
  { path: '/profiles/:profileId/social-links/add', name: 'Add Socail Link', element: AddEditSocialLinks },
  { path: '/profiles/:profileId/social-links/:socialLinkId/edit', name: 'Edit Socail Link', element: AddEditSocialLinks },

  // User routes
  { path: "/users", name: "Users", element: Users },
  { path: "/users/:userId/edit", name: "Edit User", element: EditUser },

  // Log routes
  { path: "/log", name: "Log", element: Log },

  // Admin routes
  { path: "/admins", name: "Admins", element: ViewAdmin },
  { path: "/admins/add", name: "Add", element: AddEditAdmin },
  { path: "/admins/:adminId/edit", name: "Edit", element: AddEditAdmin },

  // Role routes
  { path: "/roles", name: "Role", element: ViewRole },
  { path: "/roles/add", name: "Add", element: AddEditRole },
  { path: "/roles/:roleId/edit", name: "Edit", element: AddEditRole },
]

export default routes
