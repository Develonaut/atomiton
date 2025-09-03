import React from 'react';
import { Container, Title, Text, SimpleGrid, Stack, Divider, Button, Group } from '@mantine/core';
import { Card } from '../../src/components/Card';

export function CardPage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={2} mb="sm">Cards</Title>
          <Text c="dimmed">
            All card variations and content layouts using the Brainwave 2.0 theme
          </Text>
        </div>

        <Divider />

        {/* Basic Cards */}
        <div>
          <Title order={3} mb="md">Basic Cards</Title>
          <SimpleGrid cols={3} spacing="md">
            <Stack gap="sm" align="center">
              <Card>
                <Text>Empty card with minimal content</Text>
              </Card>
              <Text size="xs" c="dimmed" ta="center">Empty card</Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Card p="lg">
                <Stack gap="md">
                  <Title order={4}>Card Title</Title>
                  <Text>This is a card with a title and some descriptive text content.</Text>
                </Stack>
              </Card>
              <Text size="xs" c="dimmed" ta="center">With title</Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Card p="lg">
                <Stack gap="md">
                  <Title order={4}>Action Card</Title>
                  <Text>Card with interactive elements and actions.</Text>
                  <Button variant="primary" size="sm">Action</Button>
                </Stack>
              </Card>
              <Text size="xs" c="dimmed" ta="center">With action</Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Cards with Sections */}
        <div>
          <Title order={3} mb="md">Cards with Sections</Title>
          <SimpleGrid cols={2} spacing="md">
            <Stack gap="sm" align="center">
              <Card>
                <Card.Section p="lg" withBorder>
                  <Title order={4}>Header Section</Title>
                  <Text size="sm" c="dimmed">With border separator</Text>
                </Card.Section>
                <Card.Section p="lg">
                  <Text>Main content area with different styling from the header.</Text>
                </Card.Section>
              </Card>
              <Text size="xs" c="dimmed" ta="center">Sectioned card</Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Card>
                <Card.Section p="lg">
                  <Stack gap="md">
                    <Title order={4}>Complex Layout</Title>
                    <Text>Main content with description text that spans multiple lines to show text wrapping behavior.</Text>
                  </Stack>
                </Card.Section>
                <Card.Section p="lg" withBorder>
                  <Group justify="space-between">
                    <Button variant="secondary" size="sm">Cancel</Button>
                    <Button variant="primary" size="sm">Save</Button>
                  </Group>
                </Card.Section>
              </Card>
              <Text size="xs" c="dimmed" ta="center">Action footer</Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Different Padding Variations */}
        <div>
          <Title order={3} mb="md">Padding Variations</Title>
          <SimpleGrid cols={3} spacing="md">
            <Stack gap="sm" align="center">
              <Card p="xs">
                <Text size="sm">Extra small padding</Text>
              </Card>
              <Text size="xs" c="dimmed" ta="center">XS padding</Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Card p="md">
                <Text size="sm">Medium padding (default)</Text>
              </Card>
              <Text size="xs" c="dimmed" ta="center">MD padding</Text>
            </Stack>

            <Stack gap="sm" align="center">
              <Card p="xl">
                <Text size="sm">Extra large padding</Text>
              </Card>
              <Text size="xs" c="dimmed" ta="center">XL padding</Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Content-Heavy Cards */}
        <div>
          <Title order={3} mb="md">Content Variations</Title>
          <SimpleGrid cols={1} spacing="md">
            <Stack gap="sm" align="center">
              <Card p="lg" maw={600}>
                <Stack gap="md">
                  <Title order={4}>Rich Content Card</Title>
                  <Text>
                    This card demonstrates how longer content looks within the card component.
                    It includes multiple paragraphs to test text flow and spacing.
                  </Text>
                  <Text c="dimmed">
                    Secondary text with dimmed styling to show content hierarchy.
                    This helps test the visual separation between different text elements.
                  </Text>
                  <Group>
                    <Button variant="primary">Primary Action</Button>
                    <Button variant="secondary">Secondary Action</Button>
                    <Button variant="danger">Danger Action</Button>
                  </Group>
                </Stack>
              </Card>
              <Text size="xs" c="dimmed" ta="center">Rich content layout</Text>
            </Stack>
          </SimpleGrid>
        </div>

        <Divider />

        {/* Nested Cards */}
        <div>
          <Title order={3} mb="md">Nested Cards</Title>
          <SimpleGrid cols={1} spacing="md">
            <Stack gap="sm" align="center">
              <Card p="lg" maw={700}>
                <Stack gap="lg">
                  <Title order={4}>Parent Card</Title>
                  <Text>This card contains nested cards to test composition patterns.</Text>
                  
                  <SimpleGrid cols={2} spacing="md">
                    <Card p="md">
                      <Stack gap="xs">
                        <Text fw={600} size="sm">Nested Card 1</Text>
                        <Text size="xs" c="dimmed">Child content with its own styling</Text>
                      </Stack>
                    </Card>
                    
                    <Card p="md">
                      <Stack gap="xs">
                        <Text fw={600} size="sm">Nested Card 2</Text>
                        <Text size="xs" c="dimmed">Another child with consistent spacing</Text>
                      </Stack>
                    </Card>
                  </SimpleGrid>
                </Stack>
              </Card>
              <Text size="xs" c="dimmed" ta="center">Nested card composition</Text>
            </Stack>
          </SimpleGrid>
        </div>
      </Stack>
    </Container>
  );
}