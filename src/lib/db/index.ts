import { PrismaClient } from "@prisma/client";
import { IProject, ITask, IAgentLog, IArtifact, TaskStatus } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.DATABASE_URL.length > 5 &&
    !process.env.DATABASE_URL.includes("placeholder")
);

const prisma =
  globalThis.prismaGlobal ??
  (isDatabaseConfigured ? new PrismaClient() : null);

if (process.env.NODE_ENV !== "production" && prisma) {
  globalThis.prismaGlobal = prisma;
}

// In-memory fallback storage
const memoryStore = {
  projects: new Map<string, IProject>(),
  tasks: new Map<string, ITask[]>(),
  logs: new Map<string, IAgentLog[]>(),
  artifacts: new Map<string, IArtifact[]>(),
};

export async function isDbConnected(): Promise<{ connected: boolean; provider: string }> {
  if (!prisma) {
    return { connected: false, provider: "In-Memory / Fallback (Neon/Supabase URL not set)" };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, provider: "PostgreSQL (Neon / Supabase)" };
  } catch (error) {
    console.warn("DB connection check failed, using fallback:", error);
    return { connected: false, provider: "In-Memory / Fallback (Connection error)" };
  }
}

export async function createProject(prompt: string, title?: string): Promise<IProject> {
  const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const projectTitle = title || prompt.slice(0, 40) + "...";
  const now = new Date().toISOString();

  if (prisma) {
    try {
      const created = await prisma.project.create({
        data: {
          id,
          title: projectTitle,
          prompt,
          status: "planning",
        },
      });
      return {
        id: created.id,
        title: created.title,
        prompt: created.prompt,
        status: created.status as IProject["status"],
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        tasks: [],
        logs: [],
        artifacts: [],
      };
    } catch (e) {
      console.warn("Prisma createProject error, falling back to memory:", e);
    }
  }

  const proj: IProject = {
    id,
    title: projectTitle,
    prompt,
    status: "planning",
    createdAt: now,
    updatedAt: now,
    tasks: [],
    logs: [],
    artifacts: [],
  };
  memoryStore.projects.set(id, proj);
  memoryStore.tasks.set(id, []);
  memoryStore.logs.set(id, []);
  memoryStore.artifacts.set(id, []);
  return proj;
}

export async function updateProjectStatus(
  projectId: string,
  status: IProject["status"]
): Promise<void> {
  if (prisma) {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status },
      });
      return;
    } catch (e) {
      console.warn("Prisma updateProjectStatus error:", e);
    }
  }

  const proj = memoryStore.projects.get(projectId);
  if (proj) {
    proj.status = status;
    proj.updatedAt = new Date().toISOString();
  }
}

export async function saveTasks(projectId: string, tasks: ITask[]): Promise<ITask[]> {
  if (prisma) {
    try {
      await prisma.task.deleteMany({ where: { projectId } });
      const created = await Promise.all(
        tasks.map((t, idx) =>
          prisma.task.create({
            data: {
              id: t.id,
              projectId,
              title: t.title,
              description: t.description,
              order: idx + 1,
              assignedTo: t.assignedTo,
              status: t.status,
              iterations: t.iterations || 0,
            },
          })
        )
      );
      return created.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        order: t.order,
        assignedTo: t.assignedTo as "DEVELOP" | "TESTING",
        status: t.status as TaskStatus,
        iterations: t.iterations,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn("Prisma saveTasks error:", e);
    }
  }

  memoryStore.tasks.set(projectId, tasks);
  return tasks;
}

export async function updateTaskStatus(
  taskId: string,
  projectId: string,
  status: TaskStatus,
  iterations?: number
): Promise<void> {
  if (prisma) {
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status,
          ...(typeof iterations === "number" ? { iterations } : {}),
        },
      });
      return;
    } catch (e) {
      console.warn("Prisma updateTaskStatus error:", e);
    }
  }

  const tasks = memoryStore.tasks.get(projectId) || [];
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = status;
    if (typeof iterations === "number") task.iterations = iterations;
    task.updatedAt = new Date().toISOString();
  }
}

