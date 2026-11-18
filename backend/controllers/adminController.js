import { AdminModel } from '../models/adminModel.js';
import { UserModel } from '../models/userModel.js';
import { LessonModel } from '../models/lessonModel.js';
import { LimitModel } from '../models/limitModel.js';

export const AdminController = {
  // GET /api/admin/overview
  async getDashboardOverview(req, res) {
    try {
      const [stats, rawUsers, lessons, studentLimit] = await Promise.all([
        AdminModel.getPlatformStats(),
        AdminModel.getAllUsersWithActivity(),
        AdminModel.getAllLessonsWithCreator(),
        LimitModel.getGlobalStudentLimit(),
      ]);

      const users = await Promise.all(
        rawUsers.map(async (u) => ({
          ...u,
          quota: await LimitModel.getUserQuotaStatus(u.id, u.role),
        }))
      );

      return res.json({
        stats,
        users,
        lessons,
        studentLimit,
      });
    } catch (err) {
      console.error('Admin overview error:', err);
      return res.status(500).json({ error: 'Failed to load admin dashboard data.' });
    }
  },

  // PATCH /api/admin/settings/student-limit
  async updateStudentLimit(req, res) {
    try {
      const maxLessons = parseInt(req.body?.maxLessons, 10);
      const windowDays = parseInt(req.body?.windowDays, 10);

      if (Number.isNaN(maxLessons) || maxLessons < 1 || maxLessons > 100) {
        return res.status(400).json({ error: 'Max videos must be between 1 and 100.' });
      }
      if (Number.isNaN(windowDays) || windowDays < 1 || windowDays > 365) {
        return res.status(400).json({ error: 'Days window must be between 1 and 365.' });
      }

      const studentLimit = await LimitModel.updateGlobalStudentLimit(maxLessons, windowDays);
      const rawUsers = await AdminModel.getAllUsersWithActivity();
      const users = await Promise.all(
        rawUsers.map(async (u) => ({
          ...u,
          quota: await LimitModel.getUserQuotaStatus(u.id, u.role),
        }))
      );

      return res.json({ studentLimit, users });
    } catch (err) {
      console.error('Admin update student limit error:', err);
      return res.status(500).json({ error: 'Failed to update student limit.' });
    }
  },

  // PATCH /api/admin/users/:id/limit
  async updateUserLimit(req, res) {
    try {
      const targetUserId = parseInt(req.params.id, 10);
      if (Number.isNaN(targetUserId)) {
        return res.status(400).json({ error: 'Invalid user ID.' });
      }

      const targetUser = await UserModel.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (req.body?.resetQuota) {
        await LimitModel.resetUserUsage(targetUserId);
      }

      if ('customLimitMax' in req.body || 'customLimitDays' in req.body) {
        await LimitModel.updateUserCustomLimit(
          targetUserId,
          req.body.customLimitMax,
          req.body.customLimitDays
        );
      }

      const quota = await LimitModel.getUserQuotaStatus(targetUser.id, targetUser.role);
      return res.json({
        user: {
          ...targetUser,
          quota,
        },
      });
    } catch (err) {
      console.error('Admin update user limit error:', err);
      return res.status(500).json({ error: 'Failed to update student limit.' });
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
