import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppShell, NavLink, Container, Title, Text, Group, Stack } from '@mantine/core';
import { brainwaveTheme } from '@atomiton/theme';
import { ButtonPage } from './pages/ButtonPage';
import { CardPage } from './pages/CardPage';
import { InputPage } from './pages/InputPage';

function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">Atomiton UI Design System</Title>
          <Text size="lg" c="dimmed">
            Interactive preview of all UI components with the Brainwave 2.0 theme
          </Text>
        </div>
        
        <Group gap="lg">
          <div>
            <Text fw={600} mb="xs">Available Components</Text>
            <Stack gap="xs">
              <Text size="sm">• Buttons - All variants and states</Text>
              <Text size="sm">• Cards - Different content layouts</Text>
              <Text size="sm">• Inputs - Text inputs and textareas</Text>
            </Stack>
          </div>
        </Group>

        <div>
          <Text fw={600} mb="xs">Navigation</Text>
          <Text size="sm" c="dimmed">
            Use the sidebar to explore different component pages. Each page shows
            all states and variants of a component for comprehensive testing.
          </Text>
        </div>
      </Stack>
    </Container>
  );
}

export function App() {
  const location = useLocation();

  return (
    <AppShell
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding="md"
      styles={{
        navbar: {
          backgroundColor: brainwaveTheme.colors!.surface![0],
          borderColor: brainwaveTheme.colors!.border![0],
        },
        main: {
          backgroundColor: brainwaveTheme.colors!.surface![0],
          padding: '1.5rem',
        }
      }}
    >
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Title order={4} mb="md">Design System</Title>
          
          <NavLink
            label="Overview"
            active={location.pathname === '/' || location.pathname === ''}
            component={Link}
            to="/"
            styles={{
              root: {
                borderRadius: brainwaveTheme.radius!.md,
              }
            }}
          />
          
          <NavLink
            label="Buttons"
            active={location.pathname === '/buttons'}
            component={Link}
            to="/buttons"
            styles={{
              root: {
                borderRadius: brainwaveTheme.radius!.md,
              }
            }}
          />
          
          <NavLink
            label="Cards"
            active={location.pathname === '/cards'}
            component={Link}
            to="/cards"
            styles={{
              root: {
                borderRadius: brainwaveTheme.radius!.md,
              }
            }}
          />
          
          <NavLink
            label="Inputs"
            active={location.pathname === '/inputs'}
            component={Link}
            to="/inputs"
            styles={{
              root: {
                borderRadius: brainwaveTheme.radius!.md,
              }
            }}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buttons" element={<ButtonPage />} />
          <Route path="/cards" element={<CardPage />} />
          <Route path="/inputs" element={<InputPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}