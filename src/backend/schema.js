
/**
 * SYSTEM ENTITY MODEL - STEP 5
 * 
 * This file serves as the definitive schema reference for the application.
 * It documents the structure of the 8 Core Entities and their relationships.
 * 
 * GOLDEN ARCHITECTURAL PRINCIPLE:
 * Learning data is separated from judgment authority.
 */

/* 
  ENTITY 1: SCHOOL
  The master entity functioning as the parent container.
*/
export const SchoolSchema = {
    collection: "schools",
    fields: {
        school_id: "string (UUID)",
        school_name: "string",
        board: "string[]",
        address: {
            street: "string",
            city: "string",
            district: "string",
            state: "string"
        },
        admin_user_id: "string (User UID)",
        status: "string ('active' | 'inactive')",
        created_at: "timestamp"
    },
    relationships: [
        "One School -> Many Users",
        "One School -> Many Learners",
        "One School -> Many Classes"
    ]
};

/* 
  ENTITY 2: USER
  A person interacting with the system. Can hold multiple roles.
  CRITICAL: All community roles (Connectors, Supporters, Companions) MUST be linked to a School.
  The School is the central entity for all data aggregation.
*/
export const UserSchema = {
    collection: "users",
    fields: {
        user_id: "string (UID)",
        name: "string",
        mobile: "string",
        email: "string",
        linked_school_id: "string (MANDATORY for operation)", // Central Linkage
        roles: "string[] (List of Role IDs)",
        status: "string",
        created_at: "timestamp"
    }
};

/* 
  ENTITY 3: ROLE
  Defines permissions and context.
  Roles: School Admin, Class Teacher, Teacher Guide, Math Teacher, Parent Supporter, 
       Math Connector, Math Companion, Math Mentor, Math Champion.
  Hierarchy: School -> User -> Role
*/
export const RoleDefinition = {
    role_id: "string",
    role_name: "string",
    role_type: "string ('School' | 'Home' | 'Community')"
};

/* 
  ENTITY 4: LEARNER (Student)
  The central focus of learning.
*/
export const LearnerSchema = {
    collection: "learners",
    fields: {
        learner_id: "string",
        name: "string",
        grade: "string",
        section: "string",
        school_id: "string",
        parent_user_id: "string",
        class_teacher_user_id: "string",
        math_teacher_user_id: "string",
        status: "string"
    }
};

/* 
  ENTITY 5: ASSESSMENT
  The activity being performed.
*/
export const AssessmentSchema = {
    collection: "assessments",
    fields: {
        assessment_id: "string",
        learner_id: "string",
        assessment_type: "string",
        started_at: "timestamp",
        completed_at: "timestamp",
        attempt_status: "string",

        // Sub-collection or hidden field
        responses: [{
            question_id: "string",
            response_value: "any",
            time_spent: "number (seconds)"
        }]
    }
};

/* 
  ENTITY 6: REPORT
  Derived insights. Separated into Individual and Aggregate.
*/
export const ReportSchema = {
    collection: "reports",
    types: {
        LearnerReport: {
            learner_id: "string",
            skill_summary: "object",
            confidence_indicator: "string",
            next_steps: "string"
        },
        SchoolReport: {
            school_id: "string",
            total_learners: "number",
            participation_rate: "number",
            total_support_minutes: "number",
            generated_on: "timestamp"
        }
    }
};

/* 
  ENTITY 7: SUPPORT INTERACTION
  Captures the 30-minute support philosophy digitally.
*/
export const SupportSessionSchema = {
    collection: "support_sessions",
    fields: {
        session_id: "string",
        learner_id: "string",
        supporter_user_id: "string",
        role_type: "string ('Parent' | 'Companion' | 'Connector')",
        duration_minutes: "number",
        reflection_note: "string",
        timestamp: "timestamp"
    }
};

/* 
  ENTITY 8: ACTIVITY LOG
  Audit trail for safety and trust.
*/
export const ActivityLogSchema = {
    collection: "activity_logs",
    fields: {
        log_id: "string",
        user_id: "string",
        action_type: "string",
        entity_reference: "string",
        timestamp: "timestamp"
    }
};
