import { test, expect } from '@playwright/test';
import { waitForPageLoad, takePageSnapshot, checkNoErrors } from './utils/test-helpers';

test.describe('All Routes - Comprehensive Coverage', () => {
  // Route definitions based on the app structure
  const routes = [
    { path: '/', name: 'home', category: 'main' },
    { path: '/create', name: 'create', category: 'main', requires3D: true },
    { path: '/explore', name: 'explore', category: 'main', requires3D: true },
    { path: '/explore/animations', name: 'explore-animations', category: 'explore', requires3D: true },
    { path: '/explore/designs', name: 'explore-designs', category: 'explore', requires3D: true },
    { path: '/explore/details', name: 'explore-details', category: 'explore' },
    { path: '/profile', name: 'profile', category: 'user' },
    { path: '/likes', name: 'likes', category: 'user' },
    { path: '/sign-in', name: 'sign-in', category: 'auth' },
    { path: '/create-account', name: 'create-account', category: 'auth' },
    { path: '/reset-password', name: 'reset-password', category: 'auth' },
    { path: '/pricing', name: 'pricing', category: 'info' },
    { path: '/updates', name: 'updates', category: 'info' },
    { path: '/assets/3d-objects', name: 'assets-3d-objects', category: 'assets' },
    { path: '/assets/materials', name: 'assets-materials', category: 'assets' },
  ];

  test.describe('Route Accessibility', () => {
    for (const route of routes) {
      test(`should load ${route.name} route successfully`, async ({ page }) => {
        await page.goto(route.path);
        
        if (route.requires3D) {
          // Wait longer for 3D content
          await page.waitForLoadState('networkidle', { timeout: 15000 });
          await page.waitForTimeout(2000);
        } else {
          await waitForPageLoad(page);
        }

        // Check for basic page health
        await checkNoErrors(page);
        
        // Verify page has content
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
        expect(bodyText!.trim().length).toBeGreaterThan(10);
        
        // Verify page title is set
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      });
    }
  });

  test.describe('Route Snapshots', () => {
    // Group routes by category for organized testing
    const routesByCategory = routes.reduce((acc, route) => {
      if (!acc[route.category]) acc[route.category] = [];
      acc[route.category].push(route);
      return acc;
    }, {} as Record<string, typeof routes>);

    for (const [category, categoryRoutes] of Object.entries(routesByCategory)) {
      test.describe(`${category} routes`, () => {
        for (const route of categoryRoutes) {
          test(`should capture ${route.name} snapshot`, async ({ page }) => {
            await page.goto(route.path);
            
            if (route.requires3D) {
              await page.waitForLoadState('networkidle', { timeout: 15000 });
              await page.waitForTimeout(3000); // Extra time for 3D rendering
              
              // Check for canvas elements and wait for WebGL
              const canvas = page.locator('canvas').first();
              if (await canvas.isVisible()) {
                await page.waitForTimeout(2000);
              }
            } else {
              await waitForPageLoad(page);
            }
            
            await takePageSnapshot(page, `${route.name}-full.png`);
          });
        }
      });
    }
  });

  test.describe('Route Navigation', () => {
    test('should navigate between main routes without errors', async ({ page }) => {
      const mainRoutes = routes.filter(r => r.category === 'main');
      
      for (const route of mainRoutes) {
        await page.goto(route.path);
        
        if (route.requires3D) {
          await page.waitForLoadState('networkidle', { timeout: 15000 });
          await page.waitForTimeout(1000);
        } else {
          await waitForPageLoad(page);
        }
        
        await checkNoErrors(page);
        
        // Verify navigation worked
        expect(page.url()).toContain(route.path);
      }
    });

    test('should handle direct URL access for all routes', async ({ page }) => {
      // Test a sample of routes to ensure direct access works
      const sampleRoutes = [
        routes.find(r => r.name === 'home')!,
        routes.find(r => r.name === 'create')!,
        routes.find(r => r.name === 'explore')!,
        routes.find(r => r.name === 'sign-in')!,
        routes.find(r => r.name === 'pricing')!,
      ];

      for (const route of sampleRoutes) {
        await page.goto(route.path);
        
        if (route.requires3D) {
          await page.waitForLoadState('networkidle', { timeout: 15000 });
        } else {
          await waitForPageLoad(page);
        }
        
        // Should not redirect to error page
        expect(page.url()).toContain(route.path);
        
        await checkNoErrors(page);
      }
    });
  });

  test.describe('Route Performance', () => {
    test('should load main routes within reasonable time', async ({ page }) => {
      const performanceRoutes = [
        { path: '/', name: 'home', maxTime: 3000 },
        { path: '/sign-in', name: 'sign-in', maxTime: 3000 },
        { path: '/pricing', name: 'pricing', maxTime: 3000 },
        { path: '/create', name: 'create', maxTime: 10000 }, // 3D content takes longer
        { path: '/explore', name: 'explore', maxTime: 10000 },
      ];

      for (const route of performanceRoutes) {
        const startTime = Date.now();
        
        await page.goto(route.path);
        
        if (route.name === 'create' || route.name === 'explore') {
          await page.waitForLoadState('networkidle', { timeout: route.maxTime });
        } else {
          await waitForPageLoad(page);
        }
        
        const loadTime = Date.now() - startTime;
        
        // Verify load time is within acceptable range
        expect(loadTime).toBeLessThan(route.maxTime);
        
        console.log(`${route.name} loaded in ${loadTime}ms`);
      }
    });
  });
});