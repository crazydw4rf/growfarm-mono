"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { projectsApi, farmsApi } from "@/lib/api";
import { Project, Farm } from "@/types/api";

// Pagination state interface
interface PaginationState {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Cached data with page storage
interface ProjectCache {
  [page: number]: Project[];
}

interface FarmCache {
  [projectId: string]: {
    [page: number]: Farm[];
  };
}

interface DataContextType {
  // Projects
  projects: Project[];
  projectsPagination: PaginationState;
  loadProjects: (page: number) => Promise<void>;
  isLoadingProjects: boolean;

  // Farms
  farmsPagination: { [projectId: string]: PaginationState };
  loadFarms: (projectId: string, page: number) => Promise<void>;
  getFarms: (projectId: string) => Farm[];
  getAllFarmsForProject: (projectId: string) => Farm[];

  // Cache invalidation
  invalidateProject: () => void;
  invalidateFarms: (projectId: string) => void;

  // Direct state updates
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  addFarm: (projectId: string, farm: Farm) => void;
  updateFarm: (projectId: string, farm: Farm) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ITEMS_PER_PAGE = 10;

export function DataProvider({ children }: { children: React.ReactNode }) {
  // State for current page data
  const [projects, setProjects] = useState<Project[]>([]);
  const [farms, setFarms] = useState<{ [projectId: string]: Farm[] }>({});

  // State for pagination
  const [projectsPagination, setProjectsPagination] = useState<PaginationState>(
    {
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  );

  const [farmsPagination, setFarmsPagination] = useState<{
    [projectId: string]: PaginationState;
  }>({});

  // Loading states
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Cache storage
  const [projectCache, setProjectCache] = useState<ProjectCache>({});
  const [farmCache, setFarmCache] = useState<FarmCache>({});
  const [cacheTimestamps, setCacheTimestamps] = useState<{
    projects: { [page: number]: number };
    farms: { [projectId: string]: { [page: number]: number } };
  }>({
    projects: {},
    farms: {},
  });

  // Helper function to create pagination state
  const createPaginationState = (
    currentPage: number,
    count: number
  ): PaginationState => {
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return {
      currentPage,
      totalItems: count,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  };

  // Load projects with pagination
  const loadProjects = useCallback(
    async (page: number = 1) => {
      // Check cache first
      const cacheKey = page;
      const cached = projectCache[cacheKey];
      const cacheTime = cacheTimestamps.projects[cacheKey];

      if (cached && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
        setProjects(cached);
        return;
      }

      setIsLoadingProjects(true);
      try {
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const response = await projectsApi.getAll({
          skip,
          take: ITEMS_PER_PAGE,
        });

        // Update current projects
        setProjects(response.data);

        // Update pagination state
        setProjectsPagination(createPaginationState(page, response.count));

        // Update cache
        setProjectCache((prev) => ({ ...prev, [cacheKey]: response.data }));
        setCacheTimestamps((prev) => ({
          ...prev,
          projects: { ...prev.projects, [cacheKey]: Date.now() },
        }));
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    },
    [projectCache, cacheTimestamps]
  );

  // Load farms with pagination
  const loadFarms = useCallback(
    async (projectId: string, page: number = 1) => {
      // Check cache first
      const cached = farmCache[projectId]?.[page];
      const cacheTime = cacheTimestamps.farms[projectId]?.[page];

      if (cached && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
        setFarms((prev) => ({ ...prev, [projectId]: cached }));
        return;
      }

      try {
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const response = await farmsApi.getByProject(projectId, {
          skip,
          take: ITEMS_PER_PAGE,
        });

        // Update current farms
        setFarms((prev) => ({ ...prev, [projectId]: response.data }));

        // Update pagination state
        setFarmsPagination((prev) => ({
          ...prev,
          [projectId]: createPaginationState(page, response.count),
        }));

        // Update cache
        setFarmCache((prev) => ({
          ...prev,
          [projectId]: { ...prev[projectId], [page]: response.data },
        }));
        setCacheTimestamps((prev) => ({
          ...prev,
          farms: {
            ...prev.farms,
            [projectId]: { ...prev.farms[projectId], [page]: Date.now() },
          },
        }));
      } catch (error) {
        console.error("Failed to load farms:", error);
      }
    },
    [farmCache, cacheTimestamps]
  );

  // Utility functions
  const getFarms = useCallback(
    (projectId: string): Farm[] => {
      return farms[projectId] || [];
    },
    [farms]
  );

  const getAllFarmsForProject = useCallback(
    (projectId: string): Farm[] => {
      // First, try to get from current farms state
      const currentPageFarms = farms[projectId] || [];

      // Then, try to get from cache to see if we have more pages
      const projectCache = farmCache[projectId];
      if (!projectCache) {
        return currentPageFarms;
      }

      // Aggregate all farms from all cached pages
      const allFarms: Farm[] = [];
      Object.values(projectCache).forEach((pageData) => {
        allFarms.push(...pageData);
      });

      // Remove duplicates based on farm ID
      const uniqueFarms = allFarms.filter(
        (farm, index, self) => index === self.findIndex((f) => f.id === farm.id)
      );

      // Return the larger set (either cached or current)
      return uniqueFarms.length > currentPageFarms.length
        ? uniqueFarms
        : currentPageFarms;
    },
    [farms, farmCache]
  );

  const invalidateProject = useCallback(() => {
    // Clear all project cache
    setProjectCache({});
    setCacheTimestamps((prev) => ({ ...prev, projects: {} }));
  }, []);

  const invalidateFarms = useCallback((projectId: string) => {
    // Clear cache for specific project
    setFarmCache((prev) => ({ ...prev, [projectId]: {} }));
    setCacheTimestamps((prev) => ({
      ...prev,
      farms: { ...prev.farms, [projectId]: {} },
    }));
  }, []);

  // Direct state update functions
  const addProject = useCallback(
    (project: Project) => {
      // Add to current projects list
      setProjects((prev) => [project, ...prev]);

      // Add to cache for current page
      const currentPage = projectsPagination.currentPage;
      setProjectCache((prev) => ({
        ...prev,
        [currentPage]: [project, ...(prev[currentPage] || [])],
      }));

      // Update pagination count
      setProjectsPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        totalPages: Math.ceil((prev.totalItems + 1) / ITEMS_PER_PAGE),
      }));
    },
    [projectsPagination.currentPage]
  );

  const updateProject = useCallback((updatedProject: Project) => {
    // Update in current projects list
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );

    // Update in all cached pages
    setProjectCache((prev) => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach((page) => {
        newCache[parseInt(page)] = newCache[parseInt(page)].map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        );
      });
      return newCache;
    });
  }, []);

  const addFarm = useCallback(
    (projectId: string, farm: Farm) => {
      // Add to current farms list
      setFarms((prev) => ({
        ...prev,
        [projectId]: [farm, ...(prev[projectId] || [])],
      }));

      // Add to cache for current page
      const currentPage = farmsPagination[projectId]?.currentPage || 1;
      setFarmCache((prev) => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          [currentPage]: [farm, ...(prev[projectId]?.[currentPage] || [])],
        },
      }));

      // Update pagination count
      setFarmsPagination((prev) => ({
        ...prev,
        [projectId]: {
          ...(prev[projectId] || createPaginationState(1, 0)),
          totalItems: (prev[projectId]?.totalItems || 0) + 1,
          totalPages: Math.ceil(
            ((prev[projectId]?.totalItems || 0) + 1) / ITEMS_PER_PAGE
          ),
        },
      }));
    },
    [farmsPagination]
  );

  const updateFarm = useCallback((projectId: string, updatedFarm: Farm) => {
    // Update in current farms list
    setFarms((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((f) =>
        f.id === updatedFarm.id ? updatedFarm : f
      ),
    }));

    // Update in all cached pages for this project
    setFarmCache((prev) => ({
      ...prev,
      [projectId]: Object.keys(prev[projectId] || {}).reduce(
        (pages, page) => ({
          ...pages,
          [page]: prev[projectId][parseInt(page)].map((f) =>
            f.id === updatedFarm.id ? updatedFarm : f
          ),
        }),
        {}
      ),
    }));
  }, []);

  // Don't load initial data automatically - let pages load data when needed
  // This prevents unnecessary API calls on auth pages
  // useEffect(() => {
  //   loadProjects(1);
  // }, []);

  const value: DataContextType = {
    // Data
    projects,
    projectsPagination,

    // Loading states
    isLoadingProjects,

    // Functions
    loadProjects,
    loadFarms,
    getFarms,
    getAllFarmsForProject,

    // Pagination
    farmsPagination,

    // Cache invalidation
    invalidateProject,
    invalidateFarms,

    // Direct state updates
    addProject,
    updateProject,
    addFarm,
    updateFarm,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
