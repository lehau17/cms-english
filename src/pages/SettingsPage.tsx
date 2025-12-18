import HolidayManagement from "@/components/settings/HolidayManagement";
import SystemConfiguration from "@/components/settings/SystemConfiguration";
import React from "react";

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your preferences and application options.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h2>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Compact sidebar</p>
              <p className="text-sm text-gray-500">Collapse the sidebar to save space</p>
            </div>
            <button
              onClick={() => {
                const current = localStorage.getItem("cms_sidebar") === "collapsed";
                const next = current ? "expanded" : "collapsed";
                localStorage.setItem("cms_sidebar", next);
                try { window.dispatchEvent(new Event("cms:sidebar-toggle")); } catch { }
              }}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              Toggle Sidebar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Account</h2>
          <p className="text-sm text-gray-600">More account settings will appear here.</p>
        </div>

        <SystemConfiguration />
        <HolidayManagement />
      </div>
    </div>
  );
};

export default SettingsPage;

