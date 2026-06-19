import { create } from 'zustand';

/**
 * resumeStore
 *
 * Shape:
 *   resumes: Resume[]
 *   selectedResumeId: string | null
 *
 * Resume shape (matches server/src/models/Resume.js):
 *   { _id, userId, fileName, cloudinaryUrl, parsedText,
 *     extractedSkills: string[], uploadedAt }
 */
const useResumeStore = create((set, get) => ({
  resumes: [],
  selectedResumeId: null,

  setResumes: (resumes) => set({ resumes }),

  addResume: (resume) =>
    set((s) => ({ resumes: [resume, ...s.resumes] })),

  updateResume: (id, partial) =>
    set((s) => ({
      resumes: s.resumes.map((r) => (r._id === id ? { ...r, ...partial } : r)),
    })),

  removeResume: (id) =>
    set((s) => ({
      resumes: s.resumes.filter((r) => r._id !== id),
      selectedResumeId: s.selectedResumeId === id ? null : s.selectedResumeId,
    })),

  selectResume: (id) => set({ selectedResumeId: id }),

  getSelected: () => {
    const { resumes, selectedResumeId } = get();
    return resumes.find((r) => r._id === selectedResumeId) ?? null;
  },
}));

export default useResumeStore;
