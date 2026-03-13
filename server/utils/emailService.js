const nodemailer = require('nodemailer');
const User = require('../models/User');

// --- 1. EMAIL CONFIGURATION ---
const createTransporter = () => {
  // Use a direct createTransport call for better reliability with Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // 16-character App Password (no spaces)
    }
  });
};

// --- 2. EMAIL TEMPLATES ---
const emailTemplates = {
  projectupdate: (projectName, message, recipientName) => ({
    subject: `Project Update: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #667eea;">Hello ${recipientName},</h2>
        <p>There's an update for your project: <strong>${projectName}</strong></p>
        <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea;">
          <p>${message}</p>
        </div>
      </div>`
  }),

  deadlinereminder: (projectName, deadline, recipientName) => ({
    subject: `Deadline Reminder: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #f5576c;">⏰ Deadline Reminder</h2>
        <p>Hello ${recipientName}, the project <strong>${projectName}</strong> has a deadline on <strong>${new Date(deadline).toLocaleDateString()}</strong>.</p>
      </div>`
  }),

  gradenotification: (projectName, grade, feedback, recipientName) => ({
    subject: `Grade Posted: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4facfe;">📊 Grade Posted</h2>
        <p>Your project <strong>${projectName}</strong> has been graded.</p>
        <p><strong>Grade:</strong> <span style="font-size: 20px; color: #4facfe;">${grade}</span></p>
        <p><strong>Feedback:</strong> ${feedback || 'None provided'}</p>
      </div>`
  }),

  taskassignment: (taskTitle, projectName, description, recipientName) => ({
    subject: `New Task: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #fa709a;">📋 New Task Assigned</h2>
        <p>Hello ${recipientName}, you have a new task for <strong>${projectName}</strong>.</p>
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Description:</strong> ${description || 'N/A'}</p>
      </div>`
  }),

  systemnotification: (title, message, recipientName) => ({
    subject: `System: ${title}`,
    html: `<div style="padding: 20px;"><h2>🔔 ${title}</h2><p>${message}</p></div>`
  })
};

// --- 3. SEND EMAIL FUNCTION ---
const sendEmail = async (recipientId, type, data) => {
  try {
    const user = await User.findById(recipientId);
    if (!user) return false;

    // Check profile and email
    const targetEmail = user.personalEmail || user.email;
    if (!user.profileSetupComplete || !targetEmail) {
      console.log(`⚠️ EMAIL SKIPPED: ${user.name} profile incomplete.`);
      return false;
    }

    // Mapping for user preferences
    const preferenceMap = {
      'System': 'systemNotifications',
      'Feedback': 'gradeNotifications',
      'Grade': 'gradeNotifications',
      'Deadline': 'deadlineReminders',
      'Task': 'taskAssignments',
      'taskAssignment': 'taskAssignments',
      'Approval': 'projectUpdates',
      'Rejection': 'projectUpdates'
    };
    
    const prefKey = preferenceMap[type] || 'systemNotifications';
    if (!user.emailPreferences[prefKey]) {
      console.log(`⚠️ User ${user.name} opted out of ${type} emails.`);
      return false;
    }

    // Normalize Template Key
    let templateKey = type.toLowerCase();
    if (templateKey.includes('task')) templateKey = 'taskassignment';
    if (templateKey.includes('system')) templateKey = 'systemnotification';
    if (templateKey.includes('grade') || templateKey.includes('feedback')) templateKey = 'gradenotification';
    if (templateKey.includes('deadline')) templateKey = 'deadlinereminder';
    if (templateKey.includes('approval') || templateKey.includes('rejection') || templateKey.includes('project')) templateKey = 'projectupdate';

    const template = emailTemplates[templateKey];
    if (!template) {
      console.error(`❌ No template found for: ${templateKey}`);
      return false;
    }

    // ✅ FIXED: Template Argument Mapping
    let emailContent;
    if (templateKey === 'taskassignment') {
      emailContent = template(data.taskTitle || data.title || 'New Task', data.projectName || 'N/A', data.description || data.message || '', user.name);
    } else if (templateKey === 'gradenotification') {
      emailContent = template(data.projectName || 'Project', data.grade || 'N/A', data.feedback || '', user.name);
    } else if (templateKey === 'deadlinereminder') {
      emailContent = template(data.projectName || 'Project', data.deadline || Date.now(), user.name);
    } else {
      emailContent = template(data.projectName || data.title || 'System Update', data.message || data.description || '', user.name);
    }

    // Send using Nodemailer
    const transporter = createTransporter();
    const mailOptions = {
      from: `"NEXUS Project Portal" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    await transporter.sendMail(mailOptions);
    
    user.lastEmailSent = new Date();
    await user.save();

    console.log(`🎉 EMAIL SUCCESS: Delivered to ${targetEmail}`);
    return true;

  } catch (error) {
    console.error('❌ EMAIL ERROR:', error.message);
    return false;
  }
};

// --- 4. BULK PROJECT EMAILS ---
const sendProjectEmails = async (projectId, type, data, excludeUser = null) => {
  const Project = require('../models/Project');
  try {
    const project = await Project.findById(projectId).populate('members supervisor');
    if (!project) return 0;

    const recipients = [...(project.members || [])];
    if (project.supervisor) recipients.push(project.supervisor);

    const filteredRecipients = excludeUser 
      ? recipients.filter(r => r._id.toString() !== excludeUser.toString())
      : recipients;

    const promises = filteredRecipients.map(r => sendEmail(r._id, type, data));
    const results = await Promise.allSettled(promises);
    return results.filter(r => r.status === 'fulfilled' && r.value).length;

  } catch (error) {
    console.error('❌ BULK ERROR:', error.message);
    return 0;
  }
};

module.exports = { sendEmail, sendProjectEmails, emailTemplates };