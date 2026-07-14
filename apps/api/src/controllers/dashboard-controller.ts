import type { Request, Response } from 'express';
import { ProjectModel } from '../models/project.js';
import { TaskModel } from '../models/task.js';
import { ActivityLogModel } from '../models/activity-log.js';
import { respond } from '../utils/api.js';
export const dashboard = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const projects = await ProjectModel.find({
    $or: [{ owner: userId }, { members: userId }],
    archivedAt: null,
  })
    .sort({ updatedAt: -1 })
    .limit(6);
  const projectIds = projects.map((project) => project.id);
  const completedAgg = await TaskModel.aggregate([
    { $match: { project: { $in: projects.map((p) => p._id) }, status: 'done' } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  const completedTotal = completedAgg.length > 0 ? completedAgg[0].count : 0;
  const [assignedTasks, activity] = await Promise.all([
    TaskModel.find({ assignee: userId, status: { $ne: 'done' } })
      .populate('project', 'name key')
      .sort({ dueDate: 1 })
      .limit(8),
    ActivityLogModel.find({ project: { $in: projectIds } })
      .populate('actor', 'name avatarUrl')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);
  return respond(res, 200, 'Dashboard retrieved', {
    statistics: {
      projects: projects.length,
      assignedTasks: assignedTasks.length,
      completedTasks: completedTotal,
    },
    projects,
    assignedTasks,
    activity,
  });
};
