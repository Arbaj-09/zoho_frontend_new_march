'use client';

import { useState, useEffect } from 'react';
import { backendApi } from '@/services/api';

export default function TeamHierarchyTree({ teamId }) {
  const [teams, setTeams] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [teamMembers, setTeamMembers] = useState({});

  useEffect(() => {
    fetchHierarchy();
  }, [teamId]);

  const fetchTeamMembers = async (teamId) => {
    try {
      const members = await backendApi.get(`/teams/${teamId}/members`);
      return members || [];
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      return [];
    }
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      
      // Get all teams to build hierarchy
      const allTeams = await backendApi.get('/teams');
      const allEmployees = await backendApi.get('/employees');
      
      // Find the root team (either the specified team or its root parent)
      const findRootTeam = (teams, targetId) => {
        const targetTeam = teams.find(t => t.id === targetId);
        if (!targetTeam || !targetTeam.parentTeamId) {
          return targetTeam;
        }
        return findRootTeam(teams, targetTeam.parentTeamId);
      };
      
      const rootTeam = findRootTeam(allTeams, parseInt(teamId));
      
      if (!rootTeam) {
        setError('Team not found');
        return;
      }
      
      // Build complete hierarchy tree
      const buildHierarchy = (teams, parentId = null) => {
        return teams
          .filter(team => {
            if (parentId === null) {
              return !team.parentTeamId;
            }
            return team.parentTeamId === parentId;
          })
          .map(team => ({
            ...team,
            children: buildHierarchy(teams, team.id)
          }));
      };
      
      const fullHierarchy = buildHierarchy(allTeams, null);
      const targetHierarchy = fullHierarchy.find(tree => {
        // Check if this tree contains the target team
        const containsTarget = (node) => {
          if (node.id === parseInt(teamId)) return true;
          if (node.children) {
            return node.children.some(containsTarget);
          }
          return false;
        };
        return containsTarget(tree);
      });
      
      setHierarchy(targetHierarchy || fullHierarchy[0]);
      setTeams(allTeams);
      
      // Create members data from existing team data
      const membersData = {};
      for (const team of allTeams) {
        if (team.memberIds && team.memberIds.length > 0) {
          const teamMemberEmployees = allEmployees.filter(emp => 
            team.memberIds.includes(emp.id)
          );
          membersData[team.id] = teamMemberEmployees;
        }
      }
      setTeamMembers(membersData);
    } catch (err) {
      setError('Failed to load hierarchy');
      console.error('Error fetching hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeam = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const renderTreeNode = (node, x, y, level = 0, parentX = null, parentY = null) => {
    const nodeWidth = 240; // Consistent width for all nodes
    const nodeHeight = 100; // Consistent height for all nodes
    const horizontalSpacing = 320; // Much more horizontal spacing
    const verticalSpacing = 180; // Much more vertical spacing
    
    const isRoot = level === 0;
    const hasChildren = node.children && node.children.length > 0;
    const hasMembers = teamMembers[node.id] && teamMembers[node.id].length > 0;
    const isExpanded = expandedTeams.has(node.id);
    
    // Calculate positions for children with much better spacing
    const childrenPositions = [];
    if (hasChildren) {
      const totalWidth = node.children.length * horizontalSpacing;
      const startX = x - totalWidth / 2 + horizontalSpacing / 2;
      
      node.children.forEach((child, index) => {
        childrenPositions.push({
          x: startX + index * horizontalSpacing,
          y: y + verticalSpacing,
          node: child
        });
      });
    }
    
    return (
      <g key={node.id}>
        {/* Much cleaner connection lines */}
        {hasChildren && childrenPositions.map((child) => (
          <g key={`line-${node.id}-${child.node.id}`}>
            {/* Clean single line from parent to child */}
            <line
              x1={x}
              y1={y + nodeHeight / 2}
              x2={child.x}
              y2={child.y - nodeHeight / 2}
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </g>
        ))}
        
        {/* Connection line from parent if not root */}
        {parentX !== null && (
          <g key={`parent-line-${node.id}`}>
            <line
              x1={parentX}
              y1={parentY + nodeHeight / 2}
              x2={x}
              y2={y - nodeHeight / 2}
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </g>
        )}
        
        {/* Clickable area for expanding/collapsing */}
        <g
          onClick={() => (hasChildren || hasMembers) && toggleTeam(node.id)}
          style={{ cursor: (hasChildren || hasMembers) ? 'pointer' : 'default' }}
        >
          {/* Clean, professional node styling */}
          <g>
            <rect
              x={x - nodeWidth / 2}
              y={y - nodeHeight / 2}
              width={nodeWidth}
              height={nodeHeight}
              rx="12"
              fill={isRoot ? "#4F46E5" : "#3B82F6"}
              stroke={isRoot ? "#4338CA" : "#2563EB"}
              strokeWidth="2"
              className="hover:opacity-90 transition-opacity"
            />
            
            {/* Clean white background for content */}
            <rect
              x={x - nodeWidth / 2 + 10}
              y={y - nodeHeight / 2 + 10}
              width={nodeWidth - 20}
              height={nodeHeight - 20}
              rx="8"
              fill="white"
              opacity="0.95"
            />
            
            {/* Team name */}
            <text
              x={x}
              y={y - 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#1F2937"
              fontSize="16"
              fontWeight="700"
              className="select-none"
            >
              {node.name}
            </text>
            
            {/* Team lead */}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6B7280"
              fontSize="13"
              fontWeight="500"
              className="select-none"
            >
              👤 {node.teamLeadName || 'No Lead'}
            </text>
            
            {/* Member count */}
            <text
              x={x}
              y={y + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6B7280"
              fontSize="13"
              fontWeight="500"
              className="select-none"
            >
              👥 {node.memberCount || 0} members
            </text>
            
            {/* Expand/Collapse indicator */}
            {(hasChildren || hasMembers) && (
              <text
                x={x}
                y={y + 35}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#3B82F6"
                fontSize="12"
                fontWeight="600"
                className="select-none"
              >
                {isExpanded ? '▼' : '▶'} {hasChildren ? node.children.length : teamMembers[node.id]?.length || 0} {hasChildren ? (node.children.length === 1 ? 'sub-team' : 'sub-teams') : (teamMembers[node.id]?.length === 1 ? 'member' : 'members')}
              </text>
            )}
          </g>
        </g>
        
        {/* Render expanded members with clean styling */}
        {isExpanded && hasMembers && (
          <g>
            {teamMembers[node.id].map((member, index) => (
              <g key={`member-${member.id}`}>
                <rect
                  x={x - 90}
                  y={y + 60 + index * 35}
                  width="180"
                  height="30"
                  rx="15"
                  fill="#F8FAFC"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                />
                <text
                  x={x}
                  y={y + 75 + index * 35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#475569"
                  fontSize="12"
                  fontWeight="500"
                >
                  👤 {member.firstName} {member.lastName}
                </text>
              </g>
            ))}
          </g>
        )}
        
        {/* Render children with proper spacing */}
        {hasChildren && childrenPositions.map(child => 
          renderTreeNode(child.node, child.x, child.y, level + 1, x, y)
        )}
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading hierarchy...</div>
      </div>
    );
  }

  if (error || !hierarchy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error || 'No hierarchy data available'}</div>
      </div>
    );
  }

  // Calculate SVG dimensions for the complete tree
  const calculateTreeDimensions = (node, level = 0) => {
    const horizontalSpacing = 320;
    const verticalSpacing = 180;
    const isExpanded = expandedTeams.has(node.id);
    const memberHeight = teamMembers[node.id] ? teamMembers[node.id].length * 35 : 0;
    
    if (!node.children || node.children.length === 0) {
      return { 
        width: 240, 
        height: 100 + (isExpanded ? 70 + memberHeight : 0)
      };
    }
    
    const childrenDimensions = node.children.map(child => 
      calculateTreeDimensions(child, level + 1)
    );
    
    const totalWidth = childrenDimensions.reduce((sum, dim) => sum + dim.width, 0);
    const maxHeight = Math.max(...childrenDimensions.map(dim => dim.height));
    const totalHeight = verticalSpacing + maxHeight + (isExpanded ? 70 + memberHeight : 0);
    
    return { 
      width: Math.max(totalWidth, 240), 
      height: totalHeight 
    };
  };

  const dimensions = calculateTreeDimensions(hierarchy);
  const svgWidth = Math.max(dimensions.width + 400, 1400);
  const svgHeight = Math.max(dimensions.height + 300, 1000);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          💡 <strong>Professional Tree:</strong> Click on any team node to expand/collapse and see member names
        </p>
      </div>
      
      <svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {/* Define gradients and filters */}
        <defs>
          <linearGradient id="rootGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <radialGradient id="childGradient">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </radialGradient>
          <filter id="rootShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15"/>
          </filter>
          <filter id="childShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.12"/>
          </filter>
        </defs>
        
        {/* Render the hierarchy tree */}
        {renderTreeNode(hierarchy, svgWidth / 2, 80)}
      </svg>
      
      {/* Enhanced legend */}
      <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-14 h-8 bg-indigo-600 border-2 border-indigo-700 rounded-lg"></div>
          <span className="font-medium">Root Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-14 h-8 bg-blue-600 border-2 border-blue-700 rounded-lg"></div>
          <span className="font-medium">Sub-Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-slate-300 border-t-2 border-dashed"></div>
          <span className="font-medium">Hierarchy Connection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-6 bg-gray-50 border border-gray-200 rounded-full"></div>
          <span className="font-medium">Team Members</span>
        </div>
      </div>
    </div>
  );
}
