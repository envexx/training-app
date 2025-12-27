/**
 * API Helper Functions for Training Schedule
 * 
 * This file contains helper functions and interfaces for backend integration.
 * Uncomment and implement these functions when connecting to your backend API.
 */

import type { TrainingModule, TrainingModuleAPI } from './DataTrainingPage';

// Re-export types for convenience
export type { TrainingModule, TrainingModuleAPI };

/**
 * Convert TrainingModule to API format
 */
export const moduleToAPI = (module: TrainingModule): TrainingModuleAPI => {
  return {
    id: module.id,
    category: module.category,
    moduleName: module.moduleName,
    durasi: module.durasi,
    classField: module.classField,
    trainer: module.trainer,
    targetTrainee: module.targetTrainee,
    scheduledWeeks: Array.from(module.weeks),
    year: module.year,
    createdAt: module.createdAt,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert API format to TrainingModule
 */
export const apiToModule = (apiData: TrainingModuleAPI): TrainingModule => {
  return {
    id: apiData.id,
    category: apiData.category,
    moduleName: apiData.moduleName,
    durasi: apiData.durasi,
    classField: apiData.classField,
    trainer: apiData.trainer,
    targetTrainee: apiData.targetTrainee,
    weeks: new Set(apiData.scheduledWeeks),
    year: apiData.year,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
  };
};

/**
 * Example API functions (uncomment and implement when backend is ready)
 */

/*
// Fetch all training modules for a year
export const fetchTrainingModules = async (year: number): Promise<TrainingModule[]> => {
  const response = await fetch(`/api/training-modules?year=${year}`);
  const data: TrainingModuleAPI[] = await response.json();
  return data.map(apiToModule);
};

// Save a new training module
export const saveTrainingModule = async (module: TrainingModule): Promise<TrainingModule> => {
  const response = await fetch('/api/training-modules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moduleToAPI(module)),
  });
  const data: TrainingModuleAPI = await response.json();
  return apiToModule(data);
};

// Update an existing training module
export const updateTrainingModule = async (module: TrainingModule): Promise<TrainingModule> => {
  const response = await fetch(`/api/training-modules/${module.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moduleToAPI(module)),
  });
  const data: TrainingModuleAPI = await response.json();
  return apiToModule(data);
};

// Delete a training module
export const deleteTrainingModule = async (id: string): Promise<void> => {
  await fetch(`/api/training-modules/${id}`, {
    method: 'DELETE',
  });
};

// Update scheduled weeks for a module
export const updateScheduledWeeks = async (
  moduleId: string,
  weeks: number[]
): Promise<TrainingModule> => {
  const response = await fetch(`/api/training-modules/${moduleId}/weeks`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduledWeeks: weeks }),
  });
  const data: TrainingModuleAPI = await response.json();
  return apiToModule(data);
};
*/

/**
 * Expected Backend API Endpoints:
 * 
 * GET    /api/training-modules?year={year}           - Get all modules for a year
 * GET    /api/training-modules/{id}                   - Get a specific module
 * POST   /api/training-modules                        - Create a new module
 * PUT    /api/training-modules/{id}                  - Update a module
 * PATCH  /api/training-modules/{id}/weeks             - Update scheduled weeks only
 * DELETE /api/training-modules/{id}                   - Delete a module
 * 
 * Request/Response Format:
 * {
 *   "id": "string",
 *   "category": "BASIC" | "TECHNICAL" | "MANAGERIAL" | "HSE",
 *   "moduleName": "string",
 *   "durasi": "string",
 *   "classField": "string",
 *   "trainer": "string",
 *   "targetTrainee": "P" | "A",
 *   "scheduledWeeks": [1, 2, 3, ...],  // Array of week numbers (1-52)
 *   "year": 2024,
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */

