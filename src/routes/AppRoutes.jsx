import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminLogin from '../pages/auth/AdminLogin';

// Dashboard & Core Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import Notifications from '../pages/notifications/Notifications';
import AiAssistant from '../pages/ai/AiAssistant';

// Project Pages (ADMIN, PROJECT_MANAGER)
import Projects from '../pages/projects/Projects';
import ProjectDetails from '../pages/projects/ProjectDetails';

// Project Members (ADMIN, PROJECT_MANAGER)
import ProjectMembers from '../pages/projectMembers/ProjectMembers';

// Tasks Pages (All roles)
import Tasks from '../pages/tasks/Tasks';
import TaskDetails from '../pages/tasks/TaskDetails';

// Task Assignments (ADMIN, PROJECT_MANAGER)
import TaskAssignments from '../pages/taskAssignments/TaskAssignments';

// Bugs Pages (All roles)
import Bugs from '../pages/bugs/Bugs';
import BugDetails from '../pages/bugs/BugDetails';

// Documentation Pages (All roles)
import Documentation from '../pages/documentation/Documentation';
import DocumentationDetails from '../pages/documentation/DocumentationDetails';

// Activity Logs (ADMIN, PROJECT_MANAGER)
import ActivityLogs from '../pages/activity/ActivityLogs';

// Users (ADMIN)
import Users from '../pages/users/Users';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminLogin />} />

      {/* Protected SaaS App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="ai" element={<AiAssistant />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Task Management (All roles) */}
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetails />} />

        {/* Bug Management (All roles) */}
        <Route path="bugs" element={<Bugs />} />
        <Route path="bugs/:id" element={<BugDetails />} />

        {/* Documentation (All roles) */}
        <Route path="documentation" element={<Documentation />} />
        <Route path="documentation/:id" element={<DocumentationDetails />} />

        {/* Project Management (ADMIN & PROJECT_MANAGER) */}
        <Route
          path="projects"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />

        {/* Project Members (ADMIN & PROJECT_MANAGER) */}
        <Route
          path="project-members"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
              <ProjectMembers />
            </ProtectedRoute>
          }
        />

        {/* Task Assignments (ADMIN & PROJECT_MANAGER) */}
        <Route
          path="task-assignments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
              <TaskAssignments />
            </ProtectedRoute>
          }
        />

        {/* Activity Logs (ADMIN & PROJECT_MANAGER) */}
        <Route
          path="activity-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
              <ActivityLogs />
            </ProtectedRoute>
          }
        />

        {/* User Administration (ADMIN only) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
