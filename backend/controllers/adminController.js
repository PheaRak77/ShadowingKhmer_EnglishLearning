import { AdminModel } from '../models/adminModel.js';
import { UserModel } from '../models/userModel.js';
import { LessonModel } from '../models/lessonModel.js';

export const AdminController = {
  // GET /api/admin/overview
  async getDashboardOverview(req, res) {
    try {
      const [stats, users, lessons] = await Promise.all([
        AdminModel.getPlatformStats(),
        AdminModel.getAllUsersWithActivity(),
        AdminModel.getAllLessonsWithCreator(),
      ]);

      return res.json({
        stats,
        users,
        lessons,
      });
    } catch (err) {
      console.error('Admin overview error:', err);
      return res.status(500).json({ error: 'Failed to load admin dashboard data.' });
    }
  },

  // PATCH /api/admin/users/:id/role
  async updateUserRole(req, res) {
    try {
      const targetUserId = parseInt(req.params.id, 10);
      const { role } = req.body;

      if (!['student', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role must be either "student" or "admin".' });
      }

      const updatedUser = await UserModel.updateRole(targetUserId, role);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({ user: updatedUser });
    } catch (err) {
      console.error('Admin update role error:', err);
      return res.status(500).json({ error: 'Failed to update user role.' });
    }
  },

  // DELETE /api/admin/users/:id
  async deleteUser(req, res) {
    try {
      const targetUserId = parseInt(req.params.id, 10);
      if (targetUserId === req.user.id) {
        return res.status(400).json({ error: 'You cannot delete your own active admin account.' });
      }

      const deleted = await UserModel.deleteById(targetUserId);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({ deletedUserId: deleted.id });
    } catch (err) {
      console.error('Admin delete user error:', err);
      return res.status(500).json({ error: 'Failed to delete user.' });
    }
  },

  // DELETE /api/admin/lessons/:id
  async deleteLesson(req, res) {
    try {
      const lessonId = parseInt(req.params.id, 10);
      const deleted = await LessonModel.deleteById(lessonId, req.user.id, true);
      if (!deleted) {
        return res.status(404).json({ error: 'Lesson not found.' });
      }

      return res.json({ deletedLessonId: deleted.id });
    } catch (err) {
      console.error('Admin delete lesson error:', err);
      return res.status(500).json({ error: 'Failed to delete lesson.' });
    }
  },
};
