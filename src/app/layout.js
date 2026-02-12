import "./globals.css";
import WebSocketProvider from "../components/WebSocketProvider";
import ToastProvider from "../components/common/ToastProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Use local system fonts instead of Google Fonts
const geistSans = {
  className: "font-sans"
};

const geistMono = {
  className: "font-mono"
};

export const metadata = {
  title: "Attendance & Workforce Dashboard",
  description: "Enterprise-style Attendance & Workforce Management Dashboard UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased bg-slate-50 text-slate-900`}
      >
        <WebSocketProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WebSocketProvider>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
