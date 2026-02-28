"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

import Button from "@/components/ui/Button";

import RealtimeStatusCard from "@/components/dashboard/RealtimeStatusCard";

import StaffingStrengthCard from "@/components/dashboard/StaffingStrengthCard";

import TeamwiseAttendance from "@/components/dashboard/TeamwiseAttendance";

import EmployeesTable from "@/components/dashboard/EmployeesTable";

import OffDutyEmployees from "@/components/dashboard/OffDutyEmployees";

import StatCard from "@/components/dashboard/StatCard";

import { getDashboardOverview } from "@/services/dashboard.service";
import { departmentStatsService } from "@/services/departmentStats.service";
import { useEffect, useState } from "react";
import { getCurrentUserName, getCurrentUserRole } from "@/utils/userUtils";
import { getAuthUser } from "@/utils/authUser";
import DepartmentStatsCard from "@/components/dashboard/DepartmentStatsCard";
import DepartmentPieChart from "@/components/charts/DepartmentPieChart";
import { 
  UsersIcon, 
  CubeIcon, 
  CheckCircleIcon, 
  BanknotesIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';



function DownloadIcon({ className }) {

  return (

    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">

      <path

        d="M12 3v10m0 0 4-4m-4 4-4-4"

        className="stroke-current"

        strokeWidth="1.5"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

      <path

        d="M4 17v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2"

        className="stroke-current"

        strokeWidth="1.5"

        strokeLinecap="round"

      />

    </svg>

  );

}


function PauseIcon({ className }) {

  return (

    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">

      <path d="M8 7v10M16 7v10" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />

      <path

        d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z"

        className="stroke-current"

        strokeWidth="1.5"

        opacity="0.25"

      />

    </svg>

  );

}


export default function Home() {

  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [departmentStats, setDepartmentStats] = useState(null);

  // Get dynamic user data
  const userName = getCurrentUserName();
  const userRole = getCurrentUserRole();
  const currentUser = getAuthUser();

  // 🔥 REAL DEPARTMENT-WISE STATS FOR TL
  const fetchDepartmentStats = async () => {
    if (!currentUser?.department) return;
    
    try {
      console.log('Fetching REAL department stats for:', currentUser.department);
      
      // Fetch real department-wise data
      const stats = await departmentStatsService.getDepartmentStats(currentUser.department);
      
      console.log('Real department stats received:', stats);
      setDepartmentStats(stats);
      
    } catch (error) {
      console.error('Failed to fetch department stats:', error);
      // Show error state to user
      setDepartmentStats({
        error: true,
        message: 'Failed to load department statistics'
      });
    }
  };

  useEffect(() => {
    if (loaded) return;

    // 🔥 DEPARTMENT-WISE DASHBOARD FOR TL
    if (currentUser?.role === "TL" && currentUser?.department) {
      console.log('Fetching TL dashboard for department:', currentUser.department);
      fetchDepartmentStats();
    }

    getDashboardOverview()
      .then((result) => {
        // Override user data with dynamic values
        setData({
          ...result,
          user: {
            name: userName,
            role: userRole,
            department: currentUser?.department || null
          }
        });
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, [loaded, userName, userRole, currentUser]);

  return (
    <>
      {!data ? (
        <div className="p-6 text-slate-500">Loading dashboard…</div>
      ) : (
        <DashboardLayout

      navigation={data.navigation}

      header={{

        project: data.project,

        user: data.user,

        notifications: data.notifications,

        tabs: data.headerTabs?.items || [],

        activeTabKey: data.headerTabs?.activeTabKey,

      }}

    >

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>

          <div className="text-lg font-semibold text-slate-900">
            {currentUser?.role === "TL" && currentUser?.department 
              ? `${currentUser.department} Department Dashboard` 
              : 'Realtime Dashboard'
            }
          </div>

          <div className="mt-1 text-sm text-slate-500">
            {currentUser?.role === "TL" && currentUser?.department 
              ? `Overview for ${currentUser.department} department` 
              : 'Overview of punch activity and staffing'
            }
          </div>

        </div>



        <Button className="rounded-xl">

          <DownloadIcon className="h-5 w-5" />

          Attendance Status

        </Button>

      </div>



      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">

        {currentUser?.role === "TL" && currentUser?.department && departmentStats ? (
          // 🎯 PROFESSIONAL TL DEPARTMENT-WISE DASHBOARD
          <>
            {/* Department Stats Cards */}
            <div className="xl:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DepartmentStatsCard
                  title="Total Customers"
                  value={departmentStats.customers.department}
                  total={departmentStats.customers.total}
                  percentage={departmentStats.customers.percentage}
                  icon={UsersIcon}
                />
                <DepartmentStatsCard
                  title="Total Products"
                  value={departmentStats.products.department}
                  total={departmentStats.products.total}
                  percentage={departmentStats.products.percentage}
                  icon={CubeIcon}
                />
                <DepartmentStatsCard
                  title="Total Tasks"
                  value={departmentStats.tasks.department}
                  total={departmentStats.tasks.total}
                  percentage={departmentStats.tasks.percentage}
                  icon={CheckCircleIcon}
                />
                <DepartmentStatsCard
                  title="Bank Records"
                  value={departmentStats.bank.department}
                  total={departmentStats.bank.total}
                  percentage={departmentStats.bank.percentage}
                  icon={BanknotesIcon}
                />
              </div>
            </div>

            {/* Pie Charts */}
            <div className="xl:col-span-4">
              <div className="space-y-4">
                <DepartmentPieChart
                  data={departmentStats.customers}
                  title="Customers Distribution"
                  department={currentUser.department}
                />
                <DepartmentPieChart
                  data={departmentStats.tasks}
                  title="Tasks Distribution"
                  department={currentUser.department}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="xl:col-span-12">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Recent Activity - {currentUser.department} Department
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {departmentStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-gray-400">by {activity.user}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Breakdown */}
            <div className="xl:col-span-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Breakdown - {currentUser.department}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-2xl font-bold text-green-700">{departmentStats.tasks.completed}</p>
                    <p className="text-sm text-green-600">Completed Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-2xl font-bold text-yellow-700">{departmentStats.tasks.pending}</p>
                    <p className="text-sm text-yellow-600">Pending Tasks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Summary */}
            <div className="xl:col-span-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Summary - {currentUser.department}</h3>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">
                    ${departmentStats.bank.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600">Total Transaction Amount</p>
                </div>
              </div>
            </div>
          </>
        ) : departmentStats?.error ? (
          // Error state
          <div className="xl:col-span-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium">{departmentStats.message}</p>
              <button 
                onClick={fetchDepartmentStats}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          // 🏢 ADMIN/MANAGER DASHBOARD (original content)
          <>
            <div className="xl:col-span-4">

              <RealtimeStatusCard data={data.realtimeStatus} />

            </div>



            <div className="xl:col-span-3">

              <div className="grid grid-cols-1 gap-5">

                <StatCard

                  title="Punched In (Inactive)"

                  value={data.realtimeStatus?.punchedInInactive ?? 0}

                  subtitle="Employees who are punched in but marked inactive"

                  accent="amber"

                  icon={<PauseIcon className="h-6 w-6" />}

                />



                <StaffingStrengthCard staffingStrength={data.staffingStrength} />

              </div>

            </div>



            <div className="xl:col-span-5">

              <TeamwiseAttendance items={data.teamwiseAttendance} />

            </div>
          </>
        )}

      </div>



      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">

        {currentUser?.role !== "TL" && (
          <div className="xl:col-span-8">

            <EmployeesTable employees={data.employees} />

          </div>
        )}

        {currentUser?.role !== "TL" && (
          <div className="xl:col-span-4">

            <OffDutyEmployees employees={data.offDutyEmployees} />

          </div>
        )}

      </div>



      {currentUser?.role !== "TL" && (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <StatCard

            title="Total Employees"

            value={data.realtimeStatus?.totalEmployees ?? 0}

            subtitle="Total mapped employees"

            accent="sky"

            icon={<UsersIcon className="h-6 w-6" />}

          />

          <StatCard

            title="Punched In"

            value={data.realtimeStatus?.punchedIn ?? 0}

            subtitle="Currently inside"

            accent="emerald"

            icon={<UsersIcon className="h-6 w-6" />}

          />

          <StatCard

            title="Punched Out"

            value={data.realtimeStatus?.punchedOut ?? 0}

            subtitle="Currently outside"

            accent="rose"

            icon={<UsersIcon className="h-6 w-6" />}

          />

        </div>
      )}
    </DashboardLayout>
      )}
    </>
  );
}
