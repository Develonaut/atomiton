#!/usr/bin/env node
/**
 * Script to create missing components in User/Settings
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Title component template
const titleComponent = `type Props = {
  value: string;
};

function Title({ value }: Props) {
  return <div className="text-lg font-semibold mb-4">{value}</div>;
}

export default Title;`;

// Option component template
const optionComponent = `type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Option({ title, description, children }: Props) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        {description && (
          <div className="text-xs text-secondary mt-1">{description}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export default Option;`;

// Field component template
const fieldComponent = `type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
};

function Field({ label, value, onChange, type = "text", placeholder }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-s-02 rounded-lg bg-surface-02 focus:outline-none focus:border-primary"
      />
    </div>
  );
}

export default Field;`;

// Directories to create components in
const directories = [
  'apps/client/src/components/User/Settings/General',
  'apps/client/src/components/User/Settings/Profile',
  'apps/client/src/components/User/Settings/Security',
  'apps/client/src/components/User/Settings/Notifications',
  'apps/client/src/components/User/Settings/Subscription',
];

// Components to create in each directory (if they don't exist)
const components = [
  { name: 'Title.tsx', content: titleComponent },
  { name: 'Option.tsx', content: optionComponent },
  { name: 'Field.tsx', content: fieldComponent },
];

let created = 0;

for (const dir of directories) {
  for (const component of components) {
    // Skip Field for Subscription directory
    if (dir.includes('Subscription') && component.name === 'Field.tsx') {
      continue;
    }
    // Skip Option for Subscription directory
    if (dir.includes('Subscription') && component.name === 'Option.tsx') {
      continue;
    }

    const filePath = `${dir}/${component.name}`;

    if (!existsSync(filePath)) {
      const directory = dirname(filePath);
      if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
      }

      writeFileSync(filePath, component.content);
      console.log(`✅ Created: ${filePath}`);
      created++;
    }
  }
}

console.log(`\n📊 Created ${created} missing components`);