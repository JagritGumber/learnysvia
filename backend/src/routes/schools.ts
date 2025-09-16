import { db } from "@/database/db";
import {
  school,
  schoolMember,
  schoolClass,
  classMember,
  message,
} from "@/database/schemas/school";
import Elysia from "elysia";
import { eq, and, or } from "drizzle-orm";
import { betterAuth } from "@/macros/better-auth";
import z from "zod";

export const schoolsRouter = new Elysia({ prefix: "/schools" })
  .use(betterAuth)
  // Create a new school (onboarding)
  .post(
    "/create",
    async ({ body, user }) => {
      const { name, description, domain } = body;

      const newSchool = await db
        .insert(school)
        .values({
          id: Bun.randomUUIDv7(),
          name,
          description,
          domain,
          ownerId: user.id,
        })
        .returning();

      // Add the creator as the owner member
      await db.insert(schoolMember).values({
        id: Bun.randomUUIDv7(),
        schoolId: newSchool[0].id,
        userId: user.id,
        role: "owner",
      });

      return {
        success: true,
        school: newSchool[0],
      };
    },
    {
      auth: true,
      body: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        domain: z.string().optional(),
      }),
    }
  )
  // Get user's schools
  .get(
    "/",
    async ({ user }) => {
      // Get schools where user is owner or member
      const userSchools = await db
        .select({
          school: school,
          role: schoolMember.role,
        })
        .from(school)
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          or(eq(school.ownerId, user.id), eq(schoolMember.userId, user.id))
        )
        .orderBy(school.createdAt);

      return {
        success: true,
        schools: userSchools,
      };
    },
    { auth: true }
  )
  // Get school details
  .get(
    "/school/:id",
    async ({ params, user }) => {
      const { id } = params;

      // Check if user has access to this school
      const schoolData = await db
        .select()
        .from(school)
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(school.id, id),
            or(eq(school.ownerId, user.id), eq(schoolMember.userId, user.id))
          )
        )
        .limit(1);

      if (schoolData.length === 0) {
        throw new Error("School not found or access denied");
      }

      return {
        success: true,
        school: schoolData[0].school,
        membership: schoolData[0].schoolMember,
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    }
  )
  // Update school
  .put(
    "/:id",
    async ({ params, body, user }) => {
      const { id } = params;
      const { name, description, domain, settings } = body;

      // Check if user is owner
      const existingSchool = await db
        .select()
        .from(school)
        .where(and(eq(school.id, id), eq(school.ownerId, user.id)))
        .limit(1);

      if (existingSchool.length === 0) {
        throw new Error("School not found or access denied");
      }

      const updatedSchool = await db
        .update(school)
        .set({
          name,
          description,
          domain,
          settings,
          updatedAt: new Date(),
        })
        .where(eq(school.id, id))
        .returning();

      return {
        success: true,
        school: updatedSchool[0],
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        domain: z.string().optional(),
        settings: z.record(z.any(), z.any()).optional(),
      }),
    }
  )
  // Delete school
  .delete(
    "/:id",
    async ({ params, user }) => {
      const { id } = params;

      // Check if user is owner
      const existingSchool = await db
        .select()
        .from(school)
        .where(and(eq(school.id, id), eq(school.ownerId, user.id)))
        .limit(1);

      if (existingSchool.length === 0) {
        throw new Error("School not found or access denied");
      }

      await db.delete(school).where(eq(school.id, id));

      return {
        success: true,
        message: "School deleted successfully",
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    }
  )
  // Get school members
  .get(
    "/:id/members",
    async ({ params, user }) => {
      const { id } = params;

      // Check if user has access to this school
      const schoolData = await db
        .select()
        .from(school)
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(school.id, id),
            or(eq(school.ownerId, user.id), eq(schoolMember.userId, user.id))
          )
        )
        .limit(1);

      if (schoolData.length === 0) {
        throw new Error("School not found or access denied");
      }

      const members = await db
        .select()
        .from(schoolMember)
        .where(eq(schoolMember.schoolId, id))
        .orderBy(schoolMember.joinedAt);

      return {
        success: true,
        members,
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    }
  )
  // Add member to school
  .post(
    "/:id/members",
    async ({ params, body, user }) => {
      const { id } = params;
      const { userId, role } = body;

      // Check if user is owner or admin
      const schoolData = await db
        .select()
        .from(school)
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(school.id, id),
            or(
              eq(school.ownerId, user.id),
              and(
                eq(schoolMember.userId, user.id),
                eq(schoolMember.role, "admin")
              )
            )
          )
        )
        .limit(1);

      if (schoolData.length === 0) {
        throw new Error("School not found or access denied");
      }

      // Check if user is already a member
      const existingMember = await db
        .select()
        .from(schoolMember)
        .where(
          and(eq(schoolMember.schoolId, id), eq(schoolMember.userId, userId))
        )
        .limit(1);

      if (existingMember.length > 0) {
        throw new Error("User is already a member of this school");
      }

      const newMember = await db
        .insert(schoolMember)
        .values({
          id: Bun.randomUUIDv7(),
          schoolId: id,
          userId,
          role: role || "member",
        })
        .returning();

      return {
        success: true,
        member: newMember[0],
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        userId: z.string(),
        role: z.enum(["member", "admin", "teacher", "student"]).optional(),
      }),
    }
  )
  // Remove member from school
  .delete(
    "/:id/members/:memberId",
    async ({ params, user }) => {
      const { id, memberId } = params;

      // Check if user is owner or admin
      const schoolData = await db
        .select()
        .from(school)
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(school.id, id),
            or(
              eq(school.ownerId, user.id),
              and(
                eq(schoolMember.userId, user.id),
                eq(schoolMember.role, "admin")
              )
            )
          )
        )
        .limit(1);

      if (schoolData.length === 0) {
        throw new Error("School not found or access denied");
      }

      await db
        .delete(schoolMember)
        .where(
          and(eq(schoolMember.id, memberId), eq(schoolMember.schoolId, id))
        );

      return {
        success: true,
        message: "Member removed successfully",
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
        memberId: z.string(),
      }),
    }
  )
  // Create a class within a school
  .post(
    "/:id/classes",
    async ({ params, body, user }) => {
      const { id } = params;
      const { name, description } = body;

      // Check if user has access to this school and can create classes
      const schoolData = await db
        .select()
        .from(school)
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(school.id, id),
            or(
              eq(school.ownerId, user.id),
              and(
                eq(schoolMember.userId, user.id),
                or(
                  eq(schoolMember.role, "admin"),
                  eq(schoolMember.role, "teacher")
                )
              )
            )
          )
        )
        .limit(1);

      if (schoolData.length === 0) {
        throw new Error("School not found or access denied");
      }

      const newClass = await db
        .insert(schoolClass)
        .values({
          id: Bun.randomUUIDv7(),
          name,
          description,
          schoolId: id,
          createdById: user.id,
        })
        .returning();

      return {
        success: true,
        class: newClass[0],
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
    }
  )
  // Get classes in a school
  .get(
    "/:id/classes",
    async ({ params, user }) => {
      const { id } = params;

      // Check if user has access to this school
      const schoolData = await db
        .select()
        .from(school)
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(school.id, id),
            or(eq(school.ownerId, user.id), eq(schoolMember.userId, user.id))
          )
        )
        .limit(1);

      if (schoolData.length === 0) {
        throw new Error("School not found or access denied");
      }

      const classes = await db
        .select()
        .from(schoolClass)
        .where(eq(schoolClass.schoolId, id))
        .orderBy(schoolClass.createdAt);

      return {
        success: true,
        classes,
      };
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    }
  )
  // Get class details
  .get(
    "/classes/:classId",
    async ({ params, user }) => {
      const { classId } = params;

      // Get class with school info
      const classData = await db
        .select({
          class: schoolClass,
          school: school,
        })
        .from(schoolClass)
        .leftJoin(school, eq(schoolClass.schoolId, school.id))
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(schoolClass.id, classId),
            or(eq(school.ownerId, user.id), eq(schoolMember.userId, user.id))
          )
        )
        .limit(1);

      if (classData.length === 0) {
        throw new Error("Class not found or access denied");
      }

      return {
        success: true,
        class: classData[0].class,
        school: classData[0].school,
      };
    },
    {
      auth: true,
      params: z.object({
        classId: z.string(),
      }),
    }
  )
  // Update class
  .put(
    "/classes/update/:classId",
    async ({ params, body, user }) => {
      const { classId } = params;
      const { name, description, settings, isArchived } = body;

      // Get class and check permissions
      const classData = await db
        .select({
          class: schoolClass,
          school: school,
          membership: schoolMember,
        })
        .from(schoolClass)
        .leftJoin(school, eq(schoolClass.schoolId, school.id))
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(schoolClass.id, classId),
            or(
              eq(school.ownerId, user.id),
              and(
                eq(schoolMember.userId, user.id),
                or(
                  eq(schoolMember.role, "admin"),
                  eq(schoolMember.role, "teacher")
                )
              ),
              eq(schoolClass.createdById, user.id)
            )
          )
        )
        .limit(1);

      if (classData.length === 0) {
        throw new Error("Class not found or access denied");
      }

      const updatedClass = await db
        .update(schoolClass)
        .set({
          name,
          description,
          settings,
          isArchived,
          updatedAt: new Date(),
        })
        .where(eq(schoolClass.id, classId))
        .returning();

      return {
        success: true,
        class: updatedClass[0],
      };
    },
    {
      auth: true,
      params: z.object({
        classId: z.string(),
      }),
      body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        settings: z.record(z.any(), z.any()).optional(),
        isArchived: z.boolean().optional(),
      }),
    }
  )
  // Delete class
  .delete(
    "/classes/:classId",
    async ({ params, user }) => {
      const { classId } = params;

      // Get class and check permissions
      const classData = await db
        .select({
          class: schoolClass,
          school: school,
          membership: schoolMember,
        })
        .from(schoolClass)
        .leftJoin(school, eq(schoolClass.schoolId, school.id))
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(schoolClass.id, classId),
            or(
              eq(school.ownerId, user.id),
              and(
                eq(schoolMember.userId, user.id),
                eq(schoolMember.role, "admin")
              ),
              eq(schoolClass.createdById, user.id)
            )
          )
        )
        .limit(1);

      if (classData.length === 0) {
        throw new Error("Class not found or access denied");
      }

      await db.delete(schoolClass).where(eq(schoolClass.id, classId));

      return {
        success: true,
        message: "Class deleted successfully",
      };
    },
    {
      auth: true,
      params: z.object({
        classId: z.string(),
      }),
    }
  )
  // Add student to class
  .post(
    "/classes/:classId/members",
    async ({ params, body, user }) => {
      const { classId } = params;
      const { userId, role } = body;

      // Check if class exists and user has permission
      const classData = await db
        .select({
          class: schoolClass,
          school: school,
          membership: schoolMember,
        })
        .from(schoolClass)
        .leftJoin(school, eq(schoolClass.schoolId, school.id))
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(schoolClass.id, classId),
            or(
              eq(school.ownerId, user.id),
              and(
                eq(schoolMember.userId, user.id),
                or(
                  eq(schoolMember.role, "admin"),
                  eq(schoolMember.role, "teacher")
                )
              )
            )
          )
        )
        .limit(1);

      if (classData.length === 0) {
        throw new Error("Class not found or access denied");
      }

      // Check if user is already a member of this class
      const existingMember = await db
        .select()
        .from(classMember)
        .where(
          and(eq(classMember.classId, classId), eq(classMember.userId, userId))
        )
        .limit(1);

      if (existingMember.length > 0) {
        throw new Error("User is already a member of this class");
      }

      const newMember = await db
        .insert(classMember)
        .values({
          id: Bun.randomUUIDv7(),
          classId,
          userId,
          role: role || "student",
        })
        .returning();

      return {
        success: true,
        member: newMember[0],
      };
    },
    {
      auth: true,
      params: z.object({
        classId: z.string(),
      }),
      body: z.object({
        userId: z.string(),
        role: z.enum(["teacher", "student"]).optional(),
      }),
    }
  )
  // Get class members
  .get(
    "/classes/:classId/members",
    async ({ params, user }) => {
      const { classId } = params;

      // Check if user has access to this class
      const classData = await db
        .select()
        .from(schoolClass)
        .leftJoin(school, eq(schoolClass.schoolId, school.id))
        .leftJoin(schoolMember, eq(school.id, schoolMember.schoolId))
        .where(
          and(
            eq(schoolClass.id, classId),
            or(eq(school.ownerId, user.id), eq(schoolMember.userId, user.id))
          )
        )
        .limit(1);

      if (classData.length === 0) {
        throw new Error("Class not found or access denied");
      }

      const members = await db
        .select()
        .from(classMember)
        .where(eq(classMember.classId, classId))
        .orderBy(classMember.joinedAt);

      return {
        success: true,
        members,
      };
    },
    {
      auth: true,
      params: z.object({
        classId: z.string(),
      }),
    }
  )
  // Send message to class
  .post(
    "/classes/:classId/messages",
    async ({ params, body, user }) => {
      const { classId } = params;
      const { content, type, metadata } = body;

      // Check if user is a member of this class
      const classMemberData = await db
        .select()
        .from(classMember)
        .where(
          and(eq(classMember.classId, classId), eq(classMember.userId, user.id))
        )
        .limit(1);

      if (classMemberData.length === 0) {
        throw new Error("Access denied - not a member of this class");
      }

      const newMessage = await db
        .insert(message)
        .values({
          id: Bun.randomUUIDv7(),
          classId,
          userId: user.id,
          content,
          type: type || "text",
          metadata,
        })
        .returning();

      return {
        success: true,
        message: newMessage[0],
      };
    },
    {
      auth: true,
      params: z.object({
        classId: z.string(),
      }),
      body: z.object({
        content: z.string().min(1),
        type: z.enum(["text", "file", "image"]).optional(),
        metadata: z.record(z.any(), z.any()).optional(),
      }),
    }
  )
  // Get messages from class
  .get(
    "/classes/:classId/messages",
    async ({ params, user, query }) => {
      const { classId } = params;
      const { limit = 50, offset = 0 } = query;

      // Check if user is a member of this class
      const classMemberData = await db
        .select()
        .from(classMember)
        .where(
          and(eq(classMember.classId, classId), eq(classMember.userId, user.id))
        )
        .limit(1);

      if (classMemberData.length === 0) {
        throw new Error("Access denied - not a member of this class");
      }

      const messages = await db
        .select()
        .from(message)
        .where(eq(message.classId, classId))
        .orderBy(message.createdAt)
        .limit(Number(limit))
        .offset(Number(offset));

      return {
        success: true,
        messages,
      };
    },
    {
      auth: true,
      params: z.object({
        classId: z.string(),
      }),
      query: z.object({
        limit: z.string().optional(),
        offset: z.string().optional(),
      }),
    }
  );
