import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import BoardCreator3 from './BoardCreator3';

const router = createBrowserRouter([
  {
    path: "/BoardCreator",
    element: <BoardCreator3 />,
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


serviceWorkerRegistration.register({
  onUpdate: registration => {
    alert('New version available!  Ready to update?');
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    //delay reloading page immediately after notifying SW to skip waiting
    //hopefully prevents the white page problem
    setTimeout(() => {
      window.location.reload();
    }, 1000)
  }
})