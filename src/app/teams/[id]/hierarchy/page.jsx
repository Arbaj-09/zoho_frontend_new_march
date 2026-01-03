'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter, useParams } from 'next/navigation';
import { backendApi } from '@/services/api';
import { ArrowLeft, Users, Building2, User, ChevronDown, ChevronRight, Search, Eye } from 'lucide-react';
import TeamHierarchyTree from '@/components/TeamHierarchyTree';

export default function TeamHierarchy() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id;
  
  const [team, setTeam] = useState(null);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  useEffect(() => {
    fetchTeamHierarchy();
  }, [teamId]);

  const fetchTeamHierarchy = async () => {
    try {
      setLoading(true);
      console.log('Fetching hierarchy for team ID:', teamId);
      
      // Get all teams to build hierarchy
      const allTeams = await backendApi.get('/teams');
      console.log('All teams received:', allTeams);
      
      // Find the current team
      const currentTeam = allTeams.find(t => t.id === parseInt(teamId));
      console.log('Current team:', currentTeam);
      
      if (!currentTeam) {
        setError('Team not found');
        return;
      }
      
      setTeam(currentTeam);
      
      // Build hierarchy tree starting from the current team
      const buildTeamHierarchy = (teams, parentId) => {
        return teams
          .filter(team => team.parentTeamId === parentId)
          .map(team => ({
            ...team,
            children: buildTeamHierarchy(teams, team.id)
          }));
      };
      
      const teamHierarchy = buildTeamHierarchy(allTeams, parseInt(teamId));
      console.log('Team hierarchy tree:', teamHierarchy);
      
      // Create a tree structure with current team as root
      const hierarchyTree = [{
        ...currentTeam,
        children: teamHierarchy
      }];
      
      console.log('Final hierarchy tree:', hierarchyTree);
      setHierarchy(hierarchyTree);
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

  const renderTeamNode = (team, level = 0) => {
    const hasChildren = team.children && team.children.length > 0;
    const isExpanded = expandedNodes.has(team.id);
    const isLastChild = false; // We'll implement this if needed
    
    return (
      <div key={team.id} className="select-none">
        <div className="flex items-start">
          {/* Tree lines and indentation */}
          <div className="flex items-center" style={{ marginLeft: `${level * 24}px` }}>
            {level > 0 && (
              <div className="w-6 h-6 flex items-center">
                <div className="w-6 h-0.5 bg-gray-300"></div>
                <div className="absolute w-0.5 h-6 bg-gray-300 -ml-0.5"></div>
              </div>
            )}
            
            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <div 
                className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => toggleNode(team.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </div>
            )}
            {!hasChildren && (
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Team Content */}
          <div className="flex-1 ml-4 pb-4">
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Team Icon */}
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              
              {/* Team Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">{team.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    team.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {team.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2 truncate">
                  {team.description || 'No description'}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Lead: {team.teamLeadName || 'No Lead'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{team.memberCount || 0} members</span>
                  </div>
                  {hasChildren && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{team.children.length} sub-teams</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => router.push(`/teams/${team.id}`)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="View Team Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push(`/teams/${team.id}/edit`)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Edit Team"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.793.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Render sub-teams */}
            {hasChildren && isExpanded && (
              <div className="ml-6 mt-2">
                {team.children.map(child => renderTeamNode(child, level + 1))}
              </div>
            )}
          </div>
        </div>
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

  if (error && !team) {
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
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/teams/${teamId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Team Hierarchy</h1>
                <p className="text-sm text-gray-500">{team?.name}</p>
              </div>
            </div>
          </div>

          {/* Main Team Info */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{team?.name}</h2>
                <p className="text-gray-600">{team?.description || 'No description'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Lead: {team?.teamLeadName || 'No Lead'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {team?.memberCount || 0} members
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hierarchy Tree */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Hierarchy Tree</h3>
            
            <TeamHierarchyTree teamId={teamId} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
