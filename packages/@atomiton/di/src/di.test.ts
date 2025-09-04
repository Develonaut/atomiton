/**
 * Basic tests for the DI container
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Container, Service } from "./di";

describe("DI Container", () => {
  beforeEach(() => {
    Container.reset();
  });

  it("should create and retrieve a simple service", () => {
    @Service()
    class TestService {
      getValue() {
        return "test-value";
      }
    }

    const instance = Container.get(TestService);
    expect(instance).toBeInstanceOf(TestService);
    expect(instance.getValue()).toBe("test-value");
  });

  it("should return the same instance (singleton)", () => {
    @Service()
    class SingletonService {
      random = Math.random();
    }

    const instance1 = Container.get(SingletonService);
    const instance2 = Container.get(SingletonService);

    expect(instance1).toBe(instance2);
    expect(instance1.random).toBe(instance2.random);
  });

  it("should inject dependencies", () => {
    @Service()
    class DependencyService {
      getValue() {
        return "dependency";
      }
    }

    @Service()
    class MainService {
      constructor(public dependency: DependencyService) {}
    }

    const instance = Container.get(MainService);
    expect(instance.dependency).toBeInstanceOf(DependencyService);
    expect(instance.dependency.getValue()).toBe("dependency");
  });

  it("should throw error for non-decorated classes", () => {
    class NonDecoratedService {}

    expect(() => Container.get(NonDecoratedService)).toThrow(
      "[DI] NonDecoratedService is not decorated with Service",
    );
  });

  it("should detect circular dependencies", () => {
    @Service()
    class ServiceA {
      constructor(public b: ServiceB) {}
    }

    @Service()
    class ServiceB {
      constructor(public a: ServiceA) {}
    }

    expect(() => Container.get(ServiceA)).toThrow(
      /Circular dependency detected/,
    );
  });

  it("should support factory functions", () => {
    let factoryCalls = 0;

    @Service({
      factory: () => {
        factoryCalls++;
        return new TestFactoryService("factory-created");
      },
    })
    class TestFactoryService {
      constructor(public name: string) {}
    }

    const instance = Container.get(TestFactoryService);
    expect(instance.name).toBe("factory-created");
    expect(factoryCalls).toBe(1);

    // Should still be singleton
    const instance2 = Container.get(TestFactoryService);
    expect(instance).toBe(instance2);
    expect(factoryCalls).toBe(1);
  });

  it("should support manual instance setting", () => {
    abstract class AbstractService {
      abstract getValue(): string;
    }

    class ConcreteService extends AbstractService {
      getValue() {
        return "concrete";
      }
    }

    const concreteInstance = new ConcreteService();
    Container.set(AbstractService, concreteInstance);

    const retrieved = Container.get(AbstractService);
    expect(retrieved).toBe(concreteInstance);
    expect(retrieved.getValue()).toBe("concrete");
  });

  it("should reset instances but keep registrations", () => {
    @Service()
    class ResetTestService {
      random = Math.random();
    }

    const instance1 = Container.get(ResetTestService);
    const value1 = instance1.random;

    Container.reset();

    const instance2 = Container.get(ResetTestService);
    const value2 = instance2.random;

    expect(instance1).not.toBe(instance2);
    expect(value1).not.toBe(value2);
  });
});
