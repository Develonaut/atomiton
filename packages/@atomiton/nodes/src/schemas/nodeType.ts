import v from "@atomiton/validation";

const nodeTypeSchema = v.union([v.literal("atomic"), v.literal("composite")]);

export default nodeTypeSchema;
