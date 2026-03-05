// import fs from 'fs/promises';
// import { jsonSchemaToZod } from 'json-schema-to-zod';
// import openapiTS from 'openapi-typescript';
//
// async function generateZodSchemas() {
//   // 1. Сначала парсим OpenAPI и получаем JSON схемы
//   // const spec = JSON.parse(await fs.readFile('./swagger.json', 'utf-8'));
//   const response = await fetch('https://petstore.swagger.io/v2/swagger.json');
//   const spec = await response.json();
//
//   let schemasFile = `// Auto-generated from OpenAPI spec
// import { z } from 'zod';\n\n`;
//
//   // 2. Для каждой схемы в OpenAPI
//   for (const [name, schema] of Object.entries(spec.components?.schemas || {})) {
//     try {
//       // Конвертируем JSON schema в Zod код
//       const zodCode = jsonSchemaToZod(schema, {
//         module: 'esm',
//         noImport: true,
//       });
//
//       schemasFile += `// ${name}\n`;
//       schemasFile += `export const ${name}Schema = ${zodCode};\n`;
//       schemasFile += `export type ${name} = z.infer<typeof ${name}Schema>;\n\n`;
//     } catch (e) {
//       console.error(`Ошибка при конвертации ${name}:`, e);
//     }
//   }
//
//   // 3. Сохраняем
//   await fs.writeFile('./src/generated/schemas.ts', schemasFile);
//
//   // 4. Также генерируем обычные TS типы (на всякий случай)
//   const tsTypes = await openapiTS('./swagger.json');
//   await fs.writeFile('./src/generated/types.ts', tsTypes);
// }
//
// generateZodSchemas();
