import React, { useState } from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Divider,
} from "@mantine/core";
import { Input } from "../../src/components/Input";

export function InputPage() {
  const [validatedValue, setValidatedValue] = useState("Valid input");
  const [errorValue, setErrorValue] = useState("Invalid input");

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2} mb="sm">
            Inputs
          </Title>
          <Text c="dimmed">
            All input variations and states using the Brainwave 2.0 theme
          </Text>
        </div>

        <Divider />

        {/* Basic Text Inputs */}
        <div>
          <Title order={3} mb="md">
            Basic Text Inputs
          </Title>
          <SimpleGrid cols={2} spacing="md" verticalSpacing="md">
            <Stack gap="sm">
              <Input placeholder="Basic input" />
              <Text size="xs" c="dimmed">
                Default state
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input label="With Label" placeholder="Enter text here" />
              <Text size="xs" c="dimmed">
                With label
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                value={validatedValue}
                onChange={(e) => setValidatedValue(e.target.value)}
                validated
                label="Validated Input"
              />
              <Text size="xs" c="dimmed">
                Validated state
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                value={errorValue}
                onChange={(e) => setErrorValue(e.target.value)}
                error="This field has an error"
                label="Error Input"
              />
              <Text size="xs" c="dimmed">
                Error state
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Disabled States */}
        <div>
          <Title order={3} mb="md">
            Disabled States
          </Title>
          <SimpleGrid cols={2} spacing="md" verticalSpacing="md">
            <Stack gap="sm">
              <Input disabled placeholder="Disabled input" />
              <Text size="xs" c="dimmed">
                Disabled empty
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                disabled
                value="Disabled with value"
                label="Disabled Input"
              />
              <Text size="xs" c="dimmed">
                Disabled with value
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Text Areas */}
        <div>
          <Title order={3} mb="md">
            Text Areas
          </Title>
          <SimpleGrid cols={2} spacing="md" verticalSpacing="md">
            <Stack gap="sm">
              <Input multiline placeholder="Basic textarea" />
              <Text size="xs" c="dimmed">
                Basic textarea
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                multiline
                label="Description"
                placeholder="Enter a longer description here..."
              />
              <Text size="xs" c="dimmed">
                With label
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                multiline
                value="This textarea has been validated and shows the success state with a checkmark icon."
                validated
                label="Validated Textarea"
              />
              <Text size="xs" c="dimmed">
                Validated state
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                multiline
                value="This textarea has an error"
                error="Content is too short"
                label="Error Textarea"
              />
              <Text size="xs" c="dimmed">
                Error state
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Size Variations */}
        <div>
          <Title order={3} mb="md">
            Size Variations
          </Title>
          <SimpleGrid cols={3} spacing="md" verticalSpacing="md">
            <Stack gap="sm">
              <Input size="sm" label="Small Input" placeholder="Small size" />
              <Text size="xs" c="dimmed">
                Small size
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                size="md"
                label="Medium Input"
                placeholder="Medium size (default)"
              />
              <Text size="xs" c="dimmed">
                Medium size
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input size="lg" label="Large Input" placeholder="Large size" />
              <Text size="xs" c="dimmed">
                Large size
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Interactive States */}
        <div>
          <Title order={3} mb="md">
            Interactive Testing
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            These inputs are fully interactive for testing focus, hover, and
            typing behaviors.
          </Text>
          <SimpleGrid cols={2} spacing="md" verticalSpacing="md">
            <Stack gap="sm">
              <Input
                label="Focus Test"
                placeholder="Click to focus and test border colors"
              />
              <Text size="xs" c="dimmed">
                Test focus states
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                multiline
                label="Multiline Focus"
                placeholder="Click to focus this textarea and test the focus styling on multiline inputs"
                minRows={3}
              />
              <Text size="xs" c="dimmed">
                Multiline focus test
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Required Fields */}
        <div>
          <Title order={3} mb="md">
            Required Fields
          </Title>
          <SimpleGrid cols={2} spacing="md" verticalSpacing="md">
            <Stack gap="sm">
              <Input
                label="Required Field"
                placeholder="This field is required"
                required
              />
              <Text size="xs" c="dimmed">
                Required input
              </Text>
            </Stack>

            <Stack gap="sm">
              <Input
                multiline
                label="Required Description"
                placeholder="This textarea is required"
                required
                minRows={3}
              />
              <Text size="xs" c="dimmed">
                Required textarea
              </Text>
            </Stack>
          </SimpleGrid>
        </div>
      </Stack>
    </Container>
  );
}
