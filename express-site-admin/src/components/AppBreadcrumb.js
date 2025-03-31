import React from 'react'
import { useLocation } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

// Function to check if a route matches (handles dynamic parameters)
const matchPath = (pathname, routePath) => {
  const routeSegments = routePath.split('/')
  const pathnameSegments = pathname.split('/')

  if (routeSegments.length !== pathnameSegments.length) return false

  return routeSegments.every((segment, i) => segment.startsWith(':') || segment === pathnameSegments[i])
}

// Get route name or "This {previous static name}" for dynamic segments
const getRouteName = (pathname, routes, prevStaticName) => {
  const currentRoute = routes.find((route) => matchPath(pathname, route.path))

  if (currentRoute) return currentRoute.name

  // If it's a dynamic segment (e.g., an ID), return "This {previousStaticName}"
  if (pathname.match(/\/[a-zA-Z0-9-_]+$/)) {
    return prevStaticName ? `This ${prevStaticName}` : 'This Item'
  }

  return false
}

const getBreadcrumbs = (location) => {
  const breadcrumbs = []
  const pathSegments = location.split('/')
  let prevStaticName = ''
  let prevPath = ''

  pathSegments.reduce((prev, curr, index, array) => {
    const currentPathname = `${prev}/${curr}`
    const routeName = getRouteName(currentPathname, routes, prevStaticName)

    if (routeName) {
      let breadcrumbPath = currentPathname

      // **Updated condition:**
      // If the current segment is a dynamic ID (not a static route), modify its path to `/edit`
      const isDynamicId = curr.match(/^[a-zA-Z0-9-_]+$/) && !routes.some(route => route.path.endsWith(curr))
      if (isDynamicId && prevStaticName) {
        breadcrumbPath = `${currentPathname}/edit`
      }

      breadcrumbs.push({
        pathname: breadcrumbPath,
        name: routeName,
        active: index + 1 === array.length,
      })

      // Store last static name (not dynamic ID)
      if (!isDynamicId) prevStaticName = routeName.replace('This ', '')

      prevPath = breadcrumbPath // Store the last breadcrumb path for "This {Item}"
    }

    return currentPathname
  })

  return breadcrumbs
}

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => (
        <CBreadcrumbItem
          {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
          key={index}
        >
          {breadcrumb.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
