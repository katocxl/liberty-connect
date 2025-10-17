export interface ModerationReport {
  id: string;
  orgId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
}
