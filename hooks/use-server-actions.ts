import { useAction } from 'convex/react';

import { api } from '@/convex/_generated/api';

// =============================================================================
// SERVER ACTION HOOKS
// =============================================================================

// Email hooks
export function useSendOrderConfirmation() {
  return useAction(api.actions.sendOrderConfirmation);
}

export function useSendPasswordResetEmail() {
  return useAction(api.actions.sendPasswordResetEmail);
}

export function useSendWelcomeEmail() {
  return useAction(api.actions.sendWelcomeEmail);
}

export function useSendRoleChangeNotification() {
  return useAction(api.actions.sendRoleChangeNotification);
}

// File storage hooks
export function useUploadImage() {
  return useAction(api.actions.uploadImage);
}

export function useDeleteImage() {
  return useAction(api.actions.deleteImage);
}

// Payment hooks
export function useProcessPayment() {
  return useAction(api.actions.processPayment);
}

export function useVerifyPayment() {
  return useAction(api.actions.verifyPayment);
}

export function useProcessRefund() {
  return useAction(api.actions.processRefund);
}

// Analytics hooks
export function useGenerateAnalyticsReport() {
  return useAction(api.actions.generateAnalyticsReport);
}