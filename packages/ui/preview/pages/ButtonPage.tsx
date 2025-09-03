import React from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Divider,
} from "@mantine/core";
import { Button } from "../../src/components/Button";

export function ButtonPage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2} mb="sm">
            Buttons
          </Title>
          <Text c="dimmed">
            All button variants and states using the Brainwave 2.0 theme
          </Text>
        </div>

        <Divider />

        {/* Primary Buttons */}
        <div>
          <Title order={3} mb="md">
            Primary Buttons
          </Title>
          <SimpleGrid cols={4} spacing="md" verticalSpacing="sm">
            <Stack gap="sm" align="center">
              <Button variant="primary">Primary</Button>
              <Text size="xs" c="dimmed" ta="center">
                Default
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="primary" disabled>
                Primary
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Disabled
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="primary" loading>
                Primary
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Loading
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="primary" size="lg">
                Primary Large
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Large size
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Secondary Buttons */}
        <div>
          <Title order={3} mb="md">
            Secondary Buttons
          </Title>
          <SimpleGrid cols={4} spacing="md" verticalSpacing="sm">
            <Stack gap="sm" align="center">
              <Button variant="secondary">Secondary</Button>
              <Text size="xs" c="dimmed" ta="center">
                Default
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="secondary" disabled>
                Secondary
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Disabled
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="secondary" loading>
                Secondary
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Loading
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="secondary" size="lg">
                Secondary Large
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Large size
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Danger Buttons */}
        <div>
          <Title order={3} mb="md">
            Danger Buttons
          </Title>
          <SimpleGrid cols={4} spacing="md" verticalSpacing="sm">
            <Stack gap="sm" align="center">
              <Button variant="danger">Danger</Button>
              <Text size="xs" c="dimmed" ta="center">
                Default
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="danger" disabled>
                Danger
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Disabled
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="danger" loading>
                Danger
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Loading
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="danger" size="lg">
                Danger Large
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Large size
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Default Buttons */}
        <div>
          <Title order={3} mb="md">
            Default Buttons
          </Title>
          <SimpleGrid cols={4} spacing="md" verticalSpacing="sm">
            <Stack gap="sm" align="center">
              <Button variant="default">Default</Button>
              <Text size="xs" c="dimmed" ta="center">
                Default
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="default" disabled>
                Default
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Disabled
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="default" loading>
                Default
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Loading
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="default" size="lg">
                Default Large
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Large size
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
          <SimpleGrid cols={3} spacing="md" verticalSpacing="sm">
            <Stack gap="sm" align="center">
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Small
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="primary" size="md">
                Medium
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Medium (default)
              </Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Button variant="primary" size="lg">
                Large
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                Large
              </Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Full Width */}
        <div>
          <Title order={3} mb="md">
            Full Width
          </Title>
          <Stack gap="md">
            <Button variant="primary" fullWidth>
              Primary Full Width
            </Button>
            <Button variant="secondary" fullWidth>
              Secondary Full Width
            </Button>
            <Button variant="danger" fullWidth>
              Danger Full Width
            </Button>
          </Stack>
        </div>
      </Stack>
    </Container>
  );
}
