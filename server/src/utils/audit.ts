import prisma from './prisma';

export interface AuditParams {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  module: string;
  recordId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (params: AuditParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        userRole: params.userRole,
        action: params.action,
        module: params.module,
        recordId: params.recordId,
        details: typeof params.details === 'object' ? JSON.stringify(params.details) : params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
