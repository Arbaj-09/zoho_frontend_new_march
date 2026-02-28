'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { backendApi } from '@/services/api';
import { ArrowLeft, Users, Building2, User, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { getCurrentUserName, getCurrentUserRole } from '@/utils/userUtils';

export default function AllTeamsHierarchy() {
  const router = useRouter();
  
  // ✅ FIXED: Get dynamic user data
  const userName = getCurrentUserName();
  const userRole = getCurrentUserRole();
  
  const [teams, setTeams] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllTeamsHierarchy();
  }, []);

  const fetchAllTeamsHierarchy = async () => {
    try {
      setLoading(true);
      
      // Get all teams to build hierarchy
      const allTeams = await backendApi.get('/teams');
      console.log('All teams for hierarchy:', allTeams);
      
      // Build hierarchy tree function
      const buildHierarchy = (teams, parentId = null) => {
        return teams
          .filter(team => {
            if (parentId === null) {
              // Root teams - no parent
              return !team.parentTeamId;
            }
            return team.parentTeamId === parentId;
          })
          .map(team => ({
            ...team,
            children: buildHierarchy(teams, team.id)
          }));
      };
      
      // Find the root teams and build the full hierarchy
      const rootTeams = allTeams.filter(team => !team.parentTeamId);
      const hierarchyTree = rootTeams.map(rootTeam => ({
        ...rootTeam,
        children: buildHierarchy(allTeams, rootTeam.id)
      }));
      
      console.log('Hierarchy tree built:', hierarchyTree);
      setHierarchy(hierarchyTree);
      setTeams(allTeams);
    } catch (err) {
      setError('Failed to load team hierarchy');
      console.error('Error fetching hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allNodeIds = [];
    const collectIds = (nodes) => {
      nodes.forEach(node => {
        allNodeIds.push(node.id);
        if (node.children && node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(hierarchy);
    setExpandedNodes(new Set(allNodeIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderTeamNode = (team, level = 0) => {
    const hasChildren = team.children && team.children.length > 0;
    const isExpanded = expandedNodes.has(team.id);
    
    return (
      <div key={team.id} className="select-none">
        <div 
          className={`flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
            level > 0 ? 'border-l-2 border-gray-200' : ''
          }`}
          style={{ marginLeft: `${level * 32}px` }}
          onClick={() => hasChildren && toggleNode(team.id)}
        >
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{team.name}</h4>
              {team.parentTeamName && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Child of {team.parentTeamName}
                </span>
              )}
              {!team.parentTeamId && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  Root Team
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {team.description || 'No description'}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Lead: {team.teamLeadName || 'No Lead'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{team.memberCount || 0} members</span>
              </div>
              {team.parentTeamId && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>Parent ID: {team.parentTeamId}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              team.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {team.isActive ? 'Active' : 'Inactive'}
            </span>
            {hasChildren && (
              <span className="text-xs text-gray-500">
                {isExpanded ? `${team.children.length} sub-teams expanded` : `${team.children.length} sub-teams`}
              </span>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {team.children.map(child => renderTeamNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout
        header={{
          project: "Organization Management",
          user: { name: "Admin User", role: "Administrator" },
          notifications: [],
          tabs: [
            { key: "employees", label: "Employees", href: "/organization" },
            { key: "admins", label: "Admins", href: "/admins" },
            { key: "roles", label: "Roles", href: "/roles" },
            { key: "designation", label: "Designation", href: "/designation" },
            { key: "teams", label: "Teams", href: "/teams" },
          ],
          activeTabKey: "teams"
        }}
      >
        <div className="p-6 bg-[#f8fafc] min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading team hierarchy...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && teams.length === 0) {
    return (
      <DashboardLayout
        header={{
          project: "Organization Management",
          user: { name: "Admin User", role: "Administrator" },
          notifications: [],
          tabs: [
            { key: "employees", label: "Employees", href: "/organization" },
            { key: "admins", label: "Admins", href: "/admins" },
            { key: "roles", label: "Roles", href: "/roles" },
            { key: "designation", label: "Designation", href: "/designation" },
            { key: "teams", label: "Teams", href: "/teams" },
          ],
          activeTabKey: "teams"
        }}
      >
        <div className="p-6 bg-[#f8fafc] min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      header={{
        project: "Team Management",
        user: { name: userName, role: userRole },
        notifications: [],
        tabs: [
          { key: "employees", label: "Employees", href: "/organization" },
          { key: "admins", label: "Admins", href: "/admins" },
          { key: "roles", label: "Roles", href: "/roles" },
          { key: "designation", label: "Designation", href: "/designation" },
          { key: "teams", label: "Teams", href: "/teams" },
        ],
        activeTabKey: "teams"
      }}
    >
      <div className="p-6 bg-[#f8fafc] min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/teams')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Complete Team Hierarchy</h1>
                <p className="text-sm text-gray-500">View all teams and their parent-child relationships</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">Total Teams</div>
                <div className="text-2xl font-bold text-blue-900">{teams.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Root Teams</div>
                <div className="text-2xl font-bold text-green-900">{teams.filter(t => !t.parentTeamId).length}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm font-medium">Sub-Teams</div>
                <div className="text-2xl font-bold text-purple-900">{teams.filter(t => t.parentTeamId).length}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-orange-600 text-sm font-medium">Total Members</div>
                <div className="text-2xl font-bold text-orange-900">{teams.reduce((sum, t) => sum + (t.memberCount || 0), 0)}</div>
              </div>
            </div>
          </div>

          {/* Hierarchy Tree */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Structure</h3>
            
            {hierarchy.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No teams found in hierarchy</p>
                <p className="text-sm">Create teams to build your organization structure</p>
              </div>
            ) : (
              <div className="space-y-4">
                {hierarchy.map(rootTeam => (
                  <div key={rootTeam.id} className="border border-gray-200 rounded-lg bg-white">
                    <div className="p-4">
                      {renderTeamNode(rootTeam, 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
