import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/orgs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/orgs/"!</div>
}
