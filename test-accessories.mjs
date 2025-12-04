import { avataaars } from '@dicebear/collection';

// Log the accessories schema
const schema = avataaars.schema.properties;
console.log('avataaars schema properties keys:', Object.keys(schema));
console.log('\naccessories property:', JSON.stringify(schema.accessories, null, 2));
console.log('\nIs it in the schema?', 'accessories' in schema);
