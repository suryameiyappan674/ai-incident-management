const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const IncidentAssignment = require('../models/IncidentAssignment');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

/* ------------------------------------------------------------------ */
/*  Helper — resolve incident by INC-XXXX or MongoDB ObjectId          */
/* ------------------------------------------------------------------ */
const findIncident = (id) =>
  Incident.findOne({
    $or: [
      { incidentId: id },
      ...(id.match(/^[a-f\d]{24}$/i) ? [{ _id: id }] : [])
    ]
  });

/* ================================================================== */
/*  INCIDENT ROUTES                                                     */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  POST /api/v1/incidents — Create a new incident                     */
/* ------------------------------------------------------------------ */
router.post('/', authenticateJWT, async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description || !priority) {
      return res.status(400).json({
        message: 'title, description, and priority are required fields.'
      });
    }

    const incident = new Incident({
      title,
      description,
      priority,
      createdBy: req.user._id  // taken from the authenticated JWT user
    });

    await incident.save();

    const populated = await Incident
      .findById(incident._id)
      .populate('createdBy', 'username email');

    return res.status(201).json({
      message: 'Incident created successfully',
      statusCode: 201,
      data: populated
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/v1/incidents — List all incidents                         */
/* ------------------------------------------------------------------ */
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { priority, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    // Role-based filtering: admins see all incidents; non-admins see only assigned incidents OR incidents they created
    if (req.user.role && req.user.role.name == 'engineer') {
      const assignments = await IncidentAssignment.find({ assignee: req.user._id }).select('incident');
      const incidentIds = assignments.map(a => a.incident);

      // They can see incidents assigned to them OR incidents they created
      filter.$or = [
        { _id: { $in: incidentIds } },
        { createdBy: req.user._id }
      ];
    } else if (req.user.role && req.user.role.name == 'user') {
      filter.$or = [
        { createdBy: req.user._id }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [rawIncidents, total, openCount, progressCount, resolvedCount, closedCount] = await Promise.all([
      Incident.find(filter)
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Incident.countDocuments(filter),
      Incident.countDocuments({ ...filter, status: 'Pending' }),
      Incident.countDocuments({ ...filter, status: 'In Progress' }),
      Incident.countDocuments({ ...filter, status: 'Resolved' }),
      Incident.countDocuments({ ...filter, status: 'Closed' })
    ]);

    // Fetch assignment data for these incidents
    const incidentIdsList = rawIncidents.map(inc => inc._id);
    const assignments = await IncidentAssignment.find({ incident: { $in: incidentIdsList }, status: 'Active' })
      .populate('assignee', 'username email')
      .lean();

    const incidents = rawIncidents.map(inc => {
      const incAssignments = assignments.filter(a => a.incident.toString() === inc._id.toString());
      return {
        ...inc,
        assignees: incAssignments.map(a => a.assignee)
      };
    });

    return res.json({
      message: 'Incidents fetched successfully',
      statusCode: 200,
      data: {
        total,
        page: Number(page),
        limit: Number(limit),
        incidents,
        stats: {
          total,
          pending: openCount,
          inProgress: progressCount,
          resolved: resolvedCount + closedCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/v1/incidents/my-assignments — List incidents assigned to me */
/* ------------------------------------------------------------------ */
router.get('/my-assignments', authenticateJWT, async (req, res, next) => {
  try {
    const { priority, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    // Find all assignments for the currently logged-in user
    const assignments = await IncidentAssignment.find({ assignee: req.user._id }).select('incident');
    const incidentIds = assignments.map(a => a.incident);
    filter._id = { $in: incidentIds };

    const skip = (Number(page) - 1) * Number(limit);

    const [rawIncidents, total, openCount, progressCount, resolvedCount, closedCount] = await Promise.all([
      Incident.find(filter)
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Incident.countDocuments(filter),
      Incident.countDocuments({ ...filter, status: 'Pending' }),
      Incident.countDocuments({ ...filter, status: 'In Progress' }),
      Incident.countDocuments({ ...filter, status: 'Resolved' }),
      Incident.countDocuments({ ...filter, status: 'Closed' })
    ]);

    // Fetch assignment data for these incidents
    const incidentIdsList = rawIncidents.map(inc => inc._id);
    const assignmentData = await IncidentAssignment.find({ incident: { $in: incidentIdsList }, status: 'Active' })
      .populate('assignee', 'username email')
      .lean();

    const incidents = rawIncidents.map(inc => {
      const incAssignments = assignmentData.filter(a => a.incident.toString() === inc._id.toString());
      return {
        ...inc,
        assignees: incAssignments.map(a => a.assignee)
      };
    });

    return res.json({
      message: 'Assigned incidents fetched successfully',
      statusCode: 200,
      data: {
        total,
        page: Number(page),
        limit: Number(limit),
        incidents,
        stats: {
          total,
          pending: openCount,
          inProgress: progressCount,
          resolved: resolvedCount + closedCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/v1/incidents/:id — Get single incident with assignments   */
/* ------------------------------------------------------------------ */
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const incident = await findIncident(req.params.id)
      .populate('createdBy', 'username email');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const assignments = await IncidentAssignment
      .find({ incident: incident._id })
      .populate('assignee', 'username email')
      .populate('assignedBy', 'username email');

    return res.json({
      message: 'Incident fetched successfully',
      statusCode: 200,
      data: { ...incident.toObject(), assignments }
    });
  } catch (error) {
    next(error);
  }
});

/* ================================================================== */
/*  ASSIGNMENT ROUTES  /api/v1/incidents/:id/assignments              */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  POST /:id/assignments — Assign a user to an incident              */
/*  Body: { assigneeId, note? }                                        */
/* ------------------------------------------------------------------ */
router.post('/:id/assignments', authenticateJWT, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { assigneeId, note } = req.body;

    if (!assigneeId) {
      return res.status(400).json({ message: 'assigneeId is required.' });
    }

    // Resolve incident
    const incident = await findIncident(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Create assignment — compound unique index will reject duplicates
    const assignment = new IncidentAssignment({
      incident: incident._id,
      assignee: assigneeId,
      assignedBy: req.user._id,
      note: note || ''
    });

    await assignment.save();

    const populated = await IncidentAssignment
      .findById(assignment._id)
      .populate('assignee', 'username email')
      .populate('assignedBy', 'username email')
      .populate('incident', 'incidentId title');

    return res.status(201).json({
      message: 'User assigned to incident successfully',
      statusCode: 201,
      data: populated
    });
  } catch (error) {
    // Duplicate key — user already assigned
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This user is already assigned to the incident.'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  GET /:id/assignments — List all assignees for an incident         */
/* ------------------------------------------------------------------ */
router.get('/:id/assignments', authenticateJWT, async (req, res, next) => {
  try {
    const incident = await findIncident(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const assignments = await IncidentAssignment
      .find({ incident: incident._id })
      .populate('assignee', 'username email')
      .populate('assignedBy', 'username email')
      .sort({ assignedAt: -1 });

    return res.json({
      message: 'Assignments fetched successfully',
      statusCode: 200,
      data: {
        incidentId: incident.incidentId,
        total: assignments.length,
        assignments
      }
    });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /:id/assignments/:assignmentId — Remove an assignment       */
/* ------------------------------------------------------------------ */
router.delete('/:id/assignments/:assignmentId', authenticateJWT, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const incident = await findIncident(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const assignment = await IncidentAssignment.findOneAndDelete({
      _id: req.params.assignmentId,
      incident: incident._id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    return res.json({
      message: 'Assignment removed successfully',
      statusCode: 200,
      data: { removedAssignmentId: assignment._id }
    });
  } catch (error) {
    next(error);
  }
});
router.patch('/:id/status',
  authenticateJWT,
  async (req, res, next) => {

    try {

      const { status } = req.body;


      const incident = await findIncident(req.params.id);


      if (!incident) {

        return res.status(404).json({
          message: "Incident not found"
        });

      }


      incident.status = status;

      await incident.save();


      res.json({

        message: "Status updated successfully",
        statusCode: 200,
        data: incident

      });


    }
    catch (error) {

      next(error);

    }

  });

module.exports = router;
