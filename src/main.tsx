import { render } from "preact"
import { Suspense } from "preact/compat"
import { BrowserRouter as Router, useRoutes } from "react-router-dom"
import "@unocss/reset/tailwind.css"
import "virtual:uno.css"
import routes from "~react-pages"

const App = () => {
  return (
    <Suspense fallback={<div class="h-screen w-full flex items-center justify-center"><span class="loading loading-spinner loading-lg"></span></div>}>
      {useRoutes(routes)}
    </Suspense>
  )
}

render(
  <Router>
    <App />
  </Router>,
  document.getElementById("app")!
)
