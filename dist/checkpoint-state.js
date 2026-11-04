/** Track unique project visits for this walk; decorative signs never count. */
export function createCheckpointTracker(projectIds) {
  const projects = new Set(projectIds);
  const completed = new Set();
  return {
    mark(projectId) {
      const changed = projects.has(projectId) && !completed.has(projectId);
      if (changed) completed.add(projectId);
      return {
        changed,
        completed: completed.size,
        total: projects.size,
        isComplete: changed && completed.size === projects.size,
      };
    },
  };
}
