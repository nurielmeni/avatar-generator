/**
 * Avatar Schema Parser
 * Extracts and processes option values from DiceBear schemas
 */

import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

export interface StyleOption {
  values: string[];
  isColor: boolean;
  isArray: boolean;
  hasProbability: boolean;
  probability: number;
}

export type StyleOptions = Record<string, StyleOption>;

const DEFAULT_BACKGROUND_COLORS = [
  'fff1f5',
  'ffdde6',
  'ffc8d8',
  'ffb3c9',
  'fc9ebb',
  'fff2ef',
  'ffdfd9',
  'ffcbc2',
  'ffb7ab',
  'ffa293',
  'fff3e9',
  'ffe1c9',
  'ffcfa8',
  'ffbc84',
  'f5ac6f',
  'fff5d9',
  'ffe5a0',
  'f7d67c',
  'e9c96e',
  'dbbb60',
  'edffb9',
  'ddf399',
  'cfe58c',
  'c2d77e',
  'b5ca71',
  'dfffe4',
  'aefebe',
  'a0efb1',
  'a0efb1',
  '85d496',
  'd8fff6',
  '91ffea',
  '77f3dc',
  '68e5cf',
  '59d7c1',
  'e2faff',
  'b6f4ff',
  '80ecff',
  '5fe0f6',
  '4fd3e8',
  'ecf7ff',
  'd1ebff',
  'b5e0ff',
  '97d4ff',
  '77c8ff',
  'f1f5ff',
  'dee7ff',
  'cbd9ff',
  'b8caff',
  'a5bcff',
  'f7f3ff',
  'ebe2ff',
  'e0d0ff',
  'd5bfff',
  'caadfe',
  'fff0fd',
  'ffdafa',
  'ffc2f9',
  'f7b0f0',
  'f7b0f0',
];

export function parseSchemaOptions(schema: JSONSchema7): StyleOptions {
  const result: StyleOptions = {};

  const properties: Record<string, JSONSchema7Definition> = {
    backgroundColor: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^(transparent|[a-fA-F0-9]{6})$',
      },
    },
    ...schema.properties,
  };

  for (const key in properties) {
    if (!Object.prototype.hasOwnProperty.call(properties, key)) {
      continue;
    }

    if (key === 'style') {
      continue;
    }

    const property = properties[key];

    if (typeof property === 'boolean' || typeof property === 'undefined') {
      continue;
    }

    const isColor = !!key.match(/Color$/);
    const isArray = property.type === 'array';
    const isBackgroundColor = key === 'backgroundColor';
    const probability = properties[`${key}Probability`];
    const hasProbability = typeof probability === 'object';

    const values = new Set<string>();

    if (hasProbability) {
      values.add('');
    }

    // Get enum values
    if (property.enum) {
      for (const value of property.enum) {
        if (typeof value === 'string') {
          values.add(value);
        }
      }
    }

    // Get default values
    if (property.default && Array.isArray(property.default)) {
      for (const value of property.default) {
        if (typeof value === 'string') {
          values.add(value);
        }
      }
    }

    // Get items.enum values
    if (
      typeof property.items === 'object' &&
      !Array.isArray(property.items) &&
      property.items.enum
    ) {
      for (const value of property.items.enum) {
        if (typeof value === 'string') {
          values.add(value);
        }
      }
    }

    // Get oneOf values (for options like accessories with probability)
    if (Array.isArray(property.oneOf)) {
      for (const schema of property.oneOf) {
        if (typeof schema === 'object' && !Array.isArray(schema)) {
          if (schema.const && typeof schema.const === 'string') {
            values.add(schema.const);
          }
          // Also check for enum in oneOf items
          if (schema.enum && Array.isArray(schema.enum)) {
            for (const value of schema.enum) {
              if (typeof value === 'string') {
                values.add(value);
              }
            }
          }
        }
      }
    }

    // Get items.oneOf values
    if (
      typeof property.items === 'object' &&
      !Array.isArray(property.items) &&
      Array.isArray(property.items.oneOf)
    ) {
      for (const schema of property.items.oneOf) {
        if (typeof schema === 'object' && !Array.isArray(schema)) {
          if (schema.const && typeof schema.const === 'string') {
            values.add(schema.const);
          }
          // Also check for enum in items.oneOf
          if (schema.enum && Array.isArray(schema.enum)) {
            for (const value of schema.enum) {
              if (typeof value === 'string') {
                values.add(value);
              }
            }
          }
        }
      }
    }

    // Debug log for all options
    console.log(`[parseSchemaOptions] ${key}:`, {
      hasProbability,
      hasEnum: !!property.enum,
      hasDefault: !!property.default,
      hasItemsEnum: !!(
        typeof property.items === 'object' &&
        !Array.isArray(property.items) &&
        property.items.enum
      ),
      hasOneOf: !!Array.isArray(property.oneOf),
      hasItemsOneOf: !!(
        typeof property.items === 'object' &&
        !Array.isArray(property.items) &&
        Array.isArray(property.items.oneOf)
      ),
      extractedValues: Array.from(values),
      valuesCount: values.size,
    });

    // Debug log for fields with few values
    if (key === 'accessories' || key === 'facialHair') {
      console.log(`[${key}]`, {
        property: JSON.stringify(property, null, 2).substring(0, 500),
        hasProbability,
        extractedValues: Array.from(values),
      });
    }

    // Skip if only one or no values (unless background color or has probability)
    if (values.size <= 1) {
      if (!isBackgroundColor && !hasProbability) {
        continue;
      }

      if (isBackgroundColor) {
        for (const color of DEFAULT_BACKGROUND_COLORS) {
          values.add(color);
        }
      }
    }

    // Add common background colors
    if (isBackgroundColor) {
      values.add('ffffff');
      values.add('transparent');
    }

    result[key] = {
      values: Array.from(values.values()),
      isColor,
      isArray,
      hasProbability,
      probability: hasProbability ? (probability.default as number) : 100,
    };
  }

  return result;
}

/**
 * Get random value from option values
 */
export function getRandomOptionValue(values: string[]): string {
  const index = Math.floor(Math.random() * values.length);
  return values[index] || '';
}

/**
 * Generate random options for a style
 */
export function generateRandomOptions(styleOptions: StyleOptions): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in styleOptions) {
    const option = styleOptions[key];
    if (option) {
      result[key] = getRandomOptionValue(option.values);
    }
  }

  return result;
}
