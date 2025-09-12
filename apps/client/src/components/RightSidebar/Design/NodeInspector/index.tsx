import { useNodes } from "@atomiton/editor";
import { nodes } from "@atomiton/nodes";
import { Box, Field, Select } from "@atomiton/ui";
import type { SelectOption } from "@atomiton/ui";
import { useCallback, useEffect, useState } from "react";
import {
  useForm,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  type FieldErrors,
} from "react-hook-form";
import { FormSubmitButton } from "@/components/form";

/**
 * NodeInspector Component
 *
 * Displays form controls for the currently selected node based on its configuration.
 * Uses the node's metadata and field configuration to automatically generate appropriate form fields.
 */
function NodeInspector() {
  const { nodes: flowNodes, selectedId, updateNodeData } = useNodes();
  const [nodeConfig, setNodeConfig] = useState<Record<string, unknown> | null>(
    null,
  );
  const [formMetadata, setFormMetadata] = useState<{
    fields?: Record<string, unknown>;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );

  // Find the selected node
  const selectedNode = selectedId
    ? flowNodes.find((node) => node.id === selectedId)
    : null;

  // Get node configuration when selection changes
  useEffect(() => {
    if (selectedNode?.type) {
      try {
        const nodePackage = nodes.getNodePackage(selectedNode.type as never);
        if (nodePackage?.config) {
          // Access the actual configuration object
          const config = nodePackage.config;
          setNodeConfig(config);

          // Get the form metadata (fields configuration)
          const metadata = {
            fields:
              ((config as Record<string, unknown>).fields as Record<
                string,
                unknown
              >) || {},
          };
          setFormMetadata(metadata);
        } else {
          setNodeConfig(null);
          setFormMetadata(null);
        }
      } catch (error) {
        console.error("Error loading node configuration:", error);
        setNodeConfig(null);
        setFormMetadata(null);
      }
    } else {
      setNodeConfig(null);
      setFormMetadata(null);
    }
  }, [selectedNode?.type]);

  // Initialize form with node data
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: selectedNode?.data || {},
  });

  // Reset form when node data changes
  useEffect(() => {
    if (selectedNode?.data) {
      reset(selectedNode.data);
    }
  }, [selectedNode?.data, reset]);

  // Handle form submission
  const onSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      if (!selectedNode || !updateNodeData) return;

      setIsSubmitting(true);
      setSubmitStatus(null);

      try {
        // Update the node's data in the store
        updateNodeData(selectedNode.id, formData);
        setSubmitStatus("success");

        // Clear success message after 2 seconds
        setTimeout(() => setSubmitStatus(null), 2000);
      } catch (error) {
        console.error("Error updating node configuration:", error);
        setSubmitStatus("error");

        // Clear error message after 3 seconds
        setTimeout(() => setSubmitStatus(null), 3000);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedNode, updateNodeData],
  );

  // Show message when no node is selected
  if (!selectedNode) {
    return (
      <Box className="p-4">
        <div className="text-center text-sm text-[#7B7B7B]">
          Select a node to edit its properties
        </div>
      </Box>
    );
  }

  // Show message when node type is not recognized
  if (!nodeConfig) {
    return (
      <Box className="p-4">
        <div className="text-center text-sm text-[#7B7B7B]">
          Node type &quot;{selectedNode.type}&quot; configuration not available
        </div>
      </Box>
    );
  }

  // Extract fields from form metadata
  const fields = formMetadata?.fields || {};
  const fieldEntries = Object.entries(fields);

  return (
    <Box className="p-4 space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#000] mb-1">
          {selectedNode.type}
        </h3>
        <p className="text-xs text-[#7B7B7B]">
          Configure the properties for this node
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fieldEntries.map(([fieldName, fieldConfig]) => (
          <div key={fieldName}>
            {renderField(fieldName, fieldConfig as Record<string, unknown>, {
              register,
              setValue,
              watch,
              errors,
            })}
          </div>
        ))}

        {fieldEntries.length > 0 && (
          <div className="pt-2 border-t border-[#E2E2E2]">
            <FormSubmitButton
              isLoading={isSubmitting}
              loadingText="Updating..."
            >
              Update Configuration
            </FormSubmitButton>

            {submitStatus === "success" && (
              <p className="text-xs text-green-600 mt-2 text-center">
                Configuration updated successfully
              </p>
            )}

            {submitStatus === "error" && (
              <p className="text-xs text-red-600 mt-2 text-center">
                Failed to update configuration
              </p>
            )}
          </div>
        )}

        {fieldEntries.length === 0 && (
          <div className="text-center text-sm text-[#7B7B7B]">
            No configurable properties for this node
          </div>
        )}
      </form>
    </Box>
  );
}