export async function saveLog(projectId: string, log: IAgentLog): Promise<IAgentLog> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  if (prisma) {
    try {
      const created = await prisma.agentLog.create({
        data: {
          id: logId,
          projectId,
          agent: log.agent,
          type: log.type,
          content: log.content,
          meta: log.meta ? JSON.stringify(log.meta) : null,
        },
      });
      return {
        id: created.id,
        projectId: created.projectId,
        agent: created.agent as IAgentLog["agent"],
        type: created.type as IAgentLog["type"],
        content: created.content,
        meta: created.meta ? JSON.parse(created.meta) : null,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma saveLog error:", e);
    }
  }

  const logEntry: IAgentLog = {
    ...log,
    id: logId,
    createdAt: now,
  };
  const list = memoryStore.logs.get(projectId) || [];
  list.push(logEntry);
  memoryStore.logs.set(projectId, list);
  return logEntry;
}

export async function saveArtifact(
  projectId: string,
  taskId: string | undefined,
  artifact: Omit<IArtifact, "id" | "projectId" | "taskId">
): Promise<IArtifact> {
  const artId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  if (prisma) {
    try {
      const created = await prisma.artifact.create({
        data: {
          id: artId,
          projectId,
          taskId: taskId || null,
          fileName: artifact.fileName,
          content: artifact.content,
          language: artifact.language || "typescript",
          version: artifact.version || 1,
        },
      });
      return {
        id: created.id,
        projectId: created.projectId,
        taskId: created.taskId || undefined,
        fileName: created.fileName,
        content: created.content,
        language: created.language,
        version: created.version,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma saveArtifact error:", e);
    }
  }

  const artEntry: IArtifact = {
    ...artifact,
    id: artId,
    projectId,
    taskId,
    createdAt: now,
  };
  const list = memoryStore.artifacts.get(projectId) || [];
  // Update if exists or append
  const existingIdx = list.findIndex(
    (a) => a.fileName === artifact.fileName && a.taskId === taskId
  );
  if (existingIdx >= 0) {
    list[existingIdx] = artEntry;
  } else {
    list.push(artEntry);
  }
  memoryStore.artifacts.set(projectId, list);
  return artEntry;
}

export async function getProject(projectId: string): Promise<IProject | null> {
  if (prisma) {
    try {
      const proj = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tasks: { orderBy: { order: "asc" } },
          logs: { orderBy: { createdAt: "asc" } },
          artifacts: { orderBy: { createdAt: "asc" } },
        },
      });
      if (proj) {
        return {
          id: proj.id,
          title: proj.title,
          prompt: proj.prompt,
          status: proj.status as IProject["status"],
          createdAt: proj.createdAt.toISOString(),
          updatedAt: proj.updatedAt.toISOString(),
          tasks: proj.tasks.map((t) => ({
            id: t.id,
            projectId: t.projectId,
            title: t.title,
            description: t.description,
            order: t.order,
            assignedTo: t.assignedTo as "DEVELOP" | "TESTING",
            status: t.status as TaskStatus,
            iterations: t.iterations,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          })),
          logs: proj.logs.map((l) => ({
            id: l.id,
            projectId: l.projectId,
            agent: l.agent as IAgentLog["agent"],
            type: l.type as IAgentLog["type"],
            content: l.content,
            meta: l.meta ? JSON.parse(l.meta) : null,
            createdAt: l.createdAt.toISOString(),
          })),
          artifacts: proj.artifacts.map((a) => ({
            id: a.id,
            projectId: a.projectId,
            taskId: a.taskId || undefined,
            fileName: a.fileName,
            content: a.content,
            language: a.language,
            version: a.version,
            createdAt: a.createdAt.toISOString(),
          })),
        };
      }
    } catch (e) {
      console.warn("Prisma getProject error:", e);
    }
  }

  const mem = memoryStore.projects.get(projectId);
  if (!mem) return null;
  return {
    ...mem,
    tasks: memoryStore.tasks.get(projectId) || [],
    logs: memoryStore.logs.get(projectId) || [],
    artifacts: memoryStore.artifacts.get(projectId) || [],
  };
}

export async function listRecentProjects(): Promise<IProject[]> {
  if (prisma) {
    try {
      const projects = await prisma.project.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          tasks: true,
        },
      });
      return projects.map((p) => ({
        id: p.id,
        title: p.title,
        prompt: p.prompt,
        status: p.status as IProject["status"],
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        tasks: p.tasks.map((t) => ({
          id: t.id,
          projectId: t.projectId,
          title: t.title,
          description: t.description,
          order: t.order,
          assignedTo: t.assignedTo as "DEVELOP" | "TESTING",
          status: t.status as TaskStatus,
          iterations: t.iterations,
        })),
      }));
    } catch (e) {
      console.warn("Prisma listRecentProjects error:", e);
    }
  }

  return Array.from(memoryStore.projects.values()).reverse().slice(0, 10);
}