/**
 * Renders a form field based on its configuration
 */
function renderField(
  fieldName: string,
  fieldConfig: Record<string, unknown>,
  formMethods: {
    register: UseFormRegister<Record<string, unknown>>;
    watch: UseFormWatch<Record<string, unknown>>;
    setValue: UseFormSetValue<Record<string, unknown>>;
    errors: FieldErrors<Record<string, unknown>>;
  },
) {
  const { register, watch, setValue, errors } = formMethods;
  const value = watch(fieldName);
  const error = errors[fieldName] as { message?: string } | undefined;

  // Determine the control type
  const controlType = fieldConfig.controlType || "text";
  const label = (fieldConfig.label as string) || fieldName;
  const placeholder = (fieldConfig.placeholder as string) || "";
  const helpText = (fieldConfig.helpText as string) || "";
  const disabled = Boolean(fieldConfig.disabled);
  const readOnly = Boolean(fieldConfig.readOnly);

  switch (controlType) {
    case "select": {
      const options: SelectOption[] = (
        (fieldConfig.options as Array<{ label?: string; value: string }>) || []
      ).map((opt: { label?: string; value: string }, index: number) => ({
        id: index,
        name: (opt.label || opt.value) as string,
        value: opt.value,
      }));

      const selectedOption = options.find((opt) => opt.value === value) || null;

      return (
        <div>
          {label && (
            <label className="block text-xs font-medium text-[#000] mb-2">
              {label}
            </label>
          )}
          <Select
            options={options}
            value={selectedOption}
            onChange={(option: SelectOption) => {
              setValue(fieldName, option.value);
            }}
            placeholder={placeholder}
          />
          {helpText && (
            <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error?.message}</p>
          )}
        </div>
      );
    }

    case "boolean": {
      return (
        <div className="flex items-center justify-between">
          <div>
            {label && (
              <label className="block text-xs font-medium text-[#000]">
                {label}
              </label>
            )}
            {helpText && <p className="text-xs text-[#7B7B7B]">{helpText}</p>}
          </div>
          <input
            type="checkbox"
            {...register(fieldName)}
            disabled={disabled}
            className="h-4 w-4 rounded border-[#E2E2E2] text-[#000] focus:ring-2 focus:ring-[#000] disabled:opacity-50"
          />
        </div>
      );
    }

    case "textarea": {
      return (
        <div>
          <Field
            label={label}
            placeholder={placeholder}
            textarea={true}
            disabled={disabled}
            readOnly={readOnly}
            {...register(fieldName)}
          />
          {helpText && (
            <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error?.message}</p>
          )}
        </div>
      );
    }

    case "number":
    case "range": {
      return (
        <div>
          <Field
            label={label}
            type="number"
            placeholder={placeholder}
            min={fieldConfig.min as number}
            max={fieldConfig.max as number}
            step={fieldConfig.step as number}
            disabled={disabled}
            readOnly={readOnly}
            {...register(fieldName, { valueAsNumber: true })}
          />
          {helpText && (
            <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error?.message}</p>
          )}
        </div>
      );
    }

    case "json": {
      return (
        <div>
          <Field
            label={label}
            placeholder={placeholder || '{"key": "value"}'}
            textarea={true}
            disabled={disabled}
            readOnly={readOnly}
            {...register(fieldName, {
              validate: (value: unknown) => {
                if (!value) return true;
                try {
                  JSON.parse(value as string);
                  return true;
                } catch {
                  return "Invalid JSON format";
                }
              },
            })}
          />
          {helpText && (
            <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error?.message}</p>
          )}
        </div>
      );
    }

    case "url":
    case "email":
    case "password":
    case "date":
    case "datetime":
    case "color":
    case "file":
    case "text":
    default: {
      // Map special types to HTML input types
      const inputType =
        controlType === "url"
          ? "url"
          : controlType === "email"
            ? "email"
            : controlType === "password"
              ? "password"
              : controlType === "date"
                ? "date"
                : controlType === "datetime"
                  ? "datetime-local"
                  : controlType === "color"
                    ? "color"
                    : controlType === "file"
                      ? "file"
                      : "text";

      return (
        <div>
          <Field
            label={label}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            {...register(fieldName)}
          />
          {helpText && (
            <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-1">{error?.message}</p>
          )}
        </div>
      );
    }
  }
}

export default NodeInspector;
